<script setup lang="ts">
/**
 * 闸口集卡 TEU 流:ECharts 分组柱状(6 车道 进/出 TEU/h)。
 * 进场(集卡→堆场)与出场(堆场→集卡)双系列,车道 G1-G6。
 * 闸口高峰时进场抬升,显示拥堵车道。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Lane {id: string; inBase: number; outBase: number; phase: number; seed: number}
const LANES: Lane[] = [
  {id: 'G1', inBase: 32, outBase: 24, phase: 0.0, seed: 801},
  {id: 'G2', inBase: 38, outBase: 28, phase: 0.8, seed: 802},
  {id: 'G3', inBase: 28, outBase: 30, phase: 1.6, seed: 803},
  {id: 'G4', inBase: 41, outBase: 26, phase: 2.4, seed: 804},
  {id: 'G5', inBase: 22, outBase: 33, phase: 3.2, seed: 805},
  {id: 'G6', inBase: 35, outBase: 29, phase: 4.0, seed: 806},
]

const lanes = LANES.map((l) => ({
  ref: l,
  inbound: useDomainSeries(
    {baseline: l.inBase, unit: 'TEU/h', cycle: (s) => Math.sin(s / 90 + l.phase), cycleAmp: 0.22, noiseAmp: 1.6},
    {seed: l.seed, window: 2},
  ).current,
  outbound: useDomainSeries(
    {baseline: l.outBase, unit: 'TEU/h', cycle: (s) => Math.sin(s / 100 + l.phase + 1.5), cycleAmp: 0.2, noiseAmp: 1.4},
    {seed: l.seed + 50, window: 2},
  ).current,
}))

const option = computed(() => ({
  grid: {left: 40, right: 12, top: 28, bottom: 24},
  legend: {
    data: [t('进场 In', 'Inbound'), t('出场 Out', 'Outbound')],
    top: 0,
    right: 4,
    itemWidth: 10,
    itemHeight: 6,
  },
  tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
  xAxis: {
    type: 'category',
    data: lanes.map((l) => l.ref.id),
  },
  yAxis: {
    type: 'value',
    name: 'TEU/h',
    nameTextStyle: {color: '#6b8cae', fontSize: 10},
  },
  series: [
    {
      name: t('进场 In', 'Inbound'),
      type: 'bar',
      barWidth: '34%',
      itemStyle: {color: '#00e5ff'},
      data: lanes.map((l) => Math.max(0, Math.round(l.inbound.value))),
    },
    {
      name: t('出场 Out', 'Outbound'),
      type: 'bar',
      barWidth: '34%',
      itemStyle: {color: '#00e676'},
      data: lanes.map((l) => Math.max(0, Math.round(l.outbound.value))),
    },
  ],
}))

const accessibleTitle = computed(() => t('闸口各车道进出集卡 TEU 流', 'Gate lane inbound outbound truck TEU flow'))
</script>

<template>
  <div class="gate" role="group" :aria-label="accessibleTitle">
    <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
  </div>
</template>

<style scoped>
.gate { width: 100%; height: 100%; min-height: 0; }
</style>
