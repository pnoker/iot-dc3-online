<script setup lang="ts">
/**
 * 招牌①:冷藏车队运输轨迹温层(纯 SVG 手绘,布局完全可控)。
 * 简化地图底(省域轮廓多边形 + 经纬网格) + 分拨中心 + 目的城市节点
 * + 车队轨迹二次贝塞尔曲线(按温层着色:冷藏青/冷冻蓝/恒温绿),
 * 虚线沿路径流动(CSS stroke-dashoffset 动画)模拟行驶方向,
 * 车辆定位点取贝塞尔参数点着色,断链点红色脉冲(CSS 动画)。
 * ECharts graph cartesian2d 在矮容器坐标难控,故优先纯 SVG/CSS 手绘。
 */
import {computed, ref, onMounted} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = !import.meta.env.SSR && matchMedia('(prefers-reduced-motion: reduce)').matches
})

// 温层语义色(固定 hex,SVG 不走 BaseChart 主题)。
const CYAN = '#00e5ff' // 冷藏
const BLUE = '#2b9bff' // 冷冻
const GREEN = '#00e676' // 恒温
const RED = '#ff5252' // 断链

// 发光 filter 样式(JS 拼接完整字符串,规避 :style 反引号/含括号字面量解析歧义)
function glow(c: string, r = 3) {
  return {filter: 'drop-shadow(0 0 ' + r + 'px ' + c + ')'}
}

// 二次贝塞尔参数点 B(t)=(1-t)^2·P0 + 2(1-t)t·P1 + t^2·P2
function bez(p0: [number, number], p1: [number, number], p2: [number, number], t: number): [number, number] {
  const mt = 1 - t
  return [mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0], mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1]]
}

const DC: [number, number] = [70, 205] // 分拨中心

interface Route {
  key: string
  layer: 'chilled' | 'frozen' | 'constant'
  color: string
  ctrl: [number, number]
  dest: [number, number]
  destName: string
  driftSeed: number
}
const ROUTES: Route[] = [
  {key: 'r1', layer: 'chilled', color: CYAN, ctrl: [250, 95], dest: [470, 120], destName: t('华北仓', 'North Hub'), driftSeed: 21},
  {key: 'r2', layer: 'frozen', color: BLUE, ctrl: [200, 270], dest: [460, 295], destName: t('华南仓', 'South Hub'), driftSeed: 22},
  {key: 'r3', layer: 'constant', color: GREEN, ctrl: [360, 165], dest: [600, 205], destName: t('华东仓', 'East Hub'), driftSeed: 23},
  {key: 'r4', layer: 'chilled', color: CYAN, ctrl: [330, 305], dest: [565, 345], destName: t('西南仓', 'SW Hub'), driftSeed: 24},
]

// 每条线路径中段进度 t 由 useDomainSeries 缓慢推进(0..1 循环),驱动车辆标记点位移
const drifts = ROUTES.map((r) =>
  useDomainSeries(
    {baseline: 0.5, unit: '', cycleMode: 'multiplicative', cycle: (s) => 0.5 * Math.sin(s / (12 + r.driftSeed)), cycleAmp: 0.9, noiseAmp: 0.02},
    {intervalMs: 1500, window: 2, seed: r.driftSeed},
  ).current,
)

const pathD = (r: Route) =>
  'M ' + DC[0] + ' ' + DC[1] + ' Q ' + r.ctrl[0] + ' ' + r.ctrl[1] + ' ' + r.dest[0] + ' ' + r.dest[1]

// 车辆定位点:每条线 2 辆,主车随 drift t 移动,辅车固定在 0.78
const vehicles = computed(() =>
  ROUTES.map((r, i) => {
    const tRaw = drifts[i].value
    const t1 = Math.max(0.05, Math.min(0.95, tRaw))
    const p1 = bez(DC, r.ctrl, r.dest, t1)
    const p2 = bez(DC, r.ctrl, r.dest, 0.78)
    return {key: r.key, color: r.color, layer: r.layer, lead: p1, trail: p2}
  }),
)

// 断链点:固定位置 + 严重度
const BREAKS = [
  {x: 300, y: 130, sev: 0.8, txt: t('门封漏温', 'Door leak')},
  {x: 415, y: 250, sev: 1.0, txt: t('制冷失效', 'Reefer down')},
  {x: 510, y: 175, sev: 0.6, txt: t('延时 38min', 'Delay 38m')},
]

const LEGEND = [
  {c: CYAN, label: t('冷藏 2~8℃', 'Chilled 2~8℃')},
  {c: BLUE, label: t('冷冻 -25~-18℃', 'Frozen -25~-18℃')},
  {c: GREEN, label: t('恒温 15~20℃', 'Constant 15~20℃')},
  {c: RED, label: t('断链', 'Break')},
]

const accessibleTitle = computed(() => t('冷藏车队运输轨迹温层示意图', 'Reefer fleet trajectory by cold-layer'))
</script>

<template>
  <div class="fmap" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet" class="fmap__svg">
      <!-- 经纬网格(地图底纹) -->
      <g class="fmap__grid">
        <line v-for="gx in [160,320,480]" :key="'gx'+gx" :x1="gx" y1="30" :x2="gx" y2="380" />
        <line v-for="gy in [110,205,300]" :key="'gy'+gy" x1="30" :y1="gy" x2="620" :y2="gy" />
      </g>
      <!-- 省域轮廓(简化地图底,半透明) -->
      <polygon
        points="55,70 200,45 360,55 520,70 610,140 590,260 540,340 420,375 280,365 140,340 60,260 45,160"
        fill="rgba(0,229,255,0.04)" stroke="rgba(0,229,255,0.25)" stroke-width="1.2"
        stroke-dasharray="5 4"
      />

      <!-- 车队轨迹(按温层着色 + 流动虚线) -->
      <path
        v-for="r in ROUTES"
        :key="r.key"
        :d="pathD(r)"
        fill="none"
        :stroke="r.color"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-opacity="0.55"
        stroke-dasharray="7 6"
        :class="['fmap__flow', {still: reducedMotion}]"
        :style="glow(r.color, 2)"
      />

      <!-- 车辆定位点(按温层着色) -->
      <g v-for="v in vehicles" :key="v.key">
        <circle :cx="v.trail[0]" :cy="v.trail[1]" r="3" :fill="v.color" fill-opacity="0.45" />
        <g :transform="'translate(' + v.lead[0] + ' ' + v.lead[1] + ')'" :style="glow(v.color, 4)">
          <circle r="4.5" :fill="v.color" fill-opacity="0.9" />
          <circle r="7" fill="none" :stroke="v.color" stroke-width="1" stroke-opacity="0.5" />
        </g>
      </g>

      <!-- 断链点红色脉冲 -->
      <g
        v-for="(b, i) in BREAKS"
        :key="'b'+i"
        :transform="'translate(' + b.x + ' ' + b.y + ')'"
      >
        <circle r="3.5" fill="#ff5252" />
        <circle
          r="4"
          fill="none"
          stroke="#ff5252"
          stroke-width="1.5"
          class="fmap__ring"
          :class="{still: reducedMotion}"
        />
        <text y="-10" class="fmap__btxt" text-anchor="middle">{{ b.txt }}</text>
      </g>

      <!-- 分拨中心节点 -->
      <g :transform="'translate(' + DC[0] + ' ' + DC[1] + ')'">
        <rect x="-13" y="-13" width="26" height="26" rx="3" :fill="CYAN" fill-opacity="0.25" :stroke="CYAN" stroke-width="2" :style="glow(CYAN, 6)" />
        <text y="-20" class="fmap__nlabel" text-anchor="middle">{{ t('分拨中心', 'DC') }}</text>
      </g>
      <!-- 目的城市节点 -->
      <g v-for="r in ROUTES" :key="'d'+r.key" :transform="'translate(' + r.dest[0] + ' ' + r.dest[1] + ')'">
        <circle r="7" :fill="r.color" fill-opacity="0.25" :stroke="r.color" stroke-width="2" :style="glow(r.color, 5)" />
        <text y="-14" class="fmap__nlabel" text-anchor="middle">{{ r.destName }}</text>
      </g>
    </svg>

    <div class="fmap__legend">
      <span v-for="(lg, i) in LEGEND" :key="i" class="fmap__lg">
        <i :style="{background: lg.c, boxShadow: '0 0 6px ' + (lg.c)}" />{{ lg.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.fmap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
}
.fmap__svg {
  flex: 1;
  min-height: 0;
  width: 100%;
}
.fmap__grid line {
  stroke: rgba(0, 229, 255, 0.06);
  stroke-width: 1;
}
.fmap__nlabel {
  fill: #d4ecff;
  font-size: 11px;
  font-weight: 600;
}
.fmap__btxt {
  fill: #ff8a8a;
  font-size: 9px;
  font-family: var(--dc3d-mono, monospace);
}
.fmap__flow {
  animation: fmap-flow 1.1s linear infinite;
}
.fmap__flow.still {
  animation: none;
}
@keyframes fmap-flow {
  to { stroke-dashoffset: -26; }
}
.fmap__ring {
  transform-box: fill-box;
  transform-origin: center;
  animation: fmap-pulse 1.8s ease-out infinite;
}
.fmap__ring.still {
  animation: none;
}
@keyframes fmap-pulse {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(4); opacity: 0; }
}
.fmap__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 2px 4px;
  flex-shrink: 0;
}
.fmap__lg {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--dc3d-text-dim);
}
.fmap__lg i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
