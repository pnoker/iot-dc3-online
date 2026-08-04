<script setup lang="ts">
/**
 * 实时 TPI 与车速双轴时序(全宽底部)。TPI 0-10 左轴 / 车速 km/h 右轴,滚动窗口。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const tpi = useDomainSeries({baseline: 5.6, unit: '', cycle: (s) => 0.7 * Math.sin(s / 5) + 0.3 * Math.sin(s / 1.8), cycleMode: 'additive', noiseAmp: 0.2}, {intervalMs: 1000, window: 60, seed: 81})
const speed = useDomainSeries({baseline: 38, unit: 'km/h', cycleMode: 'additive', cycle: (s) => 0.6 * Math.sin(s / 5 + 1.5) + 0.4 * Math.sin(s / 2), noiseAmp: 1.2}, {intervalMs: 1000, window: 60, seed: 93})

const labelTpi = computed(() => t('拥堵指数 TPI', 'TPI'))
const labelSpeed = computed(() => t('平均车速', 'Avg Speed'))
const accessibleTitle = computed(() => t('实时TPI与车速时序', 'Real-time TPI and speed trend'))

const option = computed(() => {
  const tpData = tpi.series.value.map(([, v]) => v)
  const spData = speed.series.value.map(([, v]) => v)
  return {
    legend: {data: [labelTpi.value, labelSpeed.value], top: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 8, fontSize: 11},
    tooltip: {trigger: 'axis', formatter: (p: any[]) => p.filter((x) => x.value != null).map((x) => `<div>${x.marker} ${x.seriesName} <b>${x.value.toFixed(1)}${x.seriesIndex === 0 ? '' : ' km/h'}</b></div>`).join('')},
    grid: {left: 8, right: 16, top: 30, bottom: 8, containLabel: true},
    xAxis: {type: 'category', boundaryGap: false, axisTick: {show: false}, axisLabel: {hideOverlap: true}},
    yAxis: [
      {type: 'value', position: 'left', min: 0, max: 10, name: 'TPI', splitLine: {show: false}},
      {type: 'value', position: 'right', min: 0, max: 60, name: 'km/h', splitLine: {show: false}},
    ],
    series: [
      {name: labelTpi.value, type: 'line', yAxisIndex: 0, symbol: 'none', smooth: 0.3, markLine: {silent: true, symbol: 'none', lineStyle: {type: 'dashed', color: '#ff6b35', width: 1.2}, label: {color: '#ff6b35', fontSize: 10, formatter: t('拥堵阈值 6', 'Congested 6')}, data: [{yAxis: 6}]}, data: tpData},
      {name: labelSpeed.value, type: 'line', yAxisIndex: 1, symbol: 'none', smooth: 0.3, data: spData},
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" />
</template>
