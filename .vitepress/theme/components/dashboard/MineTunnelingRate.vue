<script setup lang="ts">
/**
 * 掘进进尺:近 14 日单日进尺(m)柱状 + 班计划目标 markLine + 累计进尺折线(右轴)。
 * 基态按周期波动(检修日偏低),实时漂移使柱体呼吸。目标线 18 m/d(纲要指标)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const TARGET = 18 // m/d 目标
const N = 14
const DAYS = Array.from({length: N}, (_, i) => i)

// 基态进尺:工作日 14-19,检修日(idx%7==6)偏低 4-7
function baseAdvance(i: number): number {
  if (i % 7 === 6) return 5 + ((i * 37) % 30) / 10 // 检修日
  return 14 + ((i * 53) % 55) / 10 // 工作日 14-19.5
}
// 全局漂移
const drift = useDomainSeries(
  {baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 65), cycleAmp: 0.05, noiseAmp: 0.01},
  {intervalMs: 3000, window: 2, seed: 71},
).current

const labelDaily = computed(() => t('日进尺', 'Daily'))
const labelCum = computed(() => t('累计进尺', 'Cumulative'))
const accessibleTitle = computed(() => t('近十四日掘进进尺与目标', 'Tunneling advance vs target'))

const option = computed(() => {
  const k = drift.value
  const daily = DAYS.map((i) => +(baseAdvance(i) * (0.94 + 0.12 * k)).toFixed(1))
  let cum = 0
  const cumData = daily.map((d) => (cum += d) && +cum.toFixed(1))
  return {
    legend: {data: [labelDaily.value, labelCum.value], top: 0, icon: 'roundRect', itemWidth: 12, itemHeight: 8, fontSize: 11},
    tooltip: {
      trigger: 'axis',
      formatter: (p: any[]) => p.filter((x) => x.value != null).map((x) => `<div>${x.marker} ${x.seriesName} <b>${x.value} m</b></div>`).join(''),
    },
    grid: {left: 8, right: 12, top: 28, bottom: 6, containLabel: true},
    xAxis: {type: 'category', data: DAYS.map((i) => 'D-' + (N - 1 - i)), axisTick: {show: false}, axisLabel: {hideOverlap: true, fontSize: 10}},
    yAxis: [
      {type: 'value', position: 'left', name: 'm/d', nameTextStyle: {color: '#6b8cae', fontSize: 10}, splitLine: {show: true}},
      {type: 'value', position: 'right', name: 'm', nameTextStyle: {color: '#6b8cae', fontSize: 10}, splitLine: {show: false}},
    ],
    series: [
      {
        name: labelDaily.value,
        type: 'bar',
        yAxisIndex: 0,
        barWidth: '58%',
        itemStyle: {color: '#2b9bff', borderRadius: [3, 3, 0, 0]},
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: {type: 'dashed', color: '#00e676', width: 1.2},
          label: {color: '#00e676', fontSize: 10, formatter: t('目标 {c} m/d', 'Target {c} m/d')},
          data: [{yAxis: TARGET}],
        },
        data: daily,
      },
      {
        name: labelCum.value,
        type: 'line',
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 5,
        smooth: 0.3,
        itemStyle: {color: '#ffb020'},
        data: cumData,
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
