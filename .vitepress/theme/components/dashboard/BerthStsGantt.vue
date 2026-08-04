<script setup lang="ts">
/**
 * 招牌②:泊位-岸桥作业甘特(纯 SVG + CSS)。
 * 纵轴=泊位(B1-B6),横轴=12h 时间窗;船舶靠泊段 + 岸桥分配条带 + now 线。
 * 段内细条带=各岸桥 STC 作业窗口;状态色:作业中青/待靠琥珀/计划灰。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const PLOT_X0 = 50
const PLOT_X1 = 730
const PLOT_W = PLOT_X1 - PLOT_X0
const PLOT_Y0 = 20
const PLOT_Y1 = 330
const ROW_H = (PLOT_Y1 - PLOT_Y0) / 6
const WIN = 12 // 时间窗小时数

function rowCenter(i: number) {
  return PLOT_Y0 + (i + 0.5) * ROW_H
}
function hx(hour: number) {
  return PLOT_X0 + (Math.max(0, Math.min(WIN, hour)) / WIN) * PLOT_W
}

// now 线小时数:缓慢前移并循环(展示时间推进感)
const nowSrc = useDomainSeries(
  {baseline: 3.6, unit: 'h', cycle: (s) => Math.sin(s / 240), cycleAmp: 0.04, noiseAmp: 0.02},
  {seed: 401, window: 2, intervalMs: 2000},
)
const nowHour = computed(() => Math.max(0, Math.min(WIN, nowSrc.current.value)))

interface Seg {
  berth: number
  zh: string
  en: string
  start: number
  end: number
  cranes: string[]
  status: 'working' | 'waiting' | 'planned'
}
const SEGS: Seg[] = [
  {berth: 0, zh: '远东海运', en: 'MV SEA-LAND', start: 0, end: 7, cranes: ['STC-01', 'STC-02', 'STC-03'], status: 'working'},
  {berth: 1, zh: '海洋网联', en: 'ONE OAKland', start: 6.5, end: 11.5, cranes: [], status: 'planned'},
  {berth: 2, zh: '中远宁波', en: 'COSCO NINGBO', start: 2, end: 8, cranes: ['STC-04', 'STC-05'], status: 'working'},
  {berth: 3, zh: '长荣给定', en: 'EVER GIVEN', start: 1, end: 9, cranes: ['STC-06', 'STC-07'], status: 'working'},
  {berth: 5, zh: '地中海盖亚', en: 'MSC GAIA', start: 4, end: 10, cranes: ['STC-08'], status: 'waiting'},
]

const CRANE_COLORS = ['#00e5ff', '#00e676', '#b980ff', '#ffb020', '#2b9bff', '#ff5cf0', '#00ffc6', '#ffa726']
function craneColor(id: string) {
  const n = parseInt(id.replace(/\D/g, ''), 10) || 1
  return CRANE_COLORS[(n - 1) % CRANE_COLORS.length]
}

// 每段内岸桥条带:错峰开始(更逼真),k 台岸桥等分窗口
function segStripes(seg: Seg) {
  const n = seg.cranes.length
  if (!n) return [] as {id: string; color: string; sx: number; ex: number; y: number}[]
  const out: {id: string; color: string; sx: number; ex: number; y: number}[] = []
  const barY = rowCenter(seg.berth) - 16
  const span = seg.end - seg.start
  // 每台岸桥作业子区间:略错峰,前面岸桥早开始晚结束
  for (let k = 0; k < n; k++) {
    const a = seg.start + span * (k / (n + 1)) * 0.25
    const b = seg.end - span * ((n - 1 - k) / (n + 1)) * 0.25
    out.push({
      id: seg.cranes[k],
      color: craneColor(seg.cranes[k]),
      sx: hx(a),
      ex: hx(b),
      y: barY + 4 + k * (24 / Math.max(1, n)),
    })
  }
  return out
}

const statusStyle = {
  working: {bar: 'seg-working', label: () => t('作业中', 'Working')},
  waiting: {bar: 'seg-waiting', label: () => t('待靠', 'Waiting')},
  planned: {bar: 'seg-planned', label: () => t('计划', 'Planned')},
}

const ticks = [0, 2, 4, 6, 8, 10, 12]
function clock(h: number) {
  const base = 8 // 起始 08:00
  const total = (base + h) % 24
  const hh = Math.floor(total)
  return String(hh).padStart(2, '0') + ':00'
}
function segName(seg: Seg) {
  return en.value ? seg.en : seg.zh
}

const accessibleTitle = computed(() => t('泊位靠泊与岸桥分配甘特图', 'Berth berthing and STS allocation gantt'))
</script>

<template>
  <div class="gnt" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 760 360" preserveAspectRatio="xMidYMid meet" class="gnt-svg" aria-hidden="true">
      <!-- 泊位行背景 + 标签 -->
      <g>
        <rect v-for="i in 6" :key="'rb'+i" :x="PLOT_X0" :y="PLOT_Y0 + (i-1)*ROW_H" :width="PLOT_W" :height="ROW_H" :class="i % 2 ? 'row-odd' : 'row-even'" />
        <text v-for="i in 6" :key="'rl'+i" :x="PLOT_X0 - 8" :y="rowCenter(i-1) + 3" text-anchor="end" class="t-berth">B{{ i }}</text>
      </g>

      <!-- 时间网格 -->
      <g>
        <line v-for="h in ticks" :key="'tg'+h" :x1="hx(h)" :y1="PLOT_Y0" :x2="hx(h)" :y2="PLOT_Y1" class="grid-v" />
        <text v-for="h in ticks" :key="'tl'+h" :x="hx(h)" :y="PLOT_Y1 + 14" text-anchor="middle" class="t-time">{{ clock(h) }}</text>
      </g>

      <!-- 船舶靠泊段 + 岸桥条带 -->
      <g v-for="(seg, idx) in SEGS" :key="'seg'+idx">
        <rect
          :x="hx(seg.start)"
          :y="rowCenter(seg.berth) - 16"
          :width="hx(seg.end) - hx(seg.start)"
          :height="32"
          rx="3"
          :class="statusStyle[seg.status].bar"
        />
        <!-- 岸桥作业条带 -->
        <rect
          v-for="(st, k) in segStripes(seg)"
          :key="'st'+idx+'-'+k"
          :x="st.sx"
          :y="st.y"
          :width="Math.max(2, st.ex - st.sx)"
          :height="3.2"
          rx="1.5"
          :fill="st.color"
          class="stripe"
        />
        <text :x="hx(seg.start) + 5" :y="rowCenter(seg.berth) - 19" class="t-segname">{{ segName(seg) }}</text>
        <text :x="hx(seg.end) - 5" :y="rowCenter(seg.berth) - 19" text-anchor="end" class="t-status">{{ statusStyle[seg.status].label() }}</text>
      </g>

      <!-- now 线 -->
      <line :x1="hx(nowHour)" :y1="PLOT_Y0 - 4" :x2="hx(nowHour)" :y2="PLOT_Y1 + 2" class="now-line" />
      <rect :x="hx(nowHour) - 16" :y="PLOT_Y0 - 14" width="32" height="11" rx="2" class="now-tag" />
      <text :x="hx(nowHour)" :y="PLOT_Y0 - 5" text-anchor="middle" class="t-now">NOW</text>

      <!-- 轴标 -->
      <text :x="PLOT_X0 + PLOT_W/2" :y="PLOT_Y1 + 24" text-anchor="middle" class="t-axis">{{ t('时间(12h 作业窗)', 'Time (12h ops window)') }}</text>
    </svg>

    <div class="gnt-legend">
      <span><i class="lg lg-cyan" />{{ t('作业中', 'Working') }}</span>
      <span><i class="lg lg-amber" />{{ t('待靠', 'Waiting') }}</span>
      <span><i class="lg lg-gray" />{{ t('计划', 'Planned') }}</span>
      <span><i class="lg lg-mix" />{{ t('岸桥分配', 'STC Allocation') }}</span>
    </div>
  </div>
</template>

<style scoped>
.gnt { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.gnt-svg { width: 100%; height: 100%; }

.row-odd { fill: rgba(13,35,69,0.35); }
.row-even { fill: rgba(8,22,45,0.35); }
.grid-v { stroke: rgba(0,229,255,0.12); stroke-width: 1; stroke-dasharray: 3 5; }
.t-time { font-size: 10px; fill: #6b8cae; font-family: var(--dc3d-mono); }
.t-berth { font-size: 11px; fill: #6b8cae; font-weight: 600; font-family: var(--dc3d-mono); }

.seg-working { fill: rgba(0,229,255,0.18); stroke: #00e5ff; stroke-width: 1.4; }
.seg-waiting { fill: rgba(255,176,32,0.14); stroke: #ffb020; stroke-width: 1.4; stroke-dasharray: 4 3; }
.seg-planned { fill: rgba(124,77,255,0.1); stroke: #b980ff; stroke-width: 1.2; stroke-dasharray: 2 4; }
.stripe { opacity: 0.9; }

.t-segname { font-size: 9px; fill: #d4ecff; font-weight: 600; }
.t-status { font-size: 8px; fill: #6b8cae; font-weight: 600; }

.now-line { stroke: #ff2d9b; stroke-width: 1.6; stroke-dasharray: 5 3; opacity: 0.9; }
.now-tag { fill: #ff2d9b; }
.t-now { font-size: 7px; fill: #fff; font-weight: 700; letter-spacing: 0.5px; }
.t-axis { font-size: 9px; fill: #6b8cae; }

.gnt-legend { position: absolute; left: 8px; top: 4px; display: flex; flex-wrap: wrap; gap: 6px; font-size: 9px; color: var(--dc3d-text-dim); }
.lg { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 3px; vertical-align: middle; }
.lg-cyan { background: #00e5ff; }
.lg-amber { background: #ffb020; }
.lg-gray { background: #b980ff; }
.lg-mix { background: linear-gradient(90deg, #00e5ff, #00e676, #ffb020); }
</style>
