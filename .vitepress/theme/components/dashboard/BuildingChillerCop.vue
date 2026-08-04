<script setup lang="ts">
/**
 * 辅:冷水机组运行 COP(W/W,能效比)双表盘。
 * 离心冷机设计 5.6,典型 4.5-6.5。色带:<4.2 红 / 4.2-5 琥珀 / 5-6 青 / >6 绿。
 * COP = 制冷量/输入功率,W/W 越高越节能。低 ΔT 综合征会拉低 COP。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const cop1 = useDomainSeries({baseline: 5.6, unit: 'W/W', cycle: (s) => Math.sin(s / 130), cycleAmp: 0.04, noiseAmp: 0.08}, {seed: 21, window: 2}).current
const cop2 = useDomainSeries({baseline: 5.3, unit: 'W/W', cycle: (s) => Math.sin(s / 140 + 1.5), cycleAmp: 0.05, noiseAmp: 0.09}, {seed: 22, window: 2}).current

const accessibleTitle = computed(() => t('冷水机组运行 COP', 'Chiller plant COP'))

function bandColor(v: number): string {
  if (v >= 6) return '#39ff9e'
  if (v >= 5) return '#00e5ff'
  if (v >= 4.2) return '#ffb020'
  return '#ff5252'
}

function makeGauge(idx: number, name: string, value: number, color: string) {
  return {
    type: 'gauge',
    center: idx === 0 ? ['28%', '58%'] : ['72%', '58%'],
    radius: '60%',
    min: 3,
    max: 7,
    startAngle: 200,
    endAngle: -20,
    splitNumber: 4,
    progress: {show: true, width: 11, itemStyle: {color}},
    axisLine: {lineStyle: {width: 11, color: [[0.3, '#ff5252'], [0.5, '#ffb020'], [0.75, '#00e5ff'], [1, '#39ff9e']]}},
    pointer: {itemStyle: {color}},
    axisTick: {distance: -16, length: 5, lineStyle: {color: '#8a98a8'}},
    splitLine: {distance: -20, length: 9, lineStyle: {color: '#8a98a8', width: 2}},
    axisLabel: {color: '#8a98a8', distance: -30, fontSize: 10, formatter: (v: number) => v.toFixed(0)},
    anchor: {show: true, size: 9, itemStyle: {color}},
    title: {offsetCenter: [0, '30%'], color: '#d4ecff', fontSize: 12, fontWeight: 600},
    detail: {valueAnimation: true, color, fontSize: 17, fontWeight: 700, offsetCenter: [0, '56%'], formatter: (v: number) => v.toFixed(2)},
    data: [{value, name}],
  }
}

const option = computed(() => {
  const v1 = +Math.max(3.5, cop1.value).toFixed(2)
  const v2 = +Math.max(3.5, cop2.value).toFixed(2)
  return {
    tooltip: {formatter: (p: any) => `${p.name}<br/>COP: <b>${p.value} W/W</b>`},
    series: [makeGauge(0, t('1# 冷机', 'Chiller 1'), v1, bandColor(v1)), makeGauge(1, t('2# 冷机', 'Chiller 2'), v2, bandColor(v2))],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(240px, 34vh, 380px)" />
</template>

<style scoped></style>
