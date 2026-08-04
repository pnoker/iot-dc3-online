<script setup lang="ts">
/**
 * 招牌③:流量分配桑基(水源 → 泵站 → DMA → 用户)。
 * 水量平衡:总供 1000 m³/h,逐级分配至居民/工业。全局漂移乘子使桑基呼吸。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 全局漂移乘子(baseline=1,小 cycleAmp),所有 link 同步缓变。
const drift = useDomainSeries(
  {baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 120), cycleAmp: 0.05, noiseAmp: 0.008},
  {seed: 5, window: 2},
).current

const SRC = t('水源', 'Source')
const PS = t('泵站', 'Pump')
const DMA = 'DMA'
const USR = t('用户', 'User')

const NODES = [
  {name: t('水厂 A', 'WTP-A')},
  {name: t('水厂 B', 'WTP-B')},
  {name: t('1#泵站', 'PS-1')},
  {name: t('2#泵站', 'PS-2')},
  {name: t('3#泵站', 'PS-3')},
  {name: 'DMA-01'},
  {name: 'DMA-02'},
  {name: 'DMA-03'},
  {name: 'DMA-04'},
  {name: t('居民用水', 'Residential')},
  {name: t('工业用水', 'Industrial')},
]

// 水量平衡(m³/h,总和守恒 1000):
// 水厂A 580 / B 420 → 泵站 360/380/260 → DMA 200/290/360/150 → 居民 760 / 工业 240
const BASE_LINKS = [
  {source: t('水厂 A', 'WTP-A'), target: t('1#泵站', 'PS-1'), value: 280},
  {source: t('水厂 A', 'WTP-A'), target: t('2#泵站', 'PS-2'), value: 200},
  {source: t('水厂 A', 'WTP-A'), target: t('3#泵站', 'PS-3'), value: 100},
  {source: t('水厂 B', 'WTP-B'), target: t('1#泵站', 'PS-1'), value: 80},
  {source: t('水厂 B', 'WTP-B'), target: t('2#泵站', 'PS-2'), value: 180},
  {source: t('水厂 B', 'WTP-B'), target: t('3#泵站', 'PS-3'), value: 160},
  {source: t('1#泵站', 'PS-1'), target: 'DMA-01', value: 200},
  {source: t('1#泵站', 'PS-1'), target: 'DMA-02', value: 160},
  {source: t('2#泵站', 'PS-2'), target: 'DMA-02', value: 130},
  {source: t('2#泵站', 'PS-2'), target: 'DMA-03', value: 250},
  {source: t('3#泵站', 'PS-3'), target: 'DMA-03', value: 110},
  {source: t('3#泵站', 'PS-3'), target: 'DMA-04', value: 150},
  {source: 'DMA-01', target: t('居民用水', 'Residential'), value: 150},
  {source: 'DMA-01', target: t('工业用水', 'Industrial'), value: 50},
  {source: 'DMA-02', target: t('居民用水', 'Residential'), value: 220},
  {source: 'DMA-02', target: t('工业用水', 'Industrial'), value: 70},
  {source: 'DMA-03', target: t('居民用水', 'Residential'), value: 270},
  {source: 'DMA-03', target: t('工业用水', 'Industrial'), value: 90},
  {source: 'DMA-04', target: t('居民用水', 'Residential'), value: 120},
  {source: 'DMA-04', target: t('工业用水', 'Industrial'), value: 30},
]

const option = computed(() => {
  const k = drift.value
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        if (p.dataType === 'edge') {
          return `${p.data.source} → ${p.data.target}<br/>${t('流量', 'Flow')}: <b>${p.data.value} m³/h</b>`
        }
        return `<b>${p.name}</b>`
      },
    },
    series: [
      {
        type: 'sankey',
        data: NODES,
        links: BASE_LINKS.map((l) => ({
          source: l.source,
          target: l.target,
          value: Math.max(1, Math.round(l.value * k)),
        })),
        nodeAlign: 'justify',
        nodeWidth: 12,
        nodeGap: 10,
        layoutIterations: 32,
        emphasis: {focus: 'adjacency'},
        lineStyle: {color: 'gradient', opacity: 0.45, curveness: 0.5},
        label: {color: '#d4ecff', fontSize: 11},
        itemStyle: {borderWidth: 0},
        levels: [
          {depth: 0, itemStyle: {color: '#2b9bff'}},
          {depth: 1, itemStyle: {color: '#00e5ff'}},
          {depth: 2, itemStyle: {color: '#7c4dff'}},
          {depth: 3, itemStyle: {color: '#00e676'}},
        ],
      },
    ],
  }
})

const accessibleTitle = computed(() => t('水源至用户流量分配桑基图', 'Source-to-user flow allocation sankey'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
