<script setup lang="ts">
/**
 * 招牌③:堆场箱区 3D 体块(纯 SVG 等距 dimetric 手绘)。
 * 每个箱区:顶面菱形 + 左右两侧面,高度 H=层数(tiers),颜色=占用率(绿/琥珀/青/红)。
 * 两排箱区(后排远、前排近),按画家算法先画后排再画前排,形成纵深。
 * 占用率与层数随实时数据缓动漂移。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const HALF_W = 40 // 顶面菱形半宽
const TIER_UNIT = 7 // 每层高度(px)

// 排/列布局:后排 6 块,前排 6 块,前排右下偏移给纵深
interface Cell {id: string; row: 0 | 1; col: number; occBase: number; tiersBase: number; seed: number}
function mulberry32(s: number) {
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let r = Math.imul(s ^ (s >>> 15), 1 | s)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(7777)
const CELLS: Cell[] = []
for (let row = 0; row < 2; row++) {
  for (let col = 0; col < 6; col++) {
    CELLS.push({
      id: (row === 0 ? 'A' : 'B') + (col + 1),
      row: row as 0 | 1,
      col,
      occBase: 0.5 + rng() * 0.42,
      tiersBase: 3 + Math.floor(rng() * 4), // 3-6 层
      seed: 5000 + row * 100 + col,
    })
  }
}

// 堆场整体占用率与平均层数缓动(每块叠加个体偏移)
const yardOcc = useDomainSeries(
  {baseline: 78, unit: '%', cycle: (s) => Math.sin(s / 160), cycleAmp: 0.04, noiseAmp: 0.4},
  {seed: 501, window: 2},
).current
const yardTier = useDomainSeries(
  {baseline: 4.2, unit: 'tier', cycle: (s) => Math.sin(s / 200 + 1), cycleAmp: 0.05, noiseAmp: 0.05},
  {seed: 502, window: 2},
).current

function cellOcc(c: Cell) {
  const drift = (Math.sin(c.col * 0.9 + c.row * 1.7 + yardOcc.value / 20) + 1) / 2
  return Math.max(0, Math.min(1, c.occBase * 0.65 + drift * 0.4))
}
function cellTiers(c: Cell) {
  const drift = Math.round(yardTier.value - 4)
  return Math.max(2, Math.min(6, c.tiersBase + drift))
}

interface Faces {top: string; right: string; left: string}
function facesColor(v: number): {top: string; right: string; left: string} {
  if (v < 0.6) return {top: '#00e676', right: '#00b85f', left: '#008f49'}
  if (v < 0.82) return {top: '#ffb020', right: '#d68a10', left: '#a36a08'}
  if (v < 0.93) return {top: '#00e5ff', right: '#00b3cc', left: '#008a9e'}
  return {top: '#ff5252', right: '#cc3f3f', left: '#9e3030'}
}

// 每块屏幕坐标(后排 y_base=240,前排 y_base=305;前排 x 右偏 +28)
function cellBase(c: Cell) {
  const x = 70 + c.col * 110 + (c.row === 1 ? 28 : 0)
  const y = (c.row === 0 ? 240 : 305)
  return {x, y}
}
// 返回一个块的三面 polygon points 字符串
function blockFaces(c: Cell): Faces & {H: number; cx: number; cy: number; occ: number; tiers: number} {
  const {x: cx, y: cyBase} = cellBase(c)
  const tiers = cellTiers(c)
  const H = tiers * TIER_UNIT
  const occ = cellOcc(c)
  const hw = HALF_W
  const hd = HALF_W / 2 // 半深
  // 顶面(抬升 H)
  const Nt = `${cx},${cyBase - hd - H}`
  const Et = `${cx + hw},${cyBase - H}`
  const St = `${cx},${cyBase + hd - H}`
  const Wt = `${cx - hw},${cyBase - H}`
  // 底面四个对应点
  const Eb = `${cx + hw},${cyBase}`
  const Sb = `${cx},${cyBase + hd}`
  const Wb = `${cx - hw},${cyBase}`
  return {
    top: `${Nt} ${Et} ${St} ${Wt}`,
    right: `${Et} ${St} ${Sb} ${Eb}`,
    left: `${Wt} ${St} ${Sb} ${Wb}`,
    H,
    cx,
    cy: cyBase,
    occ,
    tiers,
  }
}

// 排序:后排(row0)在前先画,前排(row1)后画(画家算法);同排按 col 左→右
const ordered = computed(() =>
  [...CELLS].sort((a, b) => a.row - b.row || a.col - b.col).map((c) => ({c, f: blockFaces(c), col: facesColor(cellOcc(c))})),
)

const avgOcc = computed(() => Math.round(yardOcc.value))
const avgTier = computed(() => yardTier.value.toFixed(1))

const accessibleTitle = computed(() => t('堆场箱区三维体块高度与占用率', 'Yard block 3D profile by tier and occupancy'))
</script>

<template>
  <div class="yard" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 760 360" preserveAspectRatio="xMidYMid meet" class="yard-svg" aria-hidden="true">
      <!-- 地面参考线 -->
      <line x1="20" y1="338" x2="740" y2="338" class="ground" />

      <!-- 箱区体块 -->
      <g v-for="(it, idx) in ordered" :key="'yb'+idx">
        <!-- 左面 -->
        <polygon :points="it.f.left" :fill="it.col.left" class="face" />
        <!-- 右面 -->
        <polygon :points="it.f.right" :fill="it.col.right" class="face" />
        <!-- 顶面 -->
        <polygon :points="it.f.top" :fill="it.col.top" class="face face-top" />
        <!-- 层数标签(前面正中) -->
        <text :x="it.f.cx" :y="it.f.cy + 2" text-anchor="middle" class="t-tier">{{ it.f.tiers }}T</text>
        <!-- 箱区编号(顶面) -->
        <text :x="it.f.cx" :y="it.f.cy - HALF_W/2 - it.f.H - 2" text-anchor="middle" class="t-id">{{ it.c.id }}</text>
      </g>

      <!-- 坐标轴提示 -->
      <text x="22" y="24" class="t-hint">{{ t('纵深 ←→ 近前排 / 后排', 'Depth: front row near, back row far') }}</text>
      <text x="738" y="24" text-anchor="end" class="t-stat">{{ t('均层', 'Avg Tier') }} {{ avgTier }} ｜ {{ t('占用', 'Occ') }} {{ avgOcc }}%</text>
    </svg>

    <div class="yard-legend">
      <span><i class="lg" :style="{background: '#00e676'}" />{{ t('富余', 'Low') }}</span>
      <span><i class="lg" :style="{background: '#ffb020'}" />{{ t('偏满', 'Mid') }}</span>
      <span><i class="lg" :style="{background: '#00e5ff'}" />{{ t('高占用', 'High') }}</span>
      <span><i class="lg" :style="{background: '#ff5252'}" />{{ t('爆箱', 'Full') }}</span>
    </div>
  </div>
</template>

<style scoped>
.yard { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.yard-svg { width: 100%; height: 100%; }

.ground { stroke: rgba(0,229,255,0.18); stroke-width: 1; stroke-dasharray: 4 6; }
.face { stroke: rgba(0,229,255,0.35); stroke-width: 0.8; }
.face-top { stroke: rgba(255,255,255,0.45); stroke-width: 1; }

.t-tier { font-size: 8px; fill: #fff; font-weight: 700; font-family: var(--dc3d-mono); paint-order: stroke; stroke: rgba(0,0,0,0.45); stroke-width: 2px; }
.t-id { font-size: 9px; fill: #d4ecff; font-weight: 700; font-family: var(--dc3d-mono); }
.t-hint { font-size: 9px; fill: #6b8cae; }
.t-stat { font-size: 9px; fill: #ffb020; font-weight: 600; font-family: var(--dc3d-mono); }

.yard-legend { position: absolute; right: 8px; bottom: 4px; display: flex; gap: 8px; font-size: 9px; color: var(--dc3d-text-dim); }
.lg { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 3px; vertical-align: middle; }
</style>
