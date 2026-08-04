<script setup lang="ts">
/**
 * 招牌 ② 土壤墒情多深度下渗热力图(BaseChart heatmap)。
 * X=时间(最近 12h,30min 一窗),Y=深度 0/10/.../100cm(surface 置顶,inverse)。
 * 值=体积含水率 VWC %,分段 visualMap:凋萎/干旱/偏干/适宜/偏湿/饱和
 *   (壤土凋萎点≈12%,田间持水量≈32%)。⚠ 凋萎点按土质标定,本图按壤土。
 * 内置 2 次灌溉事件 → 湿润锋(wetting front)随时间向深部下渗 + 蒸发回干,
 * 直观呈现"灌溉下渗"过程。实时信号对最新列做 ±1% 微抖动。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const DEPTHS_CM = [0, 10, 20, 30, 40, 60, 80, 100]
const COLS = 24 // 24 × 30min = 12h
const STEP_MIN = 30

// 各深度基线 VWC(壤土剖面):表层干、30cm 田间持水、深部缓降
const BASE_VWC = [20, 26, 30, 32, 31, 29, 28, 27]

// 灌溉事件:发生在最近 N 列前,湿润锋从此处向深处下渗
const EVENTS = [
  {col: 4, amp: 9}, // ~10h 前
  {col: 16, amp: 8}, // ~4h 前
]

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// 实时信号:0..1 慢漂移,驱动最新列 ±1% 微抖(实时感不闪屏)
const {current: live} = useDomainSeries(
  {baseline: 0.5, unit: '', cycleMode: 'multiplicative', cycle: (tt) => Math.sin(tt / 22), cycleAmp: 0.4, noiseAmp: 0.15},
  {intervalMs: 3000, seed: 19},
)

// VWC 分段(语义色固定 hex,BaseChart 不覆盖 visualMap)
const ZONES = [
  {max: 10, color: '#b71c1c', zh: '凋萎', en: 'Wilting'},
  {max: 17, color: '#e65100', zh: '干旱', en: 'Dry'},
  {max: 24, color: '#f9a825', zh: '偏干', en: 'Low'},
  {max: 33, color: '#2e7d32', zh: '适宜', en: 'Optimal'},
  {max: 42, color: '#00838f', zh: '偏湿', en: 'High'},
  {max: 99, color: '#1565c0', zh: '饱和', en: 'Saturated'},
]
function zoneOf(vwc: number) {
  for (const z of ZONES) if (vwc <= z.max) return z
  return ZONES[ZONES.length - 1]
}

// 构造二维 VWC 场:基线 + 灌溉下渗湿润锋 + 表层蒸发回干
function buildField(liveMod: number): number[][] {
  // field[row][col]
  const field = DEPTHS_CM.map((_, r) => new Array(COLS).fill(BASE_VWC[r]))
  for (const ev of EVENTS) {
    for (let c = ev.col; c < COLS; c++) {
      const ageSteps = c - ev.col
      const frontRow = Math.min(ageSteps, DEPTHS_CM.length - 1)
      for (let r = 0; r <= frontRow; r++) {
        const distFromFront = frontRow - r
        const decay = Math.exp(-0.22 * distFromFront) * Math.exp(-0.05 * ageSteps)
        field[r][c] += ev.amp * decay
      }
    }
  }
  // 表层(0-10cm)灌溉后逐窗蒸发回干:每窗 -0.25%
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < COLS; c++) {
      const sinceIrr = (c - EVENTS[EVENTS.length - 1].col) // 距上次灌溉的列数
      if (sinceIrr > 0) field[r][c] -= 0.25 * sinceIrr
    }
  }
  // 最新列微抖动(实时信号)
  const mod = (liveMod - 0.5) * 2 // -1..1
  for (let r = 0; r < DEPTHS_CM.length; r++) {
    field[r][COLS - 1] += mod * 1.0
  }
  return field
}

const depthLabels = computed(() => DEPTHS_CM.map((d) => `${d}cm`))
const timeLabels = computed(() => {
  const labels: string[] = []
  for (let c = 0; c < COLS; c++) {
    const minAgo = (COLS - 1 - c) * STEP_MIN
    const show = c % 4 === 3 || c === COLS - 1
    if (!show) {
      labels.push('')
    } else if (minAgo === 0) {
      labels.push(en.value ? 'now' : '现在')
    } else if (minAgo < 60) {
      labels.push(`-${minAgo}m`)
    } else {
      const h = Math.floor(minAgo / 60)
      const m = minAgo % 60
      labels.push(m ? `-${h}h${String(m).padStart(2, '0')}` : `-${h}h`)
    }
  }
  return labels
})

const accessibleTitle = computed(() => t('土壤墒情多深度下渗热力图', 'Soil moisture infiltration heatmap'))

const option = computed(() => {
  const mod = clamp(live.value, 0, 1)
  const field = buildField(mod)
  const data: any[] = []
  for (let r = 0; r < DEPTHS_CM.length; r++) {
    for (let c = 0; c < COLS; c++) {
      const vwc = +clamp(field[r][c], 4, 48).toFixed(1)
      const z = zoneOf(vwc)
      data.push({
        value: [c, r, vwc],
        itemStyle: {color: z.color},
        depth: depthLabels.value[r],
        win: timeLabels.value[c] || `-${(COLS - 1 - c) * STEP_MIN}m`,
        zone: t(z.zh, z.en),
      })
    }
  }
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const d = p.data
        return [
          `<b>${d.depth}</b>`,
          `${t('时段', 'Time')}: ${d.win}`,
          `${t('VWC', 'VWC')}: <b>${d.value[2]}%</b> · <span style="color:${zoneOf(d.value[2]).color}">●</span> ${d.zone}`,
        ].join('<br/>')
      },
    },
    grid: {left: 46, right: 12, top: 10, bottom: 54, containLabel: false},
    xAxis: {
      type: 'category',
      data: timeLabels.value,
      position: 'bottom',
      axisTick: {show: false},
      splitArea: {show: false},
      axisLabel: {interval: 0, fontSize: 10},
    },
    yAxis: {
      type: 'category',
      data: depthLabels.value,
      inverse: true, // 0cm(表层)置顶
      axisTick: {show: false},
      splitArea: {show: false},
    },
    visualMap: {
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      bottom: 2,
      itemWidth: 10,
      itemHeight: 10,
      symbol: 'roundRect',
      seriesIndex: 0,
      pieces: [
        {lte: 10, label: `${t('凋萎', 'Wilting')} <10`, color: ZONES[0].color},
        {gt: 10, lte: 17, label: `${t('干旱', 'Dry')} 10-17`, color: ZONES[1].color},
        {gt: 17, lte: 24, label: `${t('偏干', 'Low')} 17-24`, color: ZONES[2].color},
        {gt: 24, lte: 33, label: `${t('适宜', 'Optimal')} 24-33`, color: ZONES[3].color},
        {gt: 33, lte: 42, label: `${t('偏湿', 'High')} 33-42`, color: ZONES[4].color},
        {gt: 42, label: `${t('饱和', 'Saturated')} >42`, color: ZONES[5].color},
      ],
      textStyle: {color: '#6b8cae', fontSize: 10},
    },
    series: [
      {
        type: 'heatmap',
        data,
        animation: false,
        itemStyle: {borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderRadius: 2},
        emphasis: {itemStyle: {borderColor: '#cbd5e1', borderWidth: 1.5}},
        label: {show: false},
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(260px, 38vh, 400px)" />
</template>

<style scoped>
/* 图表区由 BaseChart 托管尺寸/主题 */
</style>
