<script setup lang="ts">
/**
 * CEMS 重点源排放排行(横向 bar + markLine)。
 * 8 家重点排污企业烟气 SO₂ 排放浓度(mg/m³),markLine = 排放许可浓度红线(50 mg/m³)。
 * 超标企业柱体红色;达标按浓度青→琥珀渐变。各企业 useDomainSeries 慢漂移。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const PERMIT = 50 // 排放许可浓度红线 mg/m³

interface Ent {
  name: string
  base: number
  seed: number
}
// 覆盖达标(低)与超标(高)两段:34-78 mg/m³。
const ENTS: Ent[] = [
  {name: t('第二热电厂', 'Power Plant 2'), base: 34, seed: 411},
  {name: t('东方化工', 'Orient Chem'), base: 41, seed: 422},
  {name: t('联合水泥', 'United Cement'), base: 47, seed: 433},
  {name: t('钢铁烧结', 'Steel Sinter'), base: 56, seed: 444},
  {name: t('华源焦化', 'Huayuan Coke'), base: 63, seed: 455},
  {name: t('临港玻璃', 'Port Glass'), base: 72, seed: 466},
  {name: t('第三热电厂', 'Power Plant 3'), base: 38, seed: 477},
  {name: t('蓝天药业', 'BlueSky Pharm'), base: 49, seed: 488},
]

const drifts = ENTS.map((e) => ({
  ref: e,
  val: useDomainSeries(
    {baseline: e.base, unit: 'mg/m³', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 120 + e.seed), cycleAmp: 0.08, noiseAmp: 1.2},
    {seed: e.seed, window: 2, intervalMs: 2000},
  ).current,
}))

// 排序后(降序),便于排行阅读。
const sorted = computed(() =>
  drifts
    .map((d) => ({name: d.ref.name, v: Math.max(0, d.val.value)}))
    .sort((a, b) => a.v - b.v),
)

function barColor(v: number): string {
  if (v > PERMIT) return '#ff5252'
  if (v > PERMIT * 0.8) return '#ffa726'
  return '#2b9bff'
}

const labelConc = computed(() => t('SO₂ 排放浓度', 'SO₂ Emission'))
const accessibleTitle = computed(() => t('重点源 CEMS 排放浓度排行 含许可浓度红线', 'Key-source CEMS emission ranking with permit limit line'))

const option = computed(() => ({
  grid: {left: 8, right: 26, top: 18, bottom: 8, containLabel: true},
  tooltip: {
    trigger: 'axis',
    axisPointer: {type: 'shadow'},
    formatter: (params: any[]) => {
      const p = params[0]
      const over = p.value > PERMIT
      return `<div><b>${p.name}</b></div>${labelConc.value}: <b style="color:${over ? '#ff5252' : '#00e5ff'}">${p.value.toFixed(1)} mg/m³</b>${over ? `<br/><span style="color:#ff5252">▲ ${t('超标', 'Over limit')}</span>` : ''}`
    },
  },
  xAxis: {
    type: 'value',
    name: 'mg/m³',
    nameTextStyle: {color: '#6b8cae', fontSize: 10},
    min: 0,
    max: 90,
  },
  yAxis: {
    type: 'category',
    data: sorted.value.map((d) => d.name),
    axisLabel: {fontSize: 10},
    axisTick: {show: false},
  },
  series: [
    {
      name: labelConc.value,
      type: 'bar',
      data: sorted.value.map((d) => ({
        value: +d.v.toFixed(1),
        itemStyle: {color: barColor(d.v), shadowBlur: 8, shadowColor: barColor(d.v)},
      })),
      barWidth: '52%',
      // 排放许可浓度红线(竖向 markLine)
      markLine: {
        symbol: 'none',
        silent: true,
        label: {
          show: true,
          position: 'insideEndTop',
          color: '#ff8a8a',
          fontSize: 10,
          fontWeight: 600,
          formatter: t('许可 {c} mg/m³', 'Permit {c} mg/m³'),
        },
        lineStyle: {color: '#ff5252', type: 'dashed', width: 1.4},
        data: [{xAxis: PERMIT}],
      },
    },
  ],
}))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
