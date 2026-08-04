<script setup lang="ts">
/**
 * 招牌②:光储充能量流桑基(光伏 + 储能 + 电网 → 直流快充 / 交流慢充 / 站用负荷)。
 * 流宽 = 实时功率(kW),全链能量守恒(源出 = 负荷入 = 3100 kW)。
 * live 漂移乘子驱动所有 link 同步呼吸,守恒关系保持。
 * OBMS 有序调度:光伏优先自消纳,储能削峰,电网补缺口。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 全网充电功率漂移乘子(baseline=1,小 cycleAmp),所有 link 同步缓变、守恒保持。
const drift = useDomainSeries(
  {baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 120), cycleAmp: 0.06, noiseAmp: 0.008},
  {seed: 5, window: 2},
).current

// 节点名(中英响应)
const pvName = computed(() => t('光伏 PV', 'PV Solar'))
const bessName = computed(() => t('储能 BESS', 'Battery BESS'))
const gridName = computed(() => t('市电 Grid', 'Utility Grid'))
const dcName = computed(() => t('直流快充', 'DC Fast'))
const acName = computed(() => t('交流慢充', 'AC Slow'))
const auxName = computed(() => t('站用负荷', 'Aux Load'))

// 基准功率(kW)——能量守恒:源 800+600+1700=3100;负荷 2200+600+300=3100
const BASE = [
  {src: 'pv', tgt: 'dc', v: 560},
  {src: 'pv', tgt: 'ac', v: 200},
  {src: 'pv', tgt: 'aux', v: 40},
  {src: 'bess', tgt: 'dc', v: 480},
  {src: 'bess', tgt: 'ac', v: 100},
  {src: 'bess', tgt: 'aux', v: 20},
  {src: 'grid', tgt: 'dc', v: 1160},
  {src: 'grid', tgt: 'ac', v: 300},
  {src: 'grid', tgt: 'aux', v: 240},
]
const SRC = {pv: pvName, bess: bessName, grid: gridName}
const TGT = {dc: dcName, ac: acName, aux: auxName}

const option = computed(() => {
  const k = drift.value
  const name = {pv: pvName.value, bess: bessName.value, grid: gridName.value, dc: dcName.value, ac: acName.value, aux: auxName.value}
  const nodes = [
    {name: name.pv, itemStyle: {color: '#00e676'}},
    {name: name.bess, itemStyle: {color: '#00e5ff'}},
    {name: name.grid, itemStyle: {color: '#ffb020'}},
    {name: name.dc, itemStyle: {color: '#b980ff'}},
    {name: name.ac, itemStyle: {color: '#2b9bff'}},
    {name: name.aux, itemStyle: {color: '#6b8cae'}},
  ]
  const links = BASE.map((l) => ({
    source: name[l.src as keyof typeof name],
    target: name[l.tgt as keyof typeof name],
    value: Math.max(1, Math.round(l.v * k)),
  }))
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        if (p.dataType === 'edge') {
          return p.data.source + ' → ' + p.data.target + '<br/>' + t('功率', 'Power') + ': <b>' + p.data.value + ' kW</b>'
        }
        return '<b>' + p.name + '</b>'
      },
    },
    series: [
      {
        type: 'sankey',
        data: nodes,
        links,
        nodeAlign: 'justify',
        nodeWidth: 12,
        nodeGap: 12,
        layoutIterations: 32,
        emphasis: {focus: 'adjacency'},
        lineStyle: {color: 'gradient', opacity: 0.45, curveness: 0.5},
        label: {color: '#d4ecff', fontSize: 11},
        itemStyle: {borderWidth: 0},
      },
    ],
  }
})

const accessibleTitle = computed(() => t('光储充能量流桑基图', 'PV-Storage-Charging energy flow sankey'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
