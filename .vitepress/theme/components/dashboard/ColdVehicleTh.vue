<script setup lang="ts">
/**
 * 单车温湿度(BaseChart 双轴):左轴 温度 ℃(tooltip 兼显 ℉),右轴 湿度 %。
 * 冷藏车基准 5℃ / RH 78%,markArea 标温度合规带,markLine 标上下限。
 * 全局漂移 + 一次湿度阶跃(开门湿度飙升)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const tempSrc = useDomainSeries(
  {baseline: 5, unit: '℃', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 40), cycleAmp: 0.12, noiseAmp: 0.18},
  {intervalMs: 1500, window: 60, seed: 61},
).series
const humSrc = useDomainSeries(
  {baseline: 78, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 55 + 1.1), cycleAmp: 0.05, noiseAmp: 0.6, events: [{at: 30, type: 'step', size: 12, duration: 10}]},
  {intervalMs: 1500, window: 60, seed: 62},
).series

const tempLabel = computed(() => t('车厢温度', 'Temp'))
const humLabel = computed(() => t('相对湿度', 'Humidity'))
const accessibleTitle = computed(() => t('单车温度湿度双轴时序', 'Single reefer temperature and humidity trend'))

const option = computed(() => {
  const tData = tempSrc.value.map(([x, y]) => [x, +y.toFixed(2)])
  const hData = humSrc.value.map(([x, y]) => [x, +y.toFixed(1)])
  const xs = tData.map((d) => d[0])
  const xMin = xs.length ? xs[0] : 0
  const xMax = xs.length ? xs[xs.length - 1] : 60
  return {
    legend: {data: [tempLabel.value, humLabel.value], top: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 8, fontSize: 11},
    tooltip: {
      trigger: 'axis',
      formatter: (p: any[]) => {
        const rows = p.filter((q) => q.value[1] != null).map((q) => {
          if (q.seriesIndex === 0) {
            const c = q.value[1]
            return `<div>${q.marker} ${q.seriesName} <b>${c.toFixed(1)}℃ / ${((c * 9) / 5 + 32).toFixed(1)}℉</b></div>`
          }
          return `<div>${q.marker} ${q.seriesName} <b>${q.value[1].toFixed(1)} %</b></div>`
        })
        return rows.join('')
      },
    },
    grid: {left: 10, right: 12, top: 30, bottom: 8, containLabel: true},
    xAxis: {type: 'value', min: xMin, max: xMax, axisLabel: {formatter: (v: number) => Math.round(v - xMin) + 's', fontSize: 10}},
    yAxis: [
      {type: 'value', position: 'left', name: '℃', min: 0, max: 12, nameTextStyle: {color: '#6b8cae', fontSize: 10}},
      {type: 'value', position: 'right', name: '%RH', min: 40, max: 100, nameTextStyle: {color: '#6b8cae', fontSize: 10}, splitLine: {show: false}},
    ],
    series: [
      {
        name: tempLabel.value,
        type: 'line',
        yAxisIndex: 0,
        symbol: 'none',
        smooth: 0.3,
        data: tData,
        markArea: {
          silent: true,
          itemStyle: {color: 'rgba(0,230,118,0.10)', borderWidth: 0},
          data: [[{yAxis: 2}, {yAxis: 8}]],
        },
      },
      {
        name: humLabel.value,
        type: 'line',
        yAxisIndex: 1,
        symbol: 'none',
        smooth: 0.3,
        data: hData,
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
