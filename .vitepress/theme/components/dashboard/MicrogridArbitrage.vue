<script setup lang="ts">
/**
 * 今日峰谷套利收益瀑布(底部全宽)。
 * 三组漂移驱动:购电支出(谷充)/ 售电与放电收入 / 补贴。
 * 瀑布技法:透明占位 stack('arb') + 实色增量条;终点=净收益(正常色)。
 * 与 OEE 瀑布同构,语义色固定 hex。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const driftCost = useDomainSeries(
  {baseline: 1, unit: 'x', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 100), cycleAmp: 0.1, noiseAmp: 0.01},
  {seed: 41, window: 2},
)
const driftRev = useDomainSeries(
  {baseline: 1, unit: 'x', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 100 + 2.1), cycleAmp: 0.12, noiseAmp: 0.01},
  {seed: 42, window: 2},
)

const c = (v: number) => Math.round(v)

// 基线金额(元):谷时充电成本为支出,其余为收入/节省
const items = computed(() => {
  const co = driftCost.current.value
  const rv = driftRev.current.value
  return [
    {key: 'cost', v: -c(820 * co), color: '#dc2626', zh: '谷时充电', en: 'Valley Charge'},
    {key: 'sell', v: c(1640 * rv), color: '#00e676', zh: '峰时放电售电', en: 'Peak Sell'},
    {key: 'pv', v: c(560 * rv), color: '#00e5ff', zh: '余电上网', en: 'PV Export'},
    {key: 'demand', v: c(380 * rv), color: '#2b9bff', zh: '需量电费节省', en: 'Demand Saving'},
    {key: 'sub', v: c(220 * co), color: '#7a5cff', zh: '绿电补贴', en: 'Subsidy'},
  ]
})

const net = computed(() => items.value.reduce((s, it) => s + it.v, 0))

const option = computed(() => {
  const it = items.value
  const names = [
    t('充电支出', 'Charge Cost'),
    t('峰时售电', 'Peak Sell'),
    t('余电上网', 'PV Export'),
    t('需量节省', 'Demand'),
    t('绿电补贴', 'Subsidy'),
    t('净收益', 'Net Profit'),
  ]
  const placeholder: number[] = new Array(6).fill(0)
  const bars: any[] = []

  // 起点:首项成本(支出,画为负向条)
  placeholder[0] = 0
  bars[0] = bar(it[0].v, it[0].color, `${it[0].v}`, {name: names[0], value: it[0].v})

  // 累计水位:从首项成本起逐项加
  let running = it[0].v
  for (let i = 1; i < it.length; i++) {
    placeholder[i] = running
    bars[i] = bar(it[i].v, it[i].color, `${it[i].v > 0 ? '+' : ''}${it[i].v}`, {name: names[i], value: it[i].v})
    running += it[i].v
  }
  placeholder[5] = 0
  bars[5] = {
    value: net.value,
    itemStyle: {color: net.value >= 0 ? '#16a34a' : '#dc2626', borderRadius: [3, 3, 0, 0]},
    label: {
      show: true, position: 'top',
      formatter: [`{a|${net.value}}`, `{b|${t('净收益', 'Net')}}`].join('\n'),
      rich: {
        a: {fontSize: 13, fontWeight: 700, color: net.value >= 0 ? '#16a34a' : '#dc2626', lineHeight: 15, align: 'center'},
        b: {fontSize: 9, color: '#94a3b8', lineHeight: 11, align: 'center'},
      },
    },
    _meta: {name: names[5], value: net.value},
  }

  const unit = t('元', 'CNY')
  return {
    grid: {left: 46, right: 16, top: 30, bottom: 40},
    xAxis: {type: 'category', data: names, axisLabel: {interval: 0, fontSize: 10, rotate: 0}},
    yAxis: {type: 'value', name: unit, nameTextStyle: {color: '#6b8cae', fontSize: 10}},
    tooltip: {
      trigger: 'axis',
      axisPointer: {type: 'shadow'},
      formatter: (params: any[]) => {
        const p = (params || []).find((x) => x.seriesName === '__val')
        const d = p?.data?._meta
        return d ? `<b>${d.name}</b><br/>${t('金额', 'Amount')}: <b>${d.value} ${unit}</b>` : ''
      },
    },
    series: [
      {name: '__ph', type: 'bar', stack: 'arb', silent: true, itemStyle: {color: 'transparent', borderColor: 'transparent'}, barWidth: '40%', data: placeholder, z: 1},
      {
        name: '__val', type: 'bar', stack: 'arb', barWidth: '40%', data: bars, z: 2,
        markLine: {
          silent: true, symbol: 'none', label: {show: false},
          lineStyle: {color: 'rgba(148,163,184,0.5)', type: 'dashed', width: 1},
          data: [{yAxis: 0}],
        },
      },
    ],
  }
})

function bar(value: number, color: string, label: string, meta: any) {
  return {
    value,
    itemStyle: {color, borderRadius: [3, 3, 0, 0]},
    label: {show: true, position: 'top', formatter: label, color, fontSize: 11, fontWeight: 600},
    _meta: meta,
  }
}

const accessibleTitle = computed(() => t('今日储能峰谷套利收益瀑布', 'Daily peak-valley arbitrage profit waterfall'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(200px, 26vh, 320px)" />
</template>

<style scoped></style>
