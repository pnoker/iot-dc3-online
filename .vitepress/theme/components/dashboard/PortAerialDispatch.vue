<script setup lang="ts">
/**
 * 招牌①:港区俯视调度(纯 SVG + CSS,布局完全可控)。
 * 自上而下:海/锚地 → 泊位线(6 泊位)→ 靠泊船舶(按 LOA 与停靠位置)→
 *           岸桥 STS(沿轨道,作业中向船伸 spreader)→ 集卡 lines effect 流动 →
 *           堆场 block heatmap(8×3 箱区,色=占用率)。
 * 船舶状态与岸桥位置随实时数据漂移(掉档岸桥红脉冲)。
 */
import {computed, ref, onMounted} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = !import.meta.env.SSR && matchMedia('(prefers-reduced-motion: reduce)').matches
})

const QX0 = 40
const QX1 = 720
const QY = 70 // 泊位线 y
const BERTH_W = (QX1 - QX0) / 6 // 单泊位宽
function berthCenter(i: number) {
  return QX0 + BERTH_W * (i + 0.5)
}

// 船舶定义:停靠泊位索引、船型(LOA 占泊位比)、船名
interface Vessel {berth: number; loa: number; zh: string; en: string}
const VESSELS: Vessel[] = [
  {berth: 0, loa: 0.92, zh: '远东海运', en: 'MV SEA-LAND'},
  {berth: 2, loa: 0.78, zh: '中远宁波', en: 'COSCO NINGBO'},
  {berth: 3, loa: 0.95, zh: '长荣给定', en: 'EVER GIVEN'},
  {berth: 5, loa: 0.6, zh: '地中海盖亚', en: 'MSC GAIA'},
]

// 岸桥定义:所属泊位、在泊位上的相对位置、相位
interface Crane {id: string; berth: number; pos: number; phase: number; seed: number}
const CRANES: Crane[] = [
  {id: 'STC-01', berth: 0, pos: -0.28, phase: 0.0, seed: 101},
  {id: 'STC-02', berth: 0, pos: 0.05, phase: 0.9, seed: 102},
  {id: 'STC-03', berth: 0, pos: 0.32, phase: 1.8, seed: 103},
  {id: 'STC-04', berth: 2, pos: -0.18, phase: 2.7, seed: 104},
  {id: 'STC-05', berth: 2, pos: 0.22, phase: 3.6, seed: 105},
  {id: 'STC-06', berth: 3, pos: -0.25, phase: 4.5, seed: 106},
  {id: 'STC-07', berth: 3, pos: 0.12, phase: 5.4, seed: 107},
  {id: 'STC-08', berth: 5, pos: 0.0, phase: 6.3, seed: 108},
]

// 每岸桥 moves/h:<22 视为掉档(红脉冲)
const craneMoves = CRANES.map((c) =>
  useDomainSeries(
    {baseline: 27, unit: 'moves/h', cycle: (s) => Math.sin(s / 110 + c.phase), cycleAmp: 0.18, noiseAmp: 1.2},
    {seed: c.seed, window: 2},
  ).current,
)
function craneActive(i: number) {
  return craneMoves[i].value >= 22
}

// 堆场 block 占用率(8×3=24,seeded PRNG 稳定 + 缓动漂移)
function mulberry32(s: number) {
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let r = Math.imul(s ^ (s >>> 15), 1 | s)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(2024)
const YARD_COLS = 8
const YARD_ROWS = 3
const YARD_BASE: number[] = []
for (let i = 0; i < YARD_COLS * YARD_ROWS; i++) YARD_BASE.push(0.45 + rng() * 0.5)

// 堆场整体占用率缓动
const yardOcc = useDomainSeries(
  {baseline: 78, unit: '%', cycle: (s) => Math.sin(s / 160), cycleAmp: 0.04, noiseAmp: 0.5},
  {seed: 309, window: 2},
).current

function blockOcc(i: number) {
  const drift = (Math.sin(i * 0.7 + yardOcc.value / 18) + 1) / 2
  const base = YARD_BASE[i]
  return Math.max(0, Math.min(1, base * 0.7 + drift * 0.35))
}
function occColor(v: number) {
  if (v < 0.6) return '#00e676'
  if (v < 0.82) return '#ffb020'
  if (v < 0.93) return '#00e5ff'
  return '#ff5252'
}

const YARD_X0 = QX0
const YARD_Y0 = 200
const CELL_W = (QX1 - QX0) / YARD_COLS
const CELL_H = (340 - YARD_Y0) / YARD_ROWS

// 集卡流动线 x 位置(连接岸桥区到堆场)
const TRUCK_X = [90, 175, 255, 340, 420, 505, 585, 670]

function shipName(v: Vessel) {
  return en.value ? v.en : v.zh
}

const accessibleTitle = computed(() => t('泊位船舶岸桥堆场集卡俯视调度图', 'Terminal aerial dispatch: berth ship STS yard truck'))
</script>

<template>
  <div class="aer" :class="{still: reducedMotion}" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 760 360" preserveAspectRatio="xMidYMid meet" class="aer-svg" aria-hidden="true">
      <!-- 海/锚地 -->
      <rect x="0" y="0" width="760" height="40" fill="rgba(0,229,255,0.05)" />
      <text x="380" y="25" text-anchor="middle" class="t-sea">{{ t('海 / 锚地', 'Sea / Anchorage') }}</text>

      <!-- 泊位分割线 -->
      <g stroke="rgba(0,229,255,0.25)" stroke-width="1" stroke-dasharray="2 5">
        <line v-for="i in 5" :key="'bd'+i" :x1="QX0 + BERTH_W * i" :y1="44" :x2="QX0 + BERTH_W * i" :y2="QY" />
      </g>

      <!-- 船舶 -->
      <g v-for="(v, idx) in VESSELS" :key="'v'+idx" :transform="'translate(' + (berthCenter(v.berth) - (v.loa * BERTH_W) / 2) + ',42)'">
        <rect :width="v.loa * BERTH_W" height="20" rx="3" class="ship-hull" />
        <polygon :points="(v.loa*BERTH_W/2) + ',-6 ' + (v.loa*BERTH_W/2 - 8) + ',2 ' + (v.loa*BERTH_W/2 + 8) + ',2'" class="ship-bow" />
        <rect :x="v.loa*BERTH_W*0.62" y="3" :width="v.loa*BERTH_W*0.16" height="14" class="ship-house" />
        <text :x="(v.loa*BERTH_W)/2" y="14" text-anchor="middle" class="t-ship">{{ shipName(v) }}</text>
      </g>

      <!-- 泊位线 + 泊位号 -->
      <line :x1="QX0" :y1="QY" :x2="QX1" :y2="QY" class="quay" />
      <line :x1="QX0" :y1="QY+1" :x2="QX1" :y2="QY+1" stroke="#ffffff" stroke-width="0.8" opacity="0.5" />
      <text v-for="i in 6" :key="'bn'+i" :x="berthCenter(i-1)" :y="QY+14" text-anchor="middle" class="t-berth">B{{ i }}</text>

      <!-- 岸桥轨道 -->
      <line :x1="QX0-6" y1="108" :x2="QX1+6" y2="108" class="rail" />

      <!-- 岸桥 STS -->
      <g v-for="(c, idx) in CRANES" :key="'cr'+idx" :transform="'translate(' + (berthCenter(c.berth) + c.pos * BERTH_W) + ',0)'">
        <line x1="0" y1="84" x2="0" :y2="craneActive(idx) ? 64 : 78" class="spreader" :class="{'spreader-idle': !craneActive(idx)}" />
        <rect v-if="craneActive(idx)" x="-4" y="62" width="8" height="3" class="spreader-head" />
        <path d="M -9 84 L -9 108 M 9 84 L 9 108 M -11 84 L 11 84" class="crane" :class="{'crane-stall': !craneActive(idx)}" />
        <rect x="-4" y="79" width="8" height="5" class="crane-house" :class="{'crane-stall': !craneActive(idx)}" />
        <text y="122" text-anchor="middle" class="t-crane" :class="{'t-stall': !craneActive(idx)}">{{ c.id }}</text>
      </g>

      <!-- 集卡 lines effect 流动 -->
      <g>
        <line v-for="(x, i) in TRUCK_X" :key="'tk'+i" :x1="x" y1="116" :x2="x" y2="192" class="truck-flow" />
      </g>
      <text :x="QX1-4" y="186" text-anchor="end" class="t-truck">{{ t('集卡通道', 'Truck Lane') }}</text>

      <!-- 堆场行标 -->
      <text v-for="r in YARD_ROWS" :key="'yr'+r" :x="QX0-6" :y="YARD_Y0 + CELL_H*(r-1) + CELL_H/2 + 3" text-anchor="end" class="t-yardrow">{{ String.fromCharCode(64 + r) }}</text>

      <!-- 堆场 block heatmap -->
      <g>
        <rect
          v-for="i in YARD_COLS * YARD_ROWS"
          :key="'yb'+i"
          :x="YARD_X0 + CELL_W * ((i-1) % YARD_COLS) + 3"
          :y="YARD_Y0 + CELL_H * Math.floor((i-1) / YARD_COLS) + 3"
          :width="CELL_W - 6"
          :height="CELL_H - 6"
          :fill="occColor(blockOcc(i-1))"
          :opacity="0.35 + blockOcc(i-1) * 0.5"
          class="yard-block"
        />
      </g>
      <text :x="QX1-4" y="354" text-anchor="end" class="t-occ">{{ t('堆场占用', 'Yard Occ.') }} {{ Math.round(yardOcc) }}%</text>
    </svg>

    <div class="aer-legend">
      <span><i class="lg lg-green" />{{ t('富余', 'Low') }}</span>
      <span><i class="lg lg-amber" />{{ t('偏满', 'Mid') }}</span>
      <span><i class="lg lg-red" />{{ t('爆箱', 'Full') }}</span>
    </div>
  </div>
</template>

<style scoped>
.aer { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.aer-svg { width: 100%; height: 100%; }

.t-sea { font-size: 11px; fill: rgba(0,229,255,0.55); letter-spacing: 1px; }
.ship-hull { fill: rgba(124,77,255,0.32); stroke: #b980ff; stroke-width: 1.1; }
.ship-bow { fill: rgba(124,77,255,0.5); stroke: #b980ff; stroke-width: 1; }
.ship-house { fill: rgba(212,236,255,0.6); }
.t-ship { font-size: 9px; fill: #d4ecff; font-weight: 600; }
.quay { stroke: #00e5ff; stroke-width: 4; opacity: 0.9; }
.t-berth { font-size: 10px; fill: #6b8cae; font-weight: 600; font-family: var(--dc3d-mono); }
.rail { stroke: rgba(255,176,32,0.5); stroke-width: 2; }

.crane { fill: none; stroke: #00e5ff; stroke-width: 1.6; }
.crane-house { fill: rgba(0,229,255,0.4); stroke: #00e5ff; stroke-width: 0.8; }
.crane-stall { stroke: #ff5252 !important; animation: aer-blink 1s ease-in-out infinite; }
.spreader { stroke: #00e676; stroke-width: 1.4; stroke-dasharray: 3 3; animation: aer-down 0.8s linear infinite; }
.spreader-head { fill: #00e676; }
.spreader-idle { stroke: #6b8cae; animation: none; }
.t-crane { font-size: 8px; fill: #00e5ff; font-family: var(--dc3d-mono); }
.t-stall { fill: #ff5252; }

.truck-flow { stroke: #2b9bff; stroke-width: 1.6; stroke-dasharray: 5 7; opacity: 0.75; animation: aer-down 1.1s linear infinite; }
.t-truck { font-size: 8px; fill: #2b9bff; }
.t-yardrow { font-size: 10px; fill: #6b8cae; font-weight: 600; }
.yard-block { stroke: rgba(0,229,255,0.25); stroke-width: 0.6; }
.t-occ { font-size: 9px; fill: #ffb020; font-weight: 600; }

@keyframes aer-down { to { stroke-dashoffset: -12; } }
@keyframes aer-blink { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
.aer.still .spreader, .aer.still .truck-flow, .aer.still .crane-stall { animation: none !important; }

.aer-legend {
  position: absolute; right: 8px; top: 6px; display: flex; gap: 8px;
  font-size: 10px; color: var(--dc3d-text-dim);
}
.lg { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 3px; vertical-align: middle; }
.lg-green { background: #00e676; }
.lg-amber { background: #ffb020; }
.lg-red { background: #ff5252; }
</style>
