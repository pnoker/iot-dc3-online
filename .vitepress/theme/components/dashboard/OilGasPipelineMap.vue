<script setup lang="ts">
/**
 * 招牌③:管网 GIS 流向(纯 SVG 手绘,领域独有)。
 * 天然气集输管网走向:气田井场 → 集气站 → 净化厂(脱硫脱碳) → 首站(CS-1)
 *                   → 干线(多座阀室) → 分输站 → 城市门站。
 * 干线按压力梯度着色(蓝高→绿→琥珀→红低),流向用 CSS 流动虚线粒子(表示天然气流向)。
 * 阀室为菱形,站场为圆/方,净化厂为双圆(脱硫塔);越站/越压点红色脉冲。
 * 压力由各段 useDomainSeries 缓慢漂移,管段在色带边界处微妙变色(实时感)。
 */
import {computed, ref, onMounted} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = !import.meta.env.SSR && matchMedia('(prefers-reduced-motion: reduce)').matches
})

// 5 个管段压力漂移(baseline=1,小 cycleAmp)。
const drift = {
  gather: useDomainSeries({baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 110), cycleAmp: 0.06, noiseAmp: 0.01}, {seed: 21, window: 2}).current,
  trunk1: useDomainSeries({baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 95 + 1.1), cycleAmp: 0.04, noiseAmp: 0.008}, {seed: 22, window: 2}).current,
  trunk2: useDomainSeries({baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 100 + 2.3), cycleAmp: 0.05, noiseAmp: 0.01}, {seed: 23, window: 2}).current,
  trunk3: useDomainSeries({baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90 + 3.7), cycleAmp: 0.06, noiseAmp: 0.012}, {seed: 24, window: 2}).current,
  city: useDomainSeries({baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 105 + 4.9), cycleAmp: 0.07, noiseAmp: 0.012}, {seed: 25, window: 2}).current,
}

// 管段:x1,y1,x2,y2,base(0..1 基准压力),seg(漂移耦合),w 线宽
interface Seg {x1: number; y1: number; x2: number; y2: number; base: number; seg: keyof typeof drift; w: number}
const SEGS: Seg[] = [
  // 井场→集气站(低压集气,压力低)
  {x1: 50, y1: 110, x2: 150, y2: 110, base: 0.42, seg: 'gather', w: 5},
  {x1: 50, y1: 170, x2: 150, y2: 170, base: 0.38, seg: 'gather', w: 5},
  {x1: 50, y1: 230, x2: 150, y2: 230, base: 0.35, seg: 'gather', w: 5},
  // 集气站→净化厂(汇合,升压)
  {x1: 150, y1: 110, x2: 240, y2: 150, base: 0.50, seg: 'gather', w: 5},
  {x1: 150, y1: 170, x2: 240, y2: 150, base: 0.48, seg: 'gather', w: 4},
  {x1: 150, y1: 230, x2: 240, y2: 150, base: 0.45, seg: 'gather', w: 4},
  // 净化厂→首站(出站高压)
  {x1: 240, y1: 150, x2: 330, y2: 150, base: 0.88, seg: 'trunk1', w: 7},
  // 干线 首站→分输(逐段衰减)
  {x1: 330, y1: 150, x2: 470, y2: 150, base: 0.74, seg: 'trunk2', w: 7},
  {x1: 470, y1: 150, x2: 600, y2: 150, base: 0.58, seg: 'trunk3', w: 6},
  // 分输→城市门站(末端配气,最低)
  {x1: 600, y1: 150, x2: 660, y2: 110, base: 0.42, seg: 'city', w: 5},
  {x1: 600, y1: 150, x2: 660, y2: 230, base: 0.40, seg: 'city', w: 5},
]

// 站场节点
const NODES = [
  {x: 50, y: 110, name: t('井场 W-1', 'Well W-1'), kind: 'well'},
  {x: 50, y: 170, name: t('井场 W-2', 'Well W-2'), kind: 'well'},
  {x: 50, y: 230, name: t('井场 W-3', 'Well W-3'), kind: 'well'},
  {x: 150, y: 110, name: t('集气站', 'Gathering'), kind: 'station'},
  {x: 150, y: 170, name: t('集气站', 'Gathering'), kind: 'station'},
  {x: 150, y: 230, name: t('集气站', 'Gathering'), kind: 'station'},
  {x: 240, y: 150, name: t('净化厂', 'Gas Plant'), kind: 'plant'},
  {x: 330, y: 150, name: t('首站 CS-1', 'CS-1 Origin'), kind: 'station'},
  {x: 600, y: 150, name: t('分输站', 'Distribution'), kind: 'station'},
  {x: 660, y: 110, name: t('城市门站', 'City Gate A'), kind: 'gate'},
  {x: 660, y: 230, name: t('城市门站', 'City Gate B'), kind: 'gate'},
]
// 阀室(干线中间,菱形)
const VALVES = [
  {x: 400, y: 150, name: t('阀室 SV-1', 'SV-1')},
  {x: 535, y: 150, name: t('阀室 SV-2', 'SV-2')},
]
// 越压/越站报警点
const ALARMS = [
  {x: 470, y: 150, sev: 0.9, label: t('越压', 'Over-press')},
  {x: 150, y: 230, sev: 0.6, label: t('流量低', 'Low flow')},
]

function pColor(p: number): string {
  if (p >= 0.72) return '#2b9bff'
  if (p >= 0.55) return '#00e676'
  if (p >= 0.38) return '#ffa726'
  return '#ff5252'
}

const segs = computed(() =>
  SEGS.map((s) => {
    const p = Math.max(0.05, Math.min(0.99, s.base * drift[s.seg].value))
    return {...s, p, color: pColor(p)}
  }),
)

const LEGEND = [
  {c: '#2b9bff', label: t('高压', 'High')},
  {c: '#00e676', label: t('正常', 'Normal')},
  {c: '#ffa726', label: t('偏低', 'Low')},
  {c: '#ff5252', label: t('越限', 'Alarm')},
]
const accessibleTitle = computed(() => t('天然气集输管网 GIS 流向示意图', 'Gas gathering & transmission pipeline GIS flow'))
</script>

<template>
  <div class="ogpmap" :class="{still: reducedMotion}" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 720 290" preserveAspectRatio="xMidYMid meet" class="ogpmap__svg">
      <!-- 管段底色(粗,带压力色) -->
      <line
        v-for="(s, i) in segs"
        :key="'sb'+i"
        :x1="s.x1" :y1="s.y1" :x2="s.x2" :y2="s.y2"
        :stroke="s.color" :stroke-width="s.w"
        stroke-linecap="round" stroke-opacity="0.85"
      />
      <!-- 流向粒子(白色虚线流动,表天然气流向:从左井场→右门站) -->
      <line
        v-for="(s, i) in segs"
        :key="'sf'+i"
        :x1="s.x1" :y1="s.y1" :x2="s.x2" :y2="s.y2"
        class="ogpmap__flow"
        :class="s.x2 < s.x1 ? 'ogpmap__flow-rev' : 'ogpmap__flow-fwd'"
      />

      <!-- 站场节点 -->
      <g v-for="(n, i) in NODES" :key="'n'+i">
        <!-- 净化厂:双圆(脱硫塔) -->
        <g v-if="n.kind === 'plant'" :transform="`translate(${n.x} ${n.y})`">
          <circle r="16" fill="rgba(0,229,255,0.18)" stroke="#00e5ff" stroke-width="2" :style="{filter: 'drop-shadow(0 0 6px #00e5ff)'}" />
          <circle r="8" fill="rgba(0,229,255,0.35)" stroke="#00e5ff" stroke-width="1.2" />
          <text y="-22" class="ogpmap__nlabel" text-anchor="middle">{{ n.name }}</text>
        </g>
        <!-- 井场:小三角 -->
        <g v-else-if="n.kind === 'well'" :transform="`translate(${n.x} ${n.y})`">
          <polygon points="-7,7 7,7 0,-8" fill="rgba(57,255,158,0.25)" stroke="#39ff9e" stroke-width="1.6" :style="{filter: 'drop-shadow(0 0 5px #39ff9e)'}" />
          <text y="22" class="ogpmap__slabel" text-anchor="middle">{{ n.name }}</text>
        </g>
        <!-- 首站/分输:方 -->
        <g v-else-if="n.kind === 'station'" :transform="`translate(${n.x} ${n.y})`">
          <rect x="-10" y="-10" width="20" height="20" rx="3" fill="rgba(43,155,255,0.22)" stroke="#2b9bff" stroke-width="1.8" :style="{filter: 'drop-shadow(0 0 5px #2b9bff)'}" />
          <text :y="n.x === 330 ? -18 : 24" class="ogpmap__nlabel" text-anchor="middle">{{ n.name }}</text>
        </g>
        <!-- 城市门站:六边形 -->
        <g v-else :transform="`translate(${n.x} ${n.y})`">
          <polygon points="-10,0 -5,-9 5,-9 10,0 5,9 -5,9" fill="rgba(124,77,255,0.22)" stroke="#7c4dff" stroke-width="1.8" :style="{filter: 'drop-shadow(0 0 5px #7c4dff)'}" />
          <text :y="n.y < 150 ? -16 : 22" class="ogpmap__nlabel" text-anchor="middle">{{ n.name }}</text>
        </g>
      </g>

      <!-- 阀室(菱形) -->
      <g v-for="(v, i) in VALVES" :key="'v'+i" :transform="`translate(${v.x} ${v.y})`">
        <polygon points="0,-7 7,0 0,7 -7,0" fill="rgba(212,236,255,0.15)" stroke="#d4ecff" stroke-width="1.3" />
        <text y="20" class="ogpmap__vlabel" text-anchor="middle">{{ v.name }}</text>
      </g>

      <!-- 报警脉冲点 -->
      <g v-for="(al, i) in ALARMS" :key="'a'+i" :transform="`translate(${al.x} ${al.y})`" class="ogpmap__alarm">
        <circle r="4" :fill="al.sev >= 0.8 ? '#ff5252' : '#ffa726'" />
        <circle r="5" fill="none" :stroke="al.sev >= 0.8 ? '#ff5252' : '#ffa726'" stroke-width="1.4" class="ogpmap__ring" :class="{still: reducedMotion}" />
        <text y="-10" class="ogpmap__alarm-txt" text-anchor="middle">{{ al.label }}</text>
      </g>
    </svg>

    <div class="ogpmap__legend">
      <span v-for="(lg, i) in LEGEND" :key="i" class="ogpmap__lg">
        <i :style="{background: lg.c, boxShadow: '0 0 6px ' + (lg.c)}" />{{ lg.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.ogpmap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
}
.ogpmap__svg {
  flex: 1;
  min-height: 0;
  width: 100%;
}
.ogpmap__nlabel {
  fill: #d4ecff;
  font-size: 10px;
  font-weight: 600;
}
.ogpmap__slabel {
  fill: #6b8cae;
  font-size: 9px;
}
.ogpmap__vlabel {
  fill: #6b8cae;
  font-size: 9px;
  font-family: var(--dc3d-mono, monospace);
}
.ogpmap__alarm-txt {
  fill: #ff8a8a;
  font-size: 9px;
  font-weight: 600;
}
/* 流向粒子:白色短虚线沿管线流动,表天然气流向 */
.ogpmap__flow {
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 4 10;
  opacity: 0.9;
}
.ogpmap__flow-fwd {
  stroke: #ffffff;
  animation: ogpmap-fwd 1s linear infinite;
}
.ogpmap__flow-rev {
  stroke: #ffffff;
  animation: ogpmap-rev 1s linear infinite;
}
@keyframes ogpmap-fwd {
  to { stroke-dashoffset: -14; }
}
@keyframes ogpmap-rev {
  to { stroke-dashoffset: 14; }
}
.ogpmap__ring {
  transform-box: fill-box;
  transform-origin: center;
  animation: ogpmap-pulse 1.8s ease-out infinite;
}
.ogpmap__ring.still {
  animation: none;
}
@keyframes ogpmap-pulse {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(4); opacity: 0; }
}
.ogpmap.still .ogpmap__flow {
  animation: none !important;
}
.ogpmap__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 2px 4px;
  flex-shrink: 0;
}
.ogpmap__lg {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--dc3d-text-dim);
}
.ogpmap__lg i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
