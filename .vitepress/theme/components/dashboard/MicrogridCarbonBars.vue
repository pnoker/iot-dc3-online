<script setup lang="ts">
/**
 * 近 7 天碳减排量柱状图。每方阵发电量 × 区域电网排放因子(0.785 kgCO₂/kWh)。
 * 末日(D-0)由 live 漂移微增,体现"今日累计进行中"。语义色:固定 hex。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 基线 6 天(已完成),末日 live 漂移(进行中)。
const BASE = [2680, 2940, 2520, 3180, 3060, 2880]
const today = useDomainSeries(
  {baseline: 1620, unit: 'kg', trend: (time) => time * 0.4, cycle: (s) => Math.sin(s / 200), cycleAmp: 0.01, noiseAmp: 4},
  {seed: 9, window: 2},
)

const days = computed(() => {
  const labels: [string, string][] = [
    ['D-6', 'D-6'], ['D-5', 'D-5'], ['D-4', 'D-4'], ['D-3', 'D-3'], ['D-2', 'D-2'], ['D-1', 'D-1'],
    [t('今日', 'Today'), t('今日', 'Today')],
  ]
  const vals = [...BASE, Math.round(today.current.value)]
  return labels.map(([zh, en], i) => ({label: t(zh, en), value: vals[i], isToday: i === 6}))
})

const option = computed(() => ({
  grid: {left: 8, right: 12, top: 24, bottom: 8, containLabel: true},
  tooltip: {
    trigger: 'axis',
    axisPointer: {type: 'shadow'},
    formatter: (p: any) => `<b>${p[0].name}</b><br/>${t('CO₂ 减排', 'CO₂ Saved')}: <b>${p[0].value} kg</b>`,
  },
  xAxis: {type: 'category', data: days.value.map((d) => d.label), axisTick: {alignWithLabel: true}},
  yAxis: {type: 'value', name: 'kgCO₂', nameTextStyle: {color: '#6b8cae', fontSize: 10}},
  series: [
    {
      type: 'bar',
      barWidth: '52%',
      data: days.value.map((d) => ({
        value: d.value,
        itemStyle: {color: d.isToday ? '#00e676' : '#00e5ff'},
      })),
      label: {show: true, position: 'top', color: '#6b8cae', fontSize: 10, formatter: '{c}'},
    },
  ],
}))

const accessibleTitle = computed(() => t('近 7 天碳减排量柱状图', 'Carbon reduction by day'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
