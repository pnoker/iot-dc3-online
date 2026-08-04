<script setup lang="ts">
/**
 * 招牌②:冷库温区分区(纯 SVG 等距 3D 体块,布局完全可控)。
 * 冷藏/冷冻/恒温/缓冲 四温区,每区一个等距 3D 体块(顶面菱形 + 正面矩形),
 * 体块高度 ∝ 占用率(useDomainSeries 缓慢漂移),体块颜色 = 温层温度色,
 * 内部填充从底向上到占用率高度(液位感),温度读数 + 设定区间。
 * 矮容器 ECharts 笛卡尔坐标难控,故优先纯 SVG/CSS 手绘。
 */
import {computed, ref, onMounted} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = !import.meta.env.SSR && matchMedia('(prefers-reduced-motion: reduce)').matches
})

const CYAN = '#00e5ff' // 冷藏
const BLUE = '#2b9bff' // 冷冻
const GREEN = '#00e676' // 恒温
const PURPLE = '#7c4dff' // 缓冲

function glow(c: string, r = 3) {
  return {filter: 'drop-shadow(0 0 ' + r + 'px ' + c + ')'}
}

interface Zone {
  key: string
  name: string
  color: string
  lo: number // 设定下限 ℃
  hi: number // 设定上限 ℃
  baseTemp: number // 实时温度基线 ℃
  baseOcc: number // 占用率基线 %
  seedT: number
  seedO: number
}
const ZONES: Zone[] = [
  {key: 'frozen', name: t('冷冻库', 'Frozen'), color: BLUE, lo: -25, hi: -18, baseTemp: -21.5, baseOcc: 84, seedT: 31, seedO: 32},
  {key: 'chilled', name: t('冷藏库', 'Chilled'), color: CYAN, lo: 2, hi: 8, baseTemp: 4.8, baseOcc: 76, seedT: 33, seedO: 34},
  {key: 'constant', name: t('恒温库', 'Constant'), color: GREEN, lo: 15, hi: 20, baseTemp: 17.2, baseOcc: 62, seedT: 35, seedO: 36},
  {key: 'buffer', name: t('缓冲区', 'Buffer'), color: PURPLE, lo: 8, hi: 12, baseTemp: 9.6, baseOcc: 45, seedT: 37, seedO: 38},
]

const temps = ZONES.map((z) =>
  useDomainSeries({baseline: z.baseTemp, unit: '℃', cycle: (s) => Math.sin(s / 90 + z.seedT), cycleAmp: 0.03, noiseAmp: 0.12}, {seed: z.seedT, window: 2}).current,
)
const occs = ZONES.map((z) =>
  useDomainSeries({baseline: z.baseOcc, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 110 + z.seedO), cycleAmp: 0.05, noiseAmp: 0.6}, {seed: z.seedO, window: 2}).current,
)

// 几何:4 块横排。viewBox 640×400。每块正面宽 W=120,深度偏移 DX=22,顶面 DY=-26
const W = 118
const DX = 24
const DY = -28
const BASE_Y = 320 // 体块底边(正面)基线
const MAX_H = 200 // 100% 占用对应正面高度
const GAP = 28
const START_X = 36

const blocks = computed(() =>
  ZONES.map((z, i) => {
    const x = START_X + i * (W + GAP)
    const occ = Math.max(8, Math.min(99, occs[i].value))
    const tempC = temps[i].value
    const h = (occ / 100) * MAX_H
    const yTop = BASE_Y - MAX_H // 体块正面顶
    const fillTop = BASE_Y - h // 当前液位顶
    // 等距顶面菱形四点(正面顶边 + 深度偏移)
    const topFace = [
      [x, yTop],
      [x + W, yTop],
      [x + W + DX, yTop + DY],
      [x + DX, yTop + DY],
    ]
    const fillTopFace = [
      [x, fillTop],
      [x + W, fillTop],
      [x + W + DX, fillTop + DY],
      [x + DX, fillTop + DY],
    ]
    // 温度合规判定
    const ok = tempC >= z.lo && tempC <= z.hi
    return {
      key: z.key,
      name: z.name,
      color: z.color,
      lo: z.lo,
      hi: z.hi,
      temp: tempC,
      occ,
      x,
      yTop,
      fillTop,
      topFace: topFace.map((p) => p.join(',')).join(' '),
      fillTopFace: fillTopFace.map((p) => p.join(',')).join(' '),
      ok,
    }
  }),
)

const accessibleTitle = computed(() => t('冷库四温区分区占用率与温度 3D 体块', 'Cold storage four-zone occupancy and temperature 3D blocks'))
</script>

<template>
  <div class="sz" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 640 380" preserveAspectRatio="xMidYMid meet" class="sz__svg">
      <!-- 地面网格基线 -->
      <line x1="20" y1="320" x2="620" y2="320" stroke="rgba(0,229,255,0.18)" stroke-width="1" />
      <line x1="20" y1="320" x2="44" y2="348" stroke="rgba(0,229,255,0.10)" stroke-width="1" />

      <g v-for="b in blocks" :key="b.key">
        <!-- 体块外壳(淡):正面矩形 + 顶面菱形 + 右侧面 -->
        <rect :x="b.x" :y="b.yTop" :width="W" :height="200" fill="rgba(255,255,255,0.03)" :stroke="b.color" stroke-opacity="0.35" stroke-width="1" />
        <!-- 占用填充(正面矩形 + 顶面菱形,液位感) -->
        <rect :x="b.x" :y="b.fillTop" :width="W" :height="320 - b.fillTop" :fill="b.color" fill-opacity="0.32" :class="['sz__fill', {still: reducedMotion}]" />
        <polygon :points="b.fillTopFace" :fill="b.color" fill-opacity="0.5" />
        <!-- 顶面菱形(完整体块顶) -->
        <polygon :points="b.topFace" fill="rgba(255,255,255,0.05)" :stroke="b.color" stroke-width="1.2" stroke-opacity="0.6" :style="glow(b.color, 3)" />
        <!-- 深度边 -->
        <line :x1="b.x + W" :y1="b.yTop" :x2="b.x + W + DX" :y2="b.yTop + DY" :stroke="b.color" stroke-opacity="0.4" stroke-width="1" />
        <line :x1="b.x" :y1="b.yTop" :x2="b.x + DX" :y2="b.yTop + DY" :stroke="b.color" stroke-opacity="0.4" stroke-width="1" />
        <!-- 占用率刻度线 -->
        <line :x1="b.x - 4" :y1="b.fillTop" :x2="b.x" :y2="b.fillTop" :stroke="b.color" stroke-width="1.5" />
        <!-- 温区名 -->
        <text :x="b.x + W / 2" :y="b.yTop - 38" class="sz__name" text-anchor="middle" :fill="b.color">{{ b.name }}</text>
        <!-- 温度读数 + 设定区间,合规绿勾/越限红叹 -->
        <text :x="b.x + W / 2" :y="b.yTop - 22" class="sz__temp" text-anchor="middle" :fill="b.ok ? '#d4ecff' : '#ff7a7a'">{{ b.temp.toFixed(1) }}℃ / {{ (b.temp * 9 / 5 + 32).toFixed(1) }}℉</text>
        <text :x="b.x + W / 2" :y="b.yTop - 8" class="sz__set" text-anchor="middle">{{ b.lo }}~{{ b.hi }}℃ · {{ Math.round(b.occ) }}%</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.sz {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
.sz__svg {
  width: 100%;
  height: 100%;
}
.sz__name {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
}
.sz__temp {
  font-size: 11px;
  font-family: var(--dc3d-mono, monospace);
  font-weight: 600;
}
.sz__set {
  fill: rgba(212, 236, 255, 0.5);
  font-size: 10px;
  font-family: var(--dc3d-mono, monospace);
}
.sz__fill {
  animation: sz-breathe 3.4s ease-in-out infinite;
}
.sz__fill.still {
  animation: none;
}
@keyframes sz-breathe {
  0%, 100% { fill-opacity: 0.28; }
  50% { fill-opacity: 0.42; }
}
</style>
