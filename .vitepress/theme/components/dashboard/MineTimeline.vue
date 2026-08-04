<script setup lang="ts">
/**
 * 实时瓦斯与主扇风量双轴时序(全宽底部)。
 * 左轴=工作面回风瓦斯 CH₄ %vol(0-2.6,带 1.0% 报警 markLine),
 * 右轴=主扇风量 m³/min。滚动窗口 60s。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const gas = useDomainSeries(
  {baseline: 0.62, unit: '%vol', cycle: (s) => 0.7 * Math.sin(s / 5) + 0.3 * Math.sin(s / 1.8), cycleMode: 'additive', noiseAmp: 0.025, events: [{rate: 1 / 40, type: 'spike', size: 0.4}]},
  {intervalMs: 1000, window: 60, seed: 91},
)
const flow = useDomainSeries(
  {baseline: 8400, unit: 'm³/min', cycleMode: 'additive', cycle: (s) => 0.6 * Math.sin(s / 5 + 1.5) + 0.4 * Math.sin(s / 2), noiseAmp: 18},
  {intervalMs: 1000, window: 60, seed: 93},
)

const labelGas = computed(() => t('瓦斯 CH₄', 'Gas CH₄'))
const labelFlow = computed(() => t('主扇风量', 'Fan Flow'))
const accessibleTitle = computed(() => t('实时瓦斯浓度与主扇风量时序', 'Real-time gas and fan flow trend'))

const option = computed(() => {
  const gasData = gas.series.value.map(([, v]) => v)
  const flowData = flow.series.value.map(([, v]) => v)
  return {
    legend: {data: [labelGas.value, labelFlow.value], top: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 8, fontSize: 11},
    tooltip: {
      trigger: 'axis',
      formatter: (p: any[]) => p
        .filter((x) => x.value != null)
        .map((x) => `<div>${x.marker} ${x.seriesName} <b>${x.value.toFixed(x.seriesIndex === 0 ? 2 : 0)}${x.seriesIndex === 0 ? ' %vol' : ' m³/min'}</b></div>`)
        .join(''),
    },
    grid: {left: 8, right: 16, top: 30, bottom: 8, containLabel: true},
    xAxis: {type: 'category', boundaryGap: false, axisTick: {show: false}, axisLabel: {hideOverlap: true}},
    yAxis: [
      {type: 'value', position: 'left', min: 0, max: 2.6, name: '%vol', nameTextStyle: {color: '#6b8cae', fontSize: 10}, splitLine: {show: false}},
      {type: 'value', position: 'right', min: 7000, max: 9500, name: 'm³/min', nameTextStyle: {color: '#6b8cae', fontSize: 10}, splitLine: {show: false}},
    ],
    series: [
      {
        name: labelGas.value,
        type: 'line',
        yAxisIndex: 0,
        symbol: 'none',
        smooth: 0.3,
        itemStyle: {color: '#ff6b35'},
        markLine: {silent: true, symbol: 'none', lineStyle: {type: 'dashed', color: '#ffb020', width: 1.1}, label: {color: '#ffb020', fontSize: 10, formatter: t('报警 1.0%', 'Alarm 1.0%')}, data: [{yAxis: 1.0}]},
        data: gasData,
      },
      {
        name: labelFlow.value,
        type: 'line',
        yAxisIndex: 1,
        symbol: 'none',
        smooth: 0.3,
        itemStyle: {color: '#00e5ff'},
        data: flowData,
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" />
</template>

<style scoped></style>
