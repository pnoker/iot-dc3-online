<script setup lang="ts">
/**
 * 招牌①:管线纵断面与水力坡降(纯 SVG 手绘,领域独有)。
 * X = 里程桩号(km 0→320),双纵轴:左=地形海拔(m),右=运行压力(MPa)。
 * 四条信息层:
 *   ① 地形海拔剖面(棕褐色填充折线 —— 管道所经地表起伏)
 *   ② 运行压力曲线(青色,两座压气站间摩擦衰减 → 压气站 boostsawtooth)
 *   ③ MAOP 红色包络线(最大允许操作压力,管材设计上限,恒值 9.0 MPa)
 *   ④ 水力坡降线(琥珀点线,两压气站出口至下一站入口的纯摩擦梯度直线)
 * 节点:首站(CS-1)/ 中间压气站(CS-2)/ 末站分输站(gate station)。
 * 压力由全局慢漂移乘子驱动(±3%),MAOP 恒定,水力坡降同步缓变 —— 实时感。
 */
import {computed, ref, onMounted} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = !import.meta.env.SSR && matchMedia('(prefers-reduced-motion: reduce)').matches
})

// 压力漂移乘子(baseline=1,小 cycleAmp),所有压力点同步缓变。
const pDrift = useDomainSeries(
  {baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 120), cycleAmp: 0.03, noiseAmp: 0.006},
  {seed: 201, window: 2},
).current

// 桩号采样点(km)
const KM = [0, 40, 80, 120, 160, 200, 240, 280, 320]
// 地形海拔(m):丘陵起伏 420-860
const ELEV = [420, 580, 720, 640, 860, 700, 540, 610, 480]
// 运行压力(MPa):CS-1 出口 8.6 → 摩擦衰减 → CS-2 入口 5.2 → boost 8.4 → 衰减 → 末站 4.8
// (km160 处为 CS-2,前一值=入口 5.2,后值=出口 8.4)
const P_IN = [8.6, 7.9, 7.0, 6.0, 5.2] // CS-1 段(km 0..160)
const P_OUT = [8.4, 7.6, 6.6, 5.6, 4.8] // CS-2 段(km 160..320)
const MAOP = 9.0

// SVG 坐标映射(viewBox 0 0 720 340)
// 绘图区 x: 60..700(宽 640),y: 40..270(高 230)
const PX0 = 60
const PX1 = 700
const PY0 = 40
const PY1 = 270
const KM_MAX = 320
function xPx(km: number) {
  return PX0 + (km / KM_MAX) * (PX1 - PX0)
}
// 海拔 200..900 m → py 270..40
function elevPy(e: number) {
  return PY1 - ((e - 200) / 700) * (PY1 - PY0)
}
// 压力 0..10 MPa → py 270..40
function pPy(p: number) {
  return PY1 - (p / 10) * (PY1 - PY0)
}

// 地形折线点(固定)
const elevPts = computed(() => KM.map((k, i) => ({x: xPx(k), y: elevPy(ELEV[i])})))
const elevPath = computed(() => elevPts.value.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' '))
// 地形填充(折线 + 下到底部闭合)
const elevFill = computed(() => elevPath.value + ' L ' + PX1 + ' ' + PY1 + ' L ' + PX0 + ' ' + PY1 + ' Z')

// 压力曲线(漂移乘子作用)
const seg1Pts = computed(() => {
  const k = pDrift.value
  return KM.slice(0, 5).map((km, i) => ({x: xPx(km), y: pPy(Math.max(0.5, P_IN[i] * k))}))
})
const seg2Pts = computed(() => {
  const k = pDrift.value
  return KM.slice(4).map((km, i) => ({x: xPx(km), y: pPy(Math.max(0.5, P_OUT[i] * k))}))
})
function toPath(pts: {x: number; y: number}[]) {
  return pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ')
}
const seg1Path = computed(() => toPath(seg1Pts.value))
const seg2Path = computed(() => toPath(seg2Pts.value))

// 水力坡降(两段直线:站出口 → 下站入口)
const grad1 = computed(() => {
  const a = seg1Pts.value[0]
  const b = seg1Pts.value[seg1Pts.value.length - 1]
  return 'M' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ' L' + b.x.toFixed(1) + ' ' + b.y.toFixed(1)
})
const grad2 = computed(() => {
  const a = seg2Pts.value[0]
  const b = seg2Pts.value[seg2Pts.value.length - 1]
  return 'M' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ' L' + b.x.toFixed(1) + ' ' + b.y.toFixed(1)
})

// MAOP 恒值线
const maopY = pPy(MAOP)

// 站场:CS-1(km0)、CS-2(km160)、末站(km320),压力取该站出口/入口值。
const stations = computed(() => {
  const k = pDrift.value
  return [
    {x: xPx(0), y: pPy(P_IN[0] * k), name: t('首站 CS-1', 'CS-1 Origin'), p: +(P_IN[0] * k).toFixed(2)},
    {x: xPx(160), y: pPy(P_OUT[0] * k), name: t('压气站 CS-2', 'CS-2 Compressor'), p: +(P_OUT[0] * k).toFixed(2)},
    {x: xPx(320), y: pPy(P_OUT[4] * k), name: t('末站分输', 'Gate Station'), p: +(P_OUT[4] * k).toFixed(2)},
  ]
})

// 桩号刻度(每 40 km)
const stakes = KM.map((k) => ({x: xPx(k), km: k}))

const LEGEND = [
  {c: '#8a6a3a', label: t('地形海拔', 'Terrain')},
  {c: '#00e5ff', label: t('运行压力', 'Pressure')},
  {c: '#ff5252', label: t('MAOP 包络', 'MAOP')},
  {c: '#ffb020', label: t('水力坡降', 'Hydr. Gradient')},
]
const accessibleTitle = computed(() => t('天然气管线纵断面与水力坡降示意图', 'Gas pipeline longitudinal profile and hydraulic gradient'))
</script>

<template>
  <div class="ogprof" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 720 340" preserveAspectRatio="xMidYMid meet" class="ogprof__svg">
      <!-- 网格(水平) -->
      <g stroke="rgba(0,229,255,0.08)" stroke-width="1">
        <line v-for="gy in [40,97,154,211,270]" :key="'g'+gy" :x1="PX0" :y1="gy" :x2="PX1" :y2="gy" />
      </g>
      <!-- 左纵轴:海拔 m -->
      <text :x="PX0 - 6" :y="PY0 - 4" class="ogprof__axis" text-anchor="start">{{ t('海拔 m', 'Elev. m') }}</text>
      <text :x="PX0 - 8" :y="PY0 + 4" class="ogprof__tick">900</text>
      <text :x="PX0 - 8" :y="PY1" class="ogprof__tick">200</text>
      <!-- 右纵轴:压力 MPa -->
      <text :x="PX1 + 4" :y="PY0 - 4" class="ogprof__axis" text-anchor="start">{{ t('压力 MPa', 'Press. MPa') }}</text>
      <text :x="PX1 + 4" :y="PY0 + 4" class="ogprof__tick">10</text>
      <text :x="PX1 + 4" :y="PY1" class="ogprof__tick">0</text>

      <!-- ① 地形海拔填充 -->
      <path :d="elevFill" fill="rgba(138,106,58,0.22)" stroke="none" />
      <path :d="elevPath" fill="none" stroke="#8a6a3a" stroke-width="1.8" stroke-opacity="0.9" />

      <!-- ③ MAOP 红色包络线 -->
      <line :x1="PX0" :y1="maopY" :x2="PX1" :y2="maopY" stroke="#ff5252" stroke-width="1.6" stroke-dasharray="7 4" opacity="0.85" />
      <text :x="PX1 - 4" :y="maopY - 5" class="ogprof__maop" text-anchor="end">MAOP {{ MAOP.toFixed(1) }} MPa</text>

      <!-- ④ 水力坡降(琥珀点线) -->
      <path :d="grad1" fill="none" stroke="#ffb020" stroke-width="1.4" stroke-dasharray="2 4" opacity="0.8" />
      <path :d="grad2" fill="none" stroke="#ffb020" stroke-width="1.4" stroke-dasharray="2 4" opacity="0.8" />

      <!-- ② 运行压力曲线(青色,两段) -->
      <path :d="seg1Path" fill="none" stroke="#00e5ff" stroke-width="2.4" stroke-linecap="round" :style="{filter: 'drop-shadow(0 0 3px #00e5ff)'}" />
      <path :d="seg2Path" fill="none" stroke="#00e5ff" stroke-width="2.4" stroke-linecap="round" :style="{filter: 'drop-shadow(0 0 3px #00e5ff)'}" />
      <!-- 压气站 boost 垂直跃升 -->
      <line :x1="xPx(160)" :y1="pPy(Math.max(0.5, P_IN[4] * pDrift))" :x2="xPx(160)" :y2="pPy(Math.max(0.5, P_OUT[0] * pDrift))" stroke="#00e5ff" stroke-width="2.4" stroke-dasharray="3 3" opacity="0.7" />

      <!-- 桩号刻度 -->
      <g>
        <text v-for="(s, i) in stakes" :key="'k'+i" :x="s.x" :y="PY1 + 16" class="ogprof__stake" text-anchor="middle">{{ s.km }}</text>
      </g>
      <text :x="(PX0 + PX1) / 2" :y="PY1 + 32" class="ogprof__axis" text-anchor="middle">{{ t('里程桩号 km', 'Mileage stake km') }}</text>

      <!-- 站场节点 -->
      <g v-for="(st, i) in stations" :key="'st'+i">
        <circle :cx="st.x" :cy="st.y" r="5" fill="#00e5ff" fill-opacity="0.3" stroke="#00e5ff" stroke-width="1.8" :style="{filter: 'drop-shadow(0 0 5px #00e5ff)'}" />
        <text :x="st.x" :y="st.y - 10" class="ogprof__stname" text-anchor="middle">{{ st.name }}</text>
        <text :x="st.x" :y="st.y + 18" class="ogprof__stp" text-anchor="middle">{{ st.p }} MPa</text>
      </g>
    </svg>

    <!-- 图例 -->
    <div class="ogprof__legend">
      <span v-for="(lg, i) in LEGEND" :key="i" class="ogprof__lg">
        <i :style="{background: lg.c, boxShadow: '0 0 6px ' + (lg.c)}" />{{ lg.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.ogprof {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
}
.ogprof__svg {
  flex: 1;
  min-height: 0;
  width: 100%;
}
.ogprof__axis {
  fill: #6b8cae;
  font-size: 10px;
  letter-spacing: 0.5px;
  font-family: var(--dc3d-mono, monospace);
}
.ogprof__tick {
  fill: #6b8cae;
  font-size: 9px;
  font-family: var(--dc3d-mono, monospace);
}
.ogprof__stake {
  fill: #6b8cae;
  font-size: 9px;
  font-family: var(--dc3d-mono, monospace);
}
.ogprof__maop {
  fill: #ff8a8a;
  font-size: 10px;
  font-weight: 600;
  font-family: var(--dc3d-mono, monospace);
}
.ogprof__stname {
  fill: #d4ecff;
  font-size: 10px;
  font-weight: 600;
}
.ogprof__stp {
  fill: #00e5ff;
  font-size: 9px;
  font-weight: 600;
  font-family: var(--dc3d-mono, monospace);
}
.ogprof__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 2px 4px;
  flex-shrink: 0;
}
.ogprof__lg {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--dc3d-text-dim);
}
.ogprof__lg i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
