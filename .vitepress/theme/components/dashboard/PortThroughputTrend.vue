<script setup lang="ts">
/**
 * 24h 吞吐与岸桥趋势(全宽时序):ECharts 双轴折线。
 * 左轴 吞吐 TEU/h(日内钟形,午间作业高峰),右轴 岸桥 moves/h(同步起伏)。
 * 确定性 24 点日内曲线 + 实时"当前小时"标记 + 潮汐窗口背景带。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 日内作业强度系数:夜间低谷、午间高峰
function dayMult(h: number) {
  return 0.4 + 1.15 * Math.exp(-((h - 13) ** 2) / 18)
}

function mulberry32(s: number) {
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let r = Math.imul(s ^ (s >>> 15), 1 | s)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(4242)

const HOURS = Array.from({length: 24}, (_, h) => h)
const teuProfile = HOURS.map((h) => Math.round(340 * dayMult(h) * (0.94 + rng() * 0.12)))
const movesProfile = HOURS.map((h) => +(26 * (0.55 + 0.6 * dayMult(h)) * (0.95 + rng() * 0.1)).toFixed(1))

const hourLabels = HOURS.map((h) => String(h).padStart(2, '0'))

// 当前小时(缓慢推进并循环,驱动标记线)
const nowSrc = useDomainSeries(
  {baseline: 13, unit: 'h', cycle: (s) => Math.sin(s / 260), cycleAmp: 0.02, noiseAmp: 0.01},
  {seed: 411, window: 2, intervalMs: 2000},
)
const nowHour = computed(() => Math.max(0, Math.min(23, Math.round(nowSrc.current.value))))

// 实时叠加:当前小时的吞吐微抖(让端点跳动)
const liveJitter = useDomainSeries(
  {baseline: 1, unit: '', cycle: (s) => Math.sin(s / 60), cycleAmp: 0.06, noiseAmp: 0.01},
  {seed: 412, window: 2},
).current

const teuData = computed(() => teuProfile.map((v, h) => (h === nowHour.value ? Math.round(v * liveJitter.value) : v)))
const movesData = computed(() => movesProfile)

// 潮汐窗口(高潮位)背景:简化为 03-05 与 15-17 两个 markArea
const option = computed(() => ({
  grid: {left: 48, right: 52, top: 30, bottom: 26},
  legend: {
    data: [t('吞吐 TEU/h', 'Throughput TEU/h'), t('岸桥 moves/h', 'STS moves/h')],
    top: 2,
    right: 8,
    itemWidth: 12,
    itemHeight: 6,
  },
  tooltip: {trigger: 'axis'},
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: hourLabels,
    name: ':00',
    nameTextStyle: {color: '#6b8cae', fontSize: 10},
  },
  yAxis: [
    {
      type: 'value',
      name: 'TEU/h',
      nameTextStyle: {color: '#6b8cae', fontSize: 10},
    },
    {
      type: 'value',
      name: 'moves/h',
      nameTextStyle: {color: '#6b8cae', fontSize: 10},
      min: 0,
      max: 40,
    },
  ],
  series: [
    {
      name: t('吞吐 TEU/h', 'Throughput TEU/h'),
      type: 'line',
      yAxisIndex: 0,
      smooth: true,
      showSymbol: false,
      itemStyle: {color: '#00e5ff'},
      markArea: {
        silent: true,
        itemStyle: {color: 'rgba(0,230,118,0.06)'},
        data: [
          [{xAxis: '03'}, {xAxis: '05'}],
          [{xAxis: '15'}, {xAxis: '17'}],
        ],
      },
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: {color: '#ff2d9b', type: 'dashed', width: 1.4},
        label: {formatter: 'NOW', color: '#ff2d9b', fontSize: 9},
        data: [{xAxis: hourLabels[nowHour.value]}],
      },
      data: teuData.value,
    },
    {
      name: t('岸桥 moves/h', 'STS moves/h'),
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      showSymbol: false,
      itemStyle: {color: '#ffb020'},
      data: movesData.value,
    },
  ],
}))

const accessibleTitle = computed(() => t('全天吞吐 TEU 与岸桥 moves/h 趋势', '24h throughput TEU and STS moves trend'))
</script>

<template>
  <div class="trd" role="group" :aria-label="accessibleTitle">
    <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
  </div>
</template>

<style scoped>
.trd { width: 100%; height: 100%; min-height: 0; }
</style>
