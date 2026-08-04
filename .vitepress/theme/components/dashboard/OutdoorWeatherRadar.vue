<script setup lang="ts">
/**
 * 棚外气象六维雷达(BaseChart radar):温度 / 湿度 / 风速 / 光照 / 降雨 / UV 紫外。
 * 每维各自 useDomainSeries 缓变(乘性小周期 + 微噪声),实时气象场逼近真实工况。
 * 叠加 24h 均值参考环(淡),凸显当前偏离。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Dim {
  zh: string
  en: string
  max: number
  baseline: number
  cycleAmp: number
  noiseAmp: number
  phase: number
  seed: number
  unit: string
}
// 六维(指标 max = 业务上限,数据落在合理区间)
const DIMS: Dim[] = [
  {zh: '温度', en: 'Temp', max: 40, baseline: 28, cycleAmp: 0.05, noiseAmp: 0.3, phase: 0.0, seed: 601, unit: '℃'},
  {zh: '湿度', en: 'Humid', max: 100, baseline: 64, cycleAmp: 0.06, noiseAmp: 1.2, phase: 0.8, seed: 602, unit: '%'},
  {zh: '风速', en: 'Wind', max: 12, baseline: 3.4, cycleAmp: 0.18, noiseAmp: 0.25, phase: 1.6, seed: 603, unit: 'm/s'},
  {zh: '光照', en: 'Light', max: 1200, baseline: 820, cycleAmp: 0.12, noiseAmp: 14, phase: 2.4, seed: 604, unit: 'W/m²'},
  {zh: '降雨', en: 'Rain', max: 20, baseline: 0.6, cycleAmp: 0.4, noiseAmp: 0.15, phase: 3.2, seed: 605, unit: 'mm/h'},
  {zh: '紫外', en: 'UV', max: 11, baseline: 6.8, cycleAmp: 0.1, noiseAmp: 0.25, phase: 4.0, seed: 606, unit: 'idx'},
]

const dims = DIMS.map((d) => ({
  spec: d,
  cur: useDomainSeries(
    {baseline: d.baseline, unit: d.unit, cycle: (s) => Math.sin(s / 110 + d.phase), cycleAmp: d.cycleAmp, noiseAmp: d.noiseAmp},
    {seed: d.seed, window: 2},
  ).current,
}))

const accessibleTitle = computed(() => t('棚外气象六维雷达', 'Outdoor weather radar'))

const option = computed(() => ({
  radar: {
    indicator: dims.map((d) => ({name: t(d.spec.zh, d.spec.en), max: d.spec.max})),
    shape: 'polygon',
    center: ['50%', '54%'],
    radius: '66%',
    splitNumber: 4,
    axisName: {color: '#6b8cae', fontSize: 11},
    splitLine: {lineStyle: {color: 'rgba(0,229,255,0.18)'}},
    splitArea: {areaStyle: {color: ['rgba(0,229,255,0.03)', 'rgba(0,229,255,0.06)']}},
    axisLine: {lineStyle: {color: 'rgba(0,229,255,0.18)'}},
  },
  tooltip: {
    trigger: 'item',
    formatter: (p: any) => {
      const vals = p.value as number[]
      return dims
        .map((d, i) => `${t(d.spec.zh, d.spec.en)}: <b>${(+vals[i]).toFixed(1)}</b> ${d.spec.unit}`)
        .join('<br/>')
    },
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: dims.map((d) => Math.max(0, +d.cur.value.toFixed(1))),
          name: t('实时', 'Live'),
          areaStyle: {color: 'rgba(0,229,255,0.28)'},
          lineStyle: {color: '#00e5ff', width: 2, shadowBlur: 8, shadowColor: '#00e5ff'},
          itemStyle: {color: '#00e5ff'},
          symbolSize: 5,
        },
        {
          value: DIMS.map((d) => d.baseline),
          name: t('24h 均值', '24h avg'),
          areaStyle: {color: 'rgba(124,77,255,0.10)'},
          lineStyle: {color: 'rgba(124,77,255,0.55)', width: 1, type: 'dashed'},
          itemStyle: {color: 'rgba(124,77,255,0.6)'},
          symbolSize: 3,
        },
      ],
    },
  ],
}))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(200px, 26vh, 280px)" />
</template>

<style scoped>
/* 图表区由 BaseChart 托管 */
</style>
