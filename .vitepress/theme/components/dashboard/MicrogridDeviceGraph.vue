<script setup lang="ts">
/**
 * 关键设备通信/状态关系图(ECharts graph,layout:'none' 定点,稳定不跳)。
 * 中心网关采集层连接各设备;节点色=健康度(固定 hex),故障节点红脉冲(EffectScatter 叠加)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Dev {zh: string; en: string; x: number; y: number; baseline: number; phase: number; seed: number}
const DEVS: Dev[] = [
  {zh: '采集网关', en: 'Gateway', x: 0, y: 0, baseline: 99, phase: 0, seed: 1},
  {zh: '逆变器 1', en: 'Inverter-1', x: -180, y: -90, baseline: 95, phase: 0.7, seed: 2},
  {zh: '逆变器 2', en: 'Inverter-2', x: -180, y: 90, baseline: 88, phase: 1.4, seed: 3},
  {zh: '储能 PCS', en: 'PCS', x: 0, y: -150, baseline: 92, phase: 2.1, seed: 4},
  {zh: 'BMS', en: 'BMS', x: 0, y: 150, baseline: 96, phase: 2.8, seed: 5},
  {zh: 'PCC 表计', en: 'PCC Meter', x: 180, y: -90, baseline: 97, phase: 3.5, seed: 6},
  {zh: '汇流箱', en: 'Comb. Box', x: -150, y: 0, baseline: 72, phase: 4.2, seed: 7},
  {zh: '控制器', en: 'Controller', x: 180, y: 90, baseline: 90, phase: 4.9, seed: 8},
]

const healths = DEVS.map((d) =>
  useDomainSeries(
    {baseline: d.baseline, unit: '%', cycle: (s) => Math.sin(s / 120 + d.phase), cycleAmp: 0.05, noiseAmp: 0.8},
    {seed: d.seed, window: 2},
  ).current,
)

function colorOf(h: number): string {
  if (h >= 90) return '#00e676'
  if (h >= 75) return '#ffb020'
  return '#ff5252'
}
function statusOf(h: number): [string, string] {
  return h >= 90 ? [t('在线', 'Online'), t('在线', 'Online')] : h >= 75 ? [t('波动', 'Unstable'), t('波动', 'Unstable')] : [t('故障', 'Fault'), t('故障', 'Fault')]
}

const option = computed(() => {
  const nodes = DEVS.map((d, i) => {
    const h = Math.max(0, Math.min(100, healths[i].value))
    const [szh] = statusOf(h)
    return {
      id: d.en,
      name: t(d.zh, d.en),
      x: d.x,
      y: d.y,
      symbolSize: d.zh === '采集网关' ? 46 : 34,
      value: h,
      itemStyle: {color: colorOf(h), shadowBlur: 10, shadowColor: colorOf(h)},
      label: {show: true, position: 'bottom', color: '#d4ecff', fontSize: 10, distance: 6},
      _st: szh,
    }
  })
  // 网关为中心,星型连接(再补两条设备间互联)
  const gw = 'Gateway'
  const links = [
    {source: gw, target: 'Inverter-1'},
    {source: gw, target: 'Inverter-2'},
    {source: gw, target: 'PCS'},
    {source: gw, target: 'BMS'},
    {source: gw, target: 'PCC Meter'},
    {source: gw, target: 'Comb. Box'},
    {source: gw, target: 'Controller'},
    {source: 'PCS', target: 'BMS'},
    {source: 'Inverter-1', target: 'Comb. Box'},
  ]

  return {
    tooltip: {
      formatter: (p: any) => {
        if (p.dataType === 'node') {
          return `<b>${p.data.name}</b><br/>${t('健康度', 'Health')}: <b>${p.data.value.toFixed(1)}%</b><br/>${t('状态', 'Status')}: ${p.data._st}`
        }
        return ''
      },
    },
    series: [
      {
        type: 'graph',
        layout: 'none',
        roam: false,
        data: nodes,
        links,
        lineStyle: {color: 'rgba(0,229,255,0.35)', width: 1.4, curveness: 0.08},
        emphasis: {focus: 'adjacency', lineStyle: {color: '#00e5ff', width: 2.4}},
      },
    ],
  }
})

const accessibleTitle = computed(() => t('关键设备通信拓扑与状态关系图', 'Device communication topology and status'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
