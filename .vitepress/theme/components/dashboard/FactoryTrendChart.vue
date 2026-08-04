<script setup lang="ts">
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 需求节拍 takt:为满足订单,产线需维持的最低小时产量(与 SmartFactoryPanel 节拍达成率同口径:52 件/h)
const TAKT_TARGET = 52

// 产量:baseline 50 件/h,班次节拍(慢波 ~31s 叠加微节拍 ~11s),高斯噪声 σ=3。
// 选用 additive:useDomainSeries 乘性分支(v += baseline*(1+cycle*amp))当前叠加双倍 baseline,
// additive 给出"围绕 baseline 波动"的预期形态(振幅 = baseline*amp,等同修复后的乘性)。
const throughput = useDomainSeries(
  {
    baseline: 50,
    unit: '件/h',
    cycleMode: 'additive',
    cycle: (s: number) => 0.7 * Math.sin(s / 5) + 0.3 * Math.sin(s / 1.8),
    noiseAmp: 3,
  },
  {intervalMs: 1000, window: 60, seed: 7},
)

// 良率:baseline 98%,仅小幅噪声(无节拍波动)
const yieldRate = useDomainSeries(
  {baseline: 98, unit: '%', noiseAmp: 0.4},
  {intervalMs: 1000, window: 60, seed: 19},
)

const labelThroughput = computed(() => t('产量', 'Throughput'))
const labelYield = computed(() => t('良率', 'Yield'))

const ACCESSIBLE_TITLE = '实时产量与良率双轴时序 / Live yield & throughput trend'

const option = computed(() => {
  // 最新点高亮:仅末点带 symbol,其余点不画(symbol: 'none')
  const tpData = throughput.series.value.map(([, v], i, arr) =>
    i === arr.length - 1 ? {value: v, symbol: 'circle', symbolSize: 7} : v,
  )
  const ylData = yieldRate.series.value.map(([, v], i, arr) =>
    i === arr.length - 1 ? {value: v, symbol: 'circle', symbolSize: 7} : v,
  )

  return {
    legend: {
      data: [labelThroughput.value, labelYield.value],
      top: 0,
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 8,
      fontSize: 11,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {type: 'line'},
      formatter: (params: any[]) => {
        const idx = params[0]?.dataIndex ?? 0
        const rows = params
          .filter((p) => p.value != null)
          .map((p) => {
            const unit = p.seriesIndex === 0 ? t(' 件/h', ' u/h') : '%'
            return `<div>${p.marker} ${p.seriesName} <b>${p.value}${unit}</b></div>`
          })
        return `<div style="font-weight:600;margin-bottom:2px">${t('采样', 'Sample')} #${idx}</div>${rows.join('')}`
      },
    },
    grid: {left: 8, right: 16, top: 30, bottom: 8, containLabel: true},
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisTick: {show: false},
      axisLabel: {hideOverlap: true},
    },
    yAxis: [
      {type: 'value', position: 'left', scale: true},
      {type: 'value', position: 'right', min: 95, max: 100, splitLine: {show: false}},
    ],
    series: [
      {
        name: labelThroughput.value,
        type: 'line',
        yAxisIndex: 0,
        symbol: 'none',
        smooth: 0.3,
        lineStyle: {width: 2},
        data: tpData,
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: {type: 'dashed', color: '#d97706', width: 1.5},
          label: {
            show: true,
            position: 'insideStartTop',
            color: '#d97706',
            fontSize: 10,
            formatter: t('节拍目标 {c} 件/h', 'Takt {c} u/h'),
          },
          data: [{yAxis: TAKT_TARGET}],
        },
      },
      {
        name: labelYield.value,
        type: 'line',
        yAxisIndex: 1,
        symbol: 'none',
        smooth: 0.3,
        lineStyle: {width: 2},
        data: ylData,
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="ACCESSIBLE_TITLE" />
</template>

<style scoped></style>
