<script setup lang="ts">
/**
 * 招牌①:全城充电桩 LBS 态势图(纯 SVG 手绘,布局完全可控)。
 * 城市建成区轮廓 + 河流 + 主干道 + 行政分区半透明多边形 + 充电站点散点。
 * 四态色:空闲 #00e676 / 在充 #00e5ff / 故障 #ff5252 / 离线 #6b8cae。
 * 在充站 + 故障站带呼吸脉冲(CSS 动画,reduced-motion 静止)。
 * 各在充站的在充桩数 / 利用率由 useDomainSeries 缓变(实时感)。
 */
import {computed, ref, onMounted} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = !import.meta.env.SSR && matchMedia('(prefers-reduced-motion: reduce)').matches
})

type State = 'charging' | 'idle' | 'fault' | 'offline'
const STATE_COLOR: Record<State, string> = {
  charging: '#00e5ff',
  idle: '#00e676',
  fault: '#ff5252',
  offline: '#6b8cae',
}

interface Station {
  key: string
  zh: string
  en: string
  x: number
  y: number
  total: number
  state: State
  baseRate: number // 在充桩占比基线(仅 charging/fault 生效)
  phase: number
  seed: number
}

const STATIONS: Station[] = [
  {key: 'cbd', zh: 'CBD 中心站', en: 'CBD Hub', x: 330, y: 185, total: 12, state: 'charging', baseRate: 0.72, phase: 0.0, seed: 101},
  {key: 'riverside', zh: '滨江超充站', en: 'Riverside Ultra', x: 175, y: 120, total: 8, state: 'charging', baseRate: 0.66, phase: 0.9, seed: 102},
  {key: 'techpark', zh: '科技园站', en: 'Tech-Park', x: 475, y: 140, total: 10, state: 'charging', baseRate: 0.70, phase: 1.7, seed: 103},
  {key: 'hsr', zh: '高铁枢纽站', en: 'HSR Junction', x: 520, y: 260, total: 16, state: 'charging', baseRate: 0.80, phase: 2.5, seed: 104},
  {key: 'logistics', zh: '东郊物流园', en: 'E-Logistics', x: 560, y: 185, total: 6, state: 'charging', baseRate: 0.58, phase: 3.3, seed: 105},
  {key: 'mall', zh: '西南商场站', en: 'SW Mall', x: 165, y: 265, total: 8, state: 'idle', baseRate: 0.18, phase: 4.1, seed: 106},
  {key: 'hospital', zh: '北区医院站', en: 'N-Hospital', x: 340, y: 90, total: 6, state: 'idle', baseRate: 0.12, phase: 4.9, seed: 107},
  {key: 'campus', zh: '大学城站', en: 'University', x: 245, y: 305, total: 8, state: 'idle', baseRate: 0.20, phase: 5.7, seed: 108},
  {key: 'southstn', zh: '南站枢纽', en: 'South Station', x: 425, y: 320, total: 10, state: 'fault', baseRate: 0.0, phase: 6.5, seed: 109},
  {key: 'oldtown', zh: '老城南门', en: 'Old-Town S.', x: 100, y: 195, total: 4, state: 'offline', baseRate: 0.0, phase: 7.3, seed: 110},
]

// 每站一路在充占比漂移(乘性,小 cycleAmp 防超 1)。
const live = STATIONS.map((s) => ({
  ref: s,
  rate: useDomainSeries(
    {baseline: s.baseRate, unit: '', cycleMode: 'multiplicative', cycle: (tt) => Math.sin(tt / 120 + s.phase), cycleAmp: 0.12, noiseAmp: 0.02},
    {seed: s.seed, window: 2},
  ).current,
}))

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

const stations = computed(() =>
  live.map(({ref: s, rate}) => {
    const r = s.state === 'idle' ? clamp01(rate.value * 0.4) : clamp01(rate.value)
    const inUse = s.state === 'charging' || s.state === 'idle' ? Math.round(s.total * r) : 0
    const util = s.state === 'offline' ? 0 : Math.round(r * 100)
    const color = STATE_COLOR[s.state]
    return {
      ...s,
      inUse,
      util,
      color,
      // 半径按桩数缩放(4-16 → 5-9)
      r: 5 + (s.total - 4) * 0.4,
      glow: 'drop-shadow(0 0 6px ' + color + ')',
    }
  }),
)

// 行政分区半透明多边形(与站点聚集对应)。
const DISTRICTS = [
  {key: 'd1', name: t('核心区', 'Core'), pts: '120,90 540,80 580,170 500,250 300,260 110,210', cx: 320, cy: 165},
  {key: 'd2', name: t('滨江', 'Riverside'), pts: '60,95 220,75 200,180 70,200', cx: 140, cy: 135},
  {key: 'd3', name: t('南岸', 'South-Bank'), pts: '230,290 540,290 520,360 210,360', cx: 380, cy: 325},
]

const LEGEND = [
  {c: '#00e5ff', label: t('在充', 'Charging')},
  {c: '#00e676', label: t('空闲', 'Idle')},
  {c: '#ff5252', label: t('故障', 'Fault')},
  {c: '#6b8cae', label: t('离线', 'Offline')},
]

const accessibleTitle = computed(() => t('全城充电桩 LBS 态势图', 'Citywide charger LBS situational map'))
</script>

<template>
  <div class="evmap" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet" class="evmap__svg">
      <defs>
        <linearGradient id="evRiver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="rgba(0,229,255,0.28)" />
          <stop offset="1" stop-color="rgba(43,155,255,0.12)" />
        </linearGradient>
      </defs>

      <!-- 建成区轮廓 -->
      <path
        d="M70,100 L210,72 L470,68 L590,120 L600,210 L540,290 L500,360 L210,366 L120,310 L60,210 Z"
        fill="rgba(13,35,69,0.55)"
        stroke="rgba(0,229,255,0.35)"
        stroke-width="1.2"
      />

      <!-- 行政分区多边形 -->
      <polygon
        v-for="d in DISTRICTS"
        :key="d.key"
        :points="d.pts"
        fill="rgba(0,229,255,0.05)"
        stroke="rgba(0,229,255,0.25)"
        stroke-width="0.8"
        stroke-dasharray="4 3"
      />
      <text
        v-for="d in DISTRICTS"
        :key="'t' + d.key"
        :x="d.cx"
        :y="d.cy"
        class="evmap__dlabel"
        text-anchor="middle"
      >{{ d.name }}</text>

      <!-- 河流(斜穿) -->
      <path
        d="M40,250 Q220,200 320,230 T620,180"
        fill="none"
        stroke="url(#evRiver)"
        stroke-width="11"
        stroke-linecap="round"
        opacity="0.85"
      />

      <!-- 主干道 -->
      <g stroke="rgba(124,77,255,0.35)" stroke-width="1" stroke-dasharray="6 4">
        <line x1="70" y1="185" x2="590" y2="185" />
        <line x1="330" y1="72" x2="330" y2="360" />
        <line x1="120" y1="310" x2="540" y2="120" />
      </g>

      <!-- 站点 -->
      <g v-for="(s, i) in stations" :key="s.key" :transform="'translate(' + s.x + ' ' + s.y + ')'">
        <!-- 在充/故障呼吸脉冲环 -->
        <circle
          v-if="s.state === 'charging' || s.state === 'fault'"
          :r="s.r + 2"
          fill="none"
          :stroke="s.color"
          stroke-width="1.6"
          class="evmap__pulse"
          :class="{fast: s.state === 'fault', still: reducedMotion}"
        />
        <circle
          :r="s.r"
          :fill="s.color"
          fill-opacity="0.28"
          :stroke="s.color"
          stroke-width="2"
          :style="{filter: s.glow}"
        />
        <!-- 故障叉号 -->
        <g v-if="s.state === 'fault'" :stroke="s.color" stroke-width="1.6" stroke-linecap="round">
          <line :x1="-s.r * 0.5" :y1="-s.r * 0.5" :x2="s.r * 0.5" :y2="s.r * 0.5" />
          <line :x1="s.r * 0.5" :y1="-s.r * 0.5" :x2="-s.r * 0.5" :y2="s.r * 0.5" />
        </g>
        <!-- 离线虚线圈 -->
        <circle
          v-if="s.state === 'offline'"
          :r="s.r + 3"
          fill="none"
          :stroke="s.color"
          stroke-width="1"
          stroke-dasharray="2 2"
          opacity="0.7"
        />
        <text :y="-(s.r + 5)" class="evmap__sname" text-anchor="middle">{{ t(s.zh, s.en) }}</text>
        <text :y="s.r + 13" class="evmap__smeta" text-anchor="middle">
          {{ s.state === 'offline' ? t('离线', 'Offline') : s.inUse + '/' + s.total + ' · ' + s.util + '%' }}
        </text>
      </g>
    </svg>

    <!-- 图例 + 汇总 -->
    <div class="evmap__legend">
      <span v-for="(lg, i) in LEGEND" :key="i" class="evmap__lg">
        <i :style="{background: lg.c, boxShadow: '0 0 6px ' + lg.c}" />{{ lg.label }}
      </span>
      <span class="evmap__lg evmap__sum">{{ t('站点', 'Stations') }} {{ stations.length }} · {{ t('桩位', 'Ports') }} {{ stations.reduce((a, b) => a + b.total, 0) }}</span>
    </div>
  </div>
</template>

<style scoped>
.evmap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
}
.evmap__svg {
  flex: 1;
  min-height: 0;
  width: 100%;
}
.evmap__dlabel {
  fill: rgba(212, 236, 255, 0.32);
  font-size: 11px;
  letter-spacing: 1px;
  font-family: var(--dc3d-mono, monospace);
  pointer-events: none;
}
.evmap__sname {
  fill: #d4ecff;
  font-size: 9.5px;
  font-weight: 600;
}
.evmap__smeta {
  fill: rgba(212, 236, 255, 0.7);
  font-size: 8.5px;
  font-family: var(--dc3d-mono, monospace);
}
.evmap__pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: evmap-pulse 2s ease-out infinite;
}
.evmap__pulse.fast {
  animation: evmap-pulse 0.9s ease-out infinite;
}
.evmap__pulse.still {
  animation: none;
}
@keyframes evmap-pulse {
  0% { transform: scale(1); opacity: 0.85; }
  100% { transform: scale(2.6); opacity: 0; }
}
.evmap__legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 2px 4px;
  flex-shrink: 0;
}
.evmap__lg {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--dc3d-text-dim);
}
.evmap__lg i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.evmap__sum {
  margin-left: auto;
  color: var(--dc3d-neon-cyan, #00e5ff);
  font-family: var(--dc3d-mono, monospace);
}
</style>
