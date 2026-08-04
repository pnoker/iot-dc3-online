<script setup lang="ts">
/**
 * 招牌①:大气网格 GIS 监测(纯 SVG 手绘,布局完全可控)。
 * 城市底图(行政区多边形)+ 监测网格 + 河流;监测站三类分层(国控方/省控圆/微型三角);
 * 风场流线粒子(西北→东南盛行风,CSS stroke-dashoffset 行进动画);
 * 超标站红色涟漪脉冲(AQI>150)。各站 AQI 由 useDomainSeries 缓慢漂移实时着色。
 */
import {computed, ref, onMounted} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = !import.meta.env.SSR && matchMedia('(prefers-reduced-motion: reduce)').matches
})

// AQI 等级配色(GB 3095):优绿/良黄绿/轻度橙/中度橙红/重度红。
function aqiColor(v: number): string {
  if (v <= 50) return '#00e676'
  if (v <= 100) return '#a8e063'
  if (v <= 150) return '#ffa726'
  if (v <= 200) return '#ff7043'
  return '#ff5252'
}

type Kind = 'national' | 'provincial' | 'mini'
interface Station {
  x: number
  y: number
  name: string
  kind: Kind
  aqiBase: number
  seed: number
}

// 10 个监测站:三类分层,自西北(清洁,上风向)向东南(污染累积,下风向)AQI 递增。
const STATIONS: Station[] = [
  {x: 110, y: 86, name: t('国控·开发区', 'Nat·Zone'), kind: 'national', aqiBase: 76, seed: 11},
  {x: 296, y: 68, name: t('国控·城区', 'Nat·City'), kind: 'national', aqiBase: 88, seed: 12},
  {x: 470, y: 116, name: t('国控·工业园', 'Nat·Ind'), kind: 'national', aqiBase: 138, seed: 13},
  {x: 196, y: 168, name: t('省控·新城', 'Prov·New'), kind: 'provincial', aqiBase: 72, seed: 14},
  {x: 372, y: 196, name: t('省控·港区', 'Prov·Port'), kind: 'provincial', aqiBase: 120, seed: 15},
  {x: 528, y: 236, name: t('省控·化工区', 'Prov·Chem'), kind: 'provincial', aqiBase: 166, seed: 16},
  {x: 120, y: 262, name: t('微型·北区', 'Mini·N'), kind: 'mini', aqiBase: 68, seed: 17},
  {x: 262, y: 298, name: t('微型·中心', 'Mini·Ctr'), kind: 'mini', aqiBase: 96, seed: 18},
  {x: 414, y: 326, name: t('微型·南区', 'Mini·S'), kind: 'mini', aqiBase: 144, seed: 19},
  {x: 560, y: 356, name: t('微型·东南', 'Mini·SE'), kind: 'mini', aqiBase: 182, seed: 20},
]

const OVER_LIMIT = 150

// 各站 AQI 乘性慢漂移(幅度按站点基础值:重污染站波动更大)。
const drifts = STATIONS.map((s) => ({
  ref: s,
  val: useDomainSeries(
    {baseline: s.aqiBase, unit: '', cycleMode: 'multiplicative', cycle: (t) => Math.sin(t / 110 + s.seed), cycleAmp: 0.08, noiseAmp: s.aqiBase * 0.015},
    {seed: s.seed, window: 2, intervalMs: 2000},
  ).current,
}))

const stations = computed(() =>
  drifts.map((d) => {
    const aqi = Math.max(5, Math.round(d.val.value))
    return {
      ...d.ref,
      aqi,
      color: aqiColor(aqi),
      over: aqi > OVER_LIMIT,
    }
  }),
)

// 风场流线(盛行西北风,自上左向下右弧形流动)。dash 行进动画模拟粒子流。
const STREAMS = [
  'M 40 36 Q 200 110 360 196 T 600 348',
  'M 70 18 Q 240 96 410 188 T 620 318',
  'M 20 78 Q 170 150 330 232 T 560 388',
  'M 130 12 Q 300 88 470 178 T 624 286',
  'M 18 130 Q 180 200 350 282 T 588 408',
]

// 行政区多边形(示意性 4 区)。
const DISTRICTS = [
  {pts: '40,40 250,30 280,150 60,170', name: t('北区', 'North')},
  {pts: '260,30 470,50 460,180 280,150', name: t('中区', 'Central')},
  {pts: '470,50 610,90 600,240 460,180', name: t('东区', 'East')},
  {pts: '60,180 460,200 600,260 560,390 80,380', name: t('南区', 'South')},
]

// 河流(自西北向东南穿城)。
const RIVER = 'M 30 60 Q 180 140 320 220 T 600 360'

const LEGEND = [
  {c: '#00e676', label: t('优 (≤50)', 'Good')},
  {c: '#a8e063', label: t('良 (≤100)', 'Fair')},
  {c: '#ffa726', label: t('轻度 (≤150)', 'Light')},
  {c: '#ff5252', label: t('超标 (>150)', 'Over')},
]

const KIND_LEGEND = [
  {kind: 'national', sym: '■', c: '#00e5ff', label: t('国控', 'National')},
  {kind: 'provincial', sym: '●', c: '#00e676', label: t('省控', 'Provincial')},
  {kind: 'mini', sym: '▲', c: '#ffa726', label: t('微型', 'Mini')},
] as const

const accessibleTitle = computed(() => t('大气网格监测 GIS 示意图', 'Atmospheric grid monitoring GIS map'))
</script>

<template>
  <div class="airmap" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 640 420" preserveAspectRatio="xMidYMid meet" class="airmap__svg">
      <!-- 监测网格(淡青线,大气网格化布点) -->
      <g class="airmap__grid" stroke="rgba(0,229,255,0.07)" stroke-width="0.5">
        <line v-for="gx in 13" :key="'gx' + gx" :x1="gx * 48" y1="20" :x2="gx * 48" y2="400" />
        <line v-for="gy in 9" :key="'gy' + gy" :x1="20" :y1="gy * 44" :x2="620" :y2="gy * 44" />
      </g>

      <!-- 行政区多边形 -->
      <polygon
        v-for="(d, i) in DISTRICTS"
        :key="'d' + i"
        :points="d.pts"
        fill="rgba(0,229,255,0.05)"
        stroke="rgba(0,229,255,0.28)"
        stroke-width="1"
        stroke-dasharray="5 3"
      />

      <!-- 河流 -->
      <path :d="RIVER" fill="none" stroke="rgba(43,155,255,0.5)" stroke-width="3" stroke-linecap="round" />
      <path :d="RIVER" fill="none" stroke="rgba(124,77,255,0.25)" stroke-width="6" class="airmap__riverglow" />

      <!-- 风场流线粒子(盛行西北风) -->
      <g class="airmap__wind" :class="{still: reducedMotion}">
        <path
          v-for="(p, i) in STREAMS"
          :key="'w' + i"
          :d="p"
          fill="none"
          stroke="rgba(0,229,255,0.55)"
          stroke-width="1.4"
          stroke-linecap="round"
          class="airmap__stream"
          :style="{animationDelay: -i * 0.3 + 's'}"
        />
      </g>

      <!-- 监测站三类分层 -->
      <g v-for="(s, i) in stations" :key="'s' + i" :transform="`translate(${s.x} ${s.y})`">
        <!-- 超标涟漪红脉冲 -->
        <circle
          v-if="s.over"
          r="9"
          fill="none"
          :stroke="s.color"
          stroke-width="1.5"
          class="airmap__ripple"
          :class="{still: reducedMotion}"
          :style="{animationDelay: -i * 0.4 + 's'}"
        />
        <!-- 国控:方 -->
        <rect
          v-if="s.kind === 'national'"
          x="-6" y="-6" width="12" height="12" rx="2"
          :fill="s.color" fill-opacity="0.3"
          :stroke="s.color" stroke-width="2"
          :style="{filter: 'drop-shadow(0 0 5px ' + (s.color) + ')'}"
        />
        <!-- 省控:圆 -->
        <circle
          v-else-if="s.kind === 'provincial'"
          r="6"
          :fill="s.color" fill-opacity="0.3"
          :stroke="s.color" stroke-width="2"
          :style="{filter: 'drop-shadow(0 0 5px ' + (s.color) + ')'}"
        />
        <!-- 微型:三角 -->
        <polygon
          v-else
          points="0,-7 6.5,5 -6.5,5"
          :fill="s.color" fill-opacity="0.3"
          :stroke="s.color" stroke-width="2"
          :style="{filter: 'drop-shadow(0 0 5px ' + (s.color) + ')'}"
        />
        <text y="-13" class="airmap__aqi" text-anchor="middle">{{ s.aqi }}</text>
      </g>

      <!-- 罗盘 + 风向指示(右上角) -->
      <g transform="translate(592 44)" class="airmap__compass">
        <circle r="20" fill="rgba(8,22,45,0.7)" stroke="rgba(0,229,255,0.4)" stroke-width="1" />
        <text y="-9" text-anchor="middle" class="airmap__compass-n">N</text>
        <!-- 西北风箭头(自外向中心 = 风从 NW 来) -->
        <line x1="-12" y1="-12" x2="6" y2="6" stroke="#00e5ff" stroke-width="1.6" />
        <polygon points="-12,-12 -6,-10 -10,-6" fill="#00e5ff" />
        <text y="18" text-anchor="middle" class="airmap__compass-wind">{{ t('NW 风', 'NW') }}</text>
      </g>
    </svg>

    <!-- 图例 -->
    <div class="airmap__legend">
      <span v-for="(lg, i) in LEGEND" :key="'l' + i" class="airmap__lg">
        <i :style="{background: lg.c, boxShadow: '0 0 6px ' + (lg.c)}" />{{ lg.label }}
      </span>
      <span class="airmap__sep" />
      <span v-for="(k, i) in KIND_LEGEND" :key="'k' + i" class="airmap__lg airmap__kind">
        <span class="airmap__sym" :style="{color: k.c}">{{ k.sym }}</span>{{ k.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.airmap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
}
.airmap__svg {
  flex: 1;
  min-height: 0;
  width: 100%;
}
.airmap__riverglow {
  opacity: 0.5;
  filter: blur(2px);
}
.airmap__aqi {
  fill: #d4ecff;
  font-size: 10px;
  font-weight: 700;
  font-family: var(--dc3d-mono, monospace);
  pointer-events: none;
}
.airmap__stream {
  stroke-dasharray: 3 11;
  animation: airmap-flow 1.3s linear infinite;
}
.airmap__wind.still .airmap__stream {
  animation: none;
  stroke-dasharray: none;
  opacity: 0.3;
}
@keyframes airmap-flow {
  to {
    stroke-dashoffset: -14;
  }
}
.airmap__ripple {
  transform-box: fill-box;
  transform-origin: center;
  animation: airmap-pulse 1.9s ease-out infinite;
  opacity: 0.9;
}
.airmap__ripple.still {
  animation: none;
  opacity: 0.5;
}
@keyframes airmap-pulse {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  100% {
    transform: scale(3.4);
    opacity: 0;
  }
}
.airmap__compass-n {
  fill: #ff5252;
  font-size: 9px;
  font-weight: 700;
}
.airmap__compass-wind {
  fill: #00e5ff;
  font-size: 8px;
  font-family: var(--dc3d-mono, monospace);
}
.airmap__legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 2px 4px;
  flex-shrink: 0;
}
.airmap__lg {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--dc3d-text-dim);
}
.airmap__lg i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.airmap__sep {
  width: 1px;
  height: 12px;
  background: var(--dc3d-panel-border);
}
.airmap__sym {
  font-size: 13px;
  line-height: 1;
}
</style>
