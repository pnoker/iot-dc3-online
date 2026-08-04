<script setup lang="ts">
/**
 * 招牌①:管网 GIS 数字孪生(纯 SVG 手绘,布局完全可控)。
 * 管段按压力梯度着色 蓝(高)→绿→琥珀→红(低/漏损),
 * 漏损点红色脉冲(CSS 动画),DMA 分区半透明多边形,水厂/泵站散点。
 * 压力由 5 路 useDomainSeries 缓慢漂移,管段在色带边界处微妙变色(实时感)。
 */
import {computed, ref, onMounted} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = !import.meta.env.SSR && matchMedia('(prefers-reduced-motion: reduce)').matches
})

// 5 个压力区(主干 + 4 个 DMA),各一路乘性慢漂移(baseline=1,cycleAmp 小)。
const zoneDrift = {
  trunk: useDomainSeries({baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 110), cycleAmp: 0.05, noiseAmp: 0.008}, {seed: 11, window: 2}).current,
  dma1: useDomainSeries({baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 95 + 1.1), cycleAmp: 0.07, noiseAmp: 0.01}, {seed: 12, window: 2}).current,
  dma2: useDomainSeries({baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 100 + 2.3), cycleAmp: 0.08, noiseAmp: 0.01}, {seed: 13, window: 2}).current,
  dma3: useDomainSeries({baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90 + 3.7), cycleAmp: 0.09, noiseAmp: 0.012}, {seed: 14, window: 2}).current,
  dma4: useDomainSeries({baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 105 + 4.9), cycleAmp: 0.08, noiseAmp: 0.012}, {seed: 15, window: 2}).current,
}

// 管段:x1,y1,x2,y2,base(0..1 基准压力,离水源越远/漏损越严重越低),zone(漂移耦合),w(线宽)。
interface Seg {x1: number; y1: number; x2: number; y2: number; base: number; zone: keyof typeof zoneDrift; w: number}
const SEGS: Seg[] = [
  // 主干(水源→东),压力自西向东递减
  {x1: 55, y1: 80, x2: 180, y2: 80, base: 0.96, zone: 'trunk', w: 8},
  {x1: 180, y1: 80, x2: 350, y2: 80, base: 0.82, zone: 'trunk', w: 8},
  {x1: 350, y1: 80, x2: 520, y2: 80, base: 0.66, zone: 'trunk', w: 8},
  {x1: 520, y1: 80, x2: 595, y2: 80, base: 0.52, zone: 'trunk', w: 6},
  // 泵站下行支管
  {x1: 180, y1: 80, x2: 180, y2: 200, base: 0.74, zone: 'dma1', w: 6},
  {x1: 350, y1: 80, x2: 350, y2: 200, base: 0.60, zone: 'dma2', w: 6},
  {x1: 520, y1: 80, x2: 520, y2: 200, base: 0.48, zone: 'dma3', w: 6},
  // DMA-1 配水环
  {x1: 90, y1: 200, x2: 270, y2: 200, base: 0.68, zone: 'dma1', w: 5},
  {x1: 180, y1: 200, x2: 180, y2: 250, base: 0.58, zone: 'dma1', w: 5},
  // DMA-2 配水环
  {x1: 280, y1: 200, x2: 450, y2: 200, base: 0.54, zone: 'dma2', w: 5},
  {x1: 350, y1: 200, x2: 350, y2: 250, base: 0.44, zone: 'dma2', w: 5},
  // DMA-3 配水环
  {x1: 460, y1: 200, x2: 595, y2: 200, base: 0.40, zone: 'dma3', w: 5},
  {x1: 520, y1: 200, x2: 520, y2: 250, base: 0.34, zone: 'dma3', w: 5},
  // DMA-4 底部馈水(最远端,压力最低)
  {x1: 250, y1: 250, x2: 250, y2: 330, base: 0.36, zone: 'dma4', w: 5},
  {x1: 330, y1: 250, x2: 330, y2: 330, base: 0.34, zone: 'dma4', w: 5},
  {x1: 170, y1: 330, x2: 490, y2: 330, base: 0.30, zone: 'dma4', w: 5},
]

// DMA 分区多边形(zone 用于取该区平均压力带做填色)。
const ZONES = [
  {key: 'dma1', name: 'DMA-01', pts: '90,150 270,150 280,250 90,250', zone: 'dma1' as const, cxC: 175, cyC: 200},
  {key: 'dma2', name: 'DMA-02', pts: '290,150 450,150 450,250 280,250', zone: 'dma2' as const, cxC: 365, cyC: 200},
  {key: 'dma3', name: 'DMA-03', pts: '460,150 600,150 600,250 460,250', zone: 'dma3' as const, cxC: 530, cyC: 200},
  {key: 'dma4', name: 'DMA-04', pts: '160,290 500,290 480,390 180,390', zone: 'dma4' as const, cxC: 330, cyC: 340},
]

// 漏损点:位置 + 漏损量,严重度 0..1。
const LEAKS = [
  {x: 135, y: 200, m3h: 6.8, dma: 'DMA-01', sev: 0.7},
  {x: 400, y: 200, m3h: 9.2, dma: 'DMA-02', sev: 0.8},
  {x: 560, y: 200, m3h: 14.5, dma: 'DMA-03', sev: 1.0},
  {x: 300, y: 330, m3h: 11.3, dma: 'DMA-04', sev: 0.9},
  {x: 215, y: 225, m3h: 3.1, dma: 'DMA-01', sev: 0.4},
]

// 水厂 + 泵站节点。
const NODES = [
  {x: 55, y: 80, name: t('水厂', 'WTP'), kind: 'plant', zone: 'trunk' as const},
  {x: 180, y: 80, name: t('1#泵站', 'PS-1'), kind: 'pump', zone: 'trunk' as const},
  {x: 350, y: 80, name: t('2#泵站', 'PS-2'), kind: 'pump', zone: 'trunk' as const},
  {x: 520, y: 80, name: t('3#泵站', 'PS-3'), kind: 'pump', zone: 'trunk' as const},
]

// 压力→颜色(4 段语义色,固定 hex,SVG 不走 BaseChart 主题)。
function pColor(p: number): string {
  if (p >= 0.72) return '#2b9bff'
  if (p >= 0.55) return '#00e676'
  if (p >= 0.38) return '#ffa726'
  return '#ff5252'
}
function zoneAvgP(z: keyof typeof zoneDrift): number {
  const drift = zoneDrift[z].value
  // 取该区管段 base 的均值代表分区压力
  const bases = SEGS.filter((s) => s.zone === z).map((s) => s.base)
  const avg = bases.reduce((a, b) => a + b, 0) / (bases.length || 1)
  return Math.max(0.05, Math.min(0.99, avg * drift))
}

const segs = computed(() =>
  SEGS.map((s) => {
    const p = Math.max(0.05, Math.min(0.99, s.base * zoneDrift[s.zone].value))
    return {...s, p, color: pColor(p)}
  }),
)
const zones = computed(() =>
  ZONES.map((z) => {
    const p = zoneAvgP(z.zone)
    return {...z, color: pColor(p)}
  }),
)
const nodes = computed(() =>
  NODES.map((n) => {
    const p = n.kind === 'plant' ? 0.97 : zoneAvgP('trunk')
    return {...n, color: pColor(p)}
  }),
)

const LEGEND = [
  {c: '#2b9bff', label: t('高压', 'High')},
  {c: '#00e676', label: t('正常', 'Normal')},
  {c: '#ffa726', label: t('偏低', 'Low')},
  {c: '#ff5252', label: t('漏损', 'Leak')},
]

const accessibleTitle = computed(() => t('管网 GIS 数字孪生示意图', 'Pipe-network GIS digital twin'))
</script>

<template>
  <div class="pixmap" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 640 410" preserveAspectRatio="xMidYMid meet" class="pixmap__svg">
      <!-- DMA 分区多边形 -->
      <polygon
        v-for="z in zones"
        :key="z.key"
        :points="z.pts"
        :fill="z.color"
        fill-opacity="0.08"
        :stroke="z.color"
        stroke-opacity="0.45"
        stroke-width="1"
        stroke-dasharray="4 3"
      />
      <text
        v-for="z in zones"
        :key="'t' + z.key"
        :x="z.cxC"
        :y="z.cyC"
        class="pixmap__zlabel"
        text-anchor="middle"
      >{{ z.name }}</text>

      <!-- 管段 -->
      <line
        v-for="(s, i) in segs"
        :key="'s' + i"
        :x1="s.x1" :y1="s.y1" :x2="s.x2" :y2="s.y2"
        :stroke="s.color"
        :stroke-width="s.w"
        stroke-linecap="round"
        :style="{filter: 'drop-shadow(0 0 3px ' + (s.color) + ')'}"
      />

      <!-- 漏损点脉冲 -->
      <g
        v-for="(lk, i) in LEAKS"
        :key="'l' + i"
        :transform="`translate(${lk.x} ${lk.y})`"
        class="pixmap__leak"
        :class="{still: reducedMotion}"
      >
        <circle r="3.5" :fill="lk.sev >= 0.8 ? '#ff5252' : '#ffa726'" />
        <circle
          r="4"
          fill="none"
          :stroke="lk.sev >= 0.8 ? '#ff5252' : '#ffa726'"
          stroke-width="1.5"
          class="pixmap__ring"
          :class="{still: reducedMotion}"
        />
        <text y="-10" class="pixmap__leak-txt" text-anchor="middle">{{ lk.m3h }} m³/h</text>
      </g>

      <!-- 水厂/泵站节点 -->
      <g v-for="(n, i) in nodes" :key="'n' + i" :transform="`translate(${n.x} ${n.y})`">
        <rect
          v-if="n.kind === 'plant'"
          x="-12" y="-12" width="24" height="24" rx="3"
          :fill="n.color" fill-opacity="0.25"
          :stroke="n.color" stroke-width="2"
          :style="{filter: 'drop-shadow(0 0 6px ' + (n.color) + ')'}"
        />
        <circle
          v-else
          r="9"
          :fill="n.color" fill-opacity="0.25"
          :stroke="n.color" stroke-width="2"
          :style="{filter: 'drop-shadow(0 0 6px ' + (n.color) + ')'}"
        />
        <text y="-16" class="pixmap__nlabel" text-anchor="middle">{{ n.name }}</text>
      </g>
    </svg>

    <!-- 图例 -->
    <div class="pixmap__legend">
      <span v-for="(lg, i) in LEGEND" :key="i" class="pixmap__lg">
        <i :style="{background: lg.c, boxShadow: '0 0 6px ' + (lg.c)}" />{{ lg.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.pixmap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
}
.pixmap__svg {
  flex: 1;
  min-height: 0;
  width: 100%;
}
.pixmap__zlabel {
  fill: rgba(212, 236, 255, 0.35);
  font-size: 11px;
  letter-spacing: 1px;
  font-family: var(--dc3d-mono, monospace);
  pointer-events: none;
}
.pixmap__nlabel {
  fill: #d4ecff;
  font-size: 11px;
  font-weight: 600;
}
.pixmap__leak-txt {
  fill: #ff8a8a;
  font-size: 9px;
  font-family: var(--dc3d-mono, monospace);
}
.pixmap__ring {
  transform-box: fill-box;
  transform-origin: center;
  animation: pixmap-pulse 1.8s ease-out infinite;
}
.pixmap__ring.still {
  animation: none;
}
@keyframes pixmap-pulse {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(4); opacity: 0; }
}
.pixmap__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 2px 4px;
  flex-shrink: 0;
}
.pixmap__lg {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--dc3d-text-dim);
}
.pixmap__lg i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
