<script setup lang="ts">
/**
 * 近 7 天光伏日发电量(柱)+ 平均 SOC(折线)双轴。
 * 末日发电量 live 漂移(进行中),其余静态基线。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const GEN_BASE = [3120, 3380, 2960, 3520, 3410, 3240]
const todayGen = useDomainSeries(
  {baseline: 1480, unit: 'kWh', trend: (time) => time * 0.5, cycle: (s) => Math.sin(s / 200), cycleAmp: 0.01, noiseAmp: 5},
  {seed: 31, window: 2},
)
const socLive = useDomainSeries(
  {baseline: 70, unit: '%', cycle: (s) => Math.sin(s / 160 + 1), cycleAmp: 0.06, noiseAmp: 0.5},
  {seed: 32, window: 2},
).current

const labels = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'T']
const gen = computed(() => [...GEN_BASE, Math.round(todayGen.current.value)])
const soc = computed(() => {
  const base = [62, 71, 68, 74, 70, 66]
  const live = Math.max(40, Math.min(95, Math.round(socLive.value)))
  return [...base, live]
})

const option = computed(() => ({
  legend: {
    data: [t('日发电量', 'Daily Gen'), t('平均 SOC', 'Avg SOC')],
    top: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 8, fontSize: 11,
  },
  tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
  grid: {left: 8, right: 8, top: 30, bottom: 8, containLabel: true},
  xAxis: {type: 'category', data: labels.map((l) => (l === 'T' ? t('今日', 'Today') : l)), axisTick: {alignWithLabel: true}},
  yAxis: [
    {type: 'value', name: 'kWh', position: 'left', nameTextStyle: {color: '#6b8cae', fontSize: 10}},
    {type: 'value', name: '%', position: 'right', min: 40, max: 95, splitLine: {show: false}, nameTextStyle: {color: '#6b8cae', fontSize: 10}},
  ],
  series: [
    {
      name: t('日发电量', 'Daily Gen'),
      type: 'bar',
      barWidth: '46%',
      yAxisIndex: 0,
      data: gen.value.map((v, i) => ({value: v, itemStyle: {color: i === 6 ? '#00e676' : '#00e5ff'}})),
    },
    {
      name: t('平均 SOC', 'Avg SOC'),
      type: 'line',
      yAxisIndex: 1,
      symbol: 'circle',
      symbolSize: 6,
      smooth: 0.3,
      data: soc.value,
    },
  ],
}))

const accessibleTitle = computed(() => t('近 7 天光伏发电量与平均 SOC', '7-day PV generation and average SOC'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
