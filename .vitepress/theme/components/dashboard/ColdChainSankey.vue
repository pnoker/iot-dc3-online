<script setup lang="ts">
/**
 * 招牌③:门到门温层断链桑基(ECharts sankey)。
 * 主链:装车 → 干线 → 中转 → 末端 → 送达(温合规货量,青蓝绿)。
 * 断链分支:各环节流失到「断链损失」节点(红色,制冷失效/门封漏温/延时越温)。
 * 全局漂移乘子使桑基呼吸。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const drift = useDomainSeries(
  {baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 120), cycleAmp: 0.04, noiseAmp: 0.006},
  {seed: 5, window: 2},
).current

const NODES = [
  {name: t('装车', 'Loading')},
  {name: t('干线运输', 'Linehaul')},
  {name: t('中转分拣', 'Transit')},
  {name: t('末端配送', 'Last-mile')},
  {name: t('温合规送达', 'Delivered')},
  {name: t('断链损失', 'Cold-Chain Loss')},
]

// 货量平衡(吨·批,总装车 1000):各环节 3-4% 断链流失
interface L {source: string; target: string; value: number; break?: boolean}
const BASE_LINKS: L[] = [
  {source: t('装车', 'Loading'), target: t('干线运输', 'Linehaul'), value: 1000},
  {source: t('干线运输', 'Linehaul'), target: t('中转分拣', 'Transit'), value: 962},
  {source: t('干线运输', 'Linehaul'), target: t('断链损失', 'Cold-Chain Loss'), value: 38, break: true},
  {source: t('中转分拣', 'Transit'), target: t('末端配送', 'Last-mile'), value: 928},
  {source: t('中转分拣', 'Transit'), target: t('断链损失', 'Cold-Chain Loss'), value: 34, break: true},
  {source: t('末端配送', 'Last-mile'), target: t('温合规送达', 'Delivered'), value: 898},
  {source: t('末端配送', 'Last-mile'), target: t('断链损失', 'Cold-Chain Loss'), value: 30, break: true},
]

const lossName = computed(() => t('断链损失', 'Cold-Chain Loss'))
const deliveredName = computed(() => t('温合规送达', 'Delivered'))

const option = computed(() => {
  const k = drift.value
  const ln = lossName.value
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        if (p.dataType === 'edge') {
          const tag = p.data.target === ln ? ' ⚠ ' + t('断链', 'break') : ''
          return `${p.data.source} → ${p.data.target}<br/>${t('货量', 'Cargo')}: <b>${p.data.value} ${t('吨', 't')}</b>${tag}`
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
          lineStyle: l.break ? {color: '#ff5252', opacity: 0.55} : {color: 'gradient', opacity: 0.45},
        })),
        nodeAlign: 'justify',
        nodeWidth: 12,
        nodeGap: 12,
        layoutIterations: 32,
        emphasis: {focus: 'adjacency'},
        lineStyle: {curveness: 0.5},
        label: {color: '#d4ecff', fontSize: 11},
        itemStyle: {borderWidth: 0},
        levels: [
          {depth: 0, itemStyle: {color: '#00e5ff'}},
          {depth: 1, itemStyle: {color: '#2b9bff'}},
          {depth: 2, itemStyle: {color: '#7c4dff'}},
          {depth: 3, itemStyle: {color: '#00e676'}},
          {depth: 4, itemStyle: {color: '#00ffc6'}},
          {depth: 5, itemStyle: {color: '#ff5252'}},
        ],
      },
    ],
  }
})

const accessibleTitle = computed(() => t('门到门温层断链损失桑基图', 'Door-to-door cold-chain break loss sankey'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
