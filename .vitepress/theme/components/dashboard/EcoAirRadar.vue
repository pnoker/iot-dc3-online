<script setup lang="ts">
/**
 * 招牌③:6 因子空气质量雷达(ECharts radar)。
 * 各因子浓度归一化至 GB 3095 二级(居住区)标准 = 100(轴 max=130 可显超限)。
 * 内圈多边形 = 一级(优)参考,外圈 = 二级(良)参考;实测多边形贴近/超出外圈即污染加重。
 * Tooltip 显示原始 μg/m³(mg/m³ for CO)。各因子 useDomainSeries 慢漂移。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 6 因子:SO₂/NO₂/PM2.5/PM10/CO/O₃。二级标准(GB 3095)与一级参考(占二级%)。
interface Factor {
  name: string
  g2: number // 二级限值(μg/m³,CO 为 mg/m³)
  g1Pct: number // 一级限值占二级的%(CO 用 60 作优良示意阈值)
  unit: string
  base: number // 当前实测基准
  seed: number
}
const FACTORS: Factor[] = [
  {name: 'SO₂', g2: 150, g1Pct: 33, unit: 'μg/m³', base: 24, seed: 311},
  {name: 'NO₂', g2: 80, g1Pct: 50, unit: 'μg/m³', base: 39, seed: 322},
  {name: 'PM2.5', g2: 75, g1Pct: 47, unit: 'μg/m³', base: 47, seed: 333},
  {name: 'PM10', g2: 150, g1Pct: 33, unit: 'μg/m³', base: 74, seed: 344},
  {name: 'CO', g2: 4, g1Pct: 60, unit: 'mg/m³', base: 1.2, seed: 355},
  {name: 'O₃', g2: 160, g1Pct: 62.5, unit: 'μg/m³', base: 82, seed: 366},
]

const drifts = FACTORS.map((f) => ({
  ref: f,
  val: useDomainSeries(
    {baseline: f.base, unit: f.unit, cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 130 + f.seed), cycleAmp: 0.08, noiseAmp: f.base * 0.02},
    {seed: f.seed, window: 2, intervalMs: 2000},
  ).current,
}))

// 实测浓度(原始单位)与归一化(占二级%)。
const actuals = computed(() => drifts.map((d) => +Math.max(0, d.val.value).toFixed(d.ref.unit === 'mg/m³' ? 2 : 0)))
const pcts = computed(() =>
  drifts.map((d, i) => +Math.max(0, (Math.max(0, d.val.value) / FACTORS[i].g2) * 100).toFixed(1)),
)

const indicator = FACTORS.map((f) => ({name: f.name, max: 130}))

const labelG1 = computed(() => t('一级标准', 'Grade I'))
const labelG2 = computed(() => t('二级标准(GB3095)', 'Grade II (GB3095)'))
const labelCur = computed(() => t('实测浓度', 'Measured'))
const accessibleTitle = computed(() => t('6 因子空气质量雷达 含国标限值参考', '6-factor air quality radar with national standard limits'))

const option = computed(() => {
  const acts = actuals.value
  const pc = pcts.value
  return {
    legend: {
      data: [labelG1.value, labelG2.value, labelCur.value],
      bottom: 0,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 7,
      fontSize: 10,
      textStyle: {color: '#6b8cae'},
    },
    tooltip: {
      trigger: 'item',
      formatter: () => {
        const rows = FACTORS.map((f, i) => `<div>${f.name}: <b>${acts[i]} ${f.unit}</b> <span style="color:#6b8cae">(${pc[i].toFixed(0)}% Ⅱ)</span></div>`)
        return `<div style="font-weight:600;margin-bottom:2px">${t('实测浓度', 'Measured')}</div>${rows.join('')}`
      },
    },
    radar: {
      indicator,
      center: ['50%', '48%'],
      radius: '60%',
      axisName: {color: '#d4ecff', fontSize: 11, fontWeight: 600},
      splitLine: {lineStyle: {color: 'rgba(0,229,255,0.18)'}},
      splitArea: {areaStyle: {color: ['rgba(0,229,255,0.03)', 'rgba(0,229,255,0.06)']}},
      axisLine: {lineStyle: {color: 'rgba(0,229,255,0.22)'}},
    },
    series: [
      {
        name: labelCur.value,
        type: 'radar',
        data: [{value: pc, name: labelCur.value}],
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: {width: 2.4, color: '#00e5ff', shadowBlur: 8, shadowColor: '#00e5ff'},
        itemStyle: {color: '#00e5ff'},
        areaStyle: {color: 'rgba(0,229,255,0.22)'},
      },
      {
        name: labelG2.value,
        type: 'radar',
        data: [{value: FACTORS.map(() => 100), name: labelG2.value}],
        symbol: 'none',
        lineStyle: {width: 1.2, color: '#ffa726', type: 'dashed', opacity: 0.8},
        areaStyle: {color: 'rgba(255,167,38,0.04)'},
      },
      {
        name: labelG1.value,
        type: 'radar',
        data: [{value: FACTORS.map((f) => f.g1Pct), name: labelG1.value}],
        symbol: 'none',
        lineStyle: {width: 1.2, color: '#00e676', type: 'dashed', opacity: 0.8},
        areaStyle: {color: 'rgba(0,230,118,0.05)'},
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
