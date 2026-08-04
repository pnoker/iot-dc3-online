<script setup lang="ts">
/**
 * 24h 流量×车速双轴(全天 profile,当前时刻游标)。
 * 流量(veh/h):早高峰 8:00 + 晚高峰 18:00 双峰;车速(km/h)反相关。
 * 用确定性 profile 函数生成 24 点,叠加微噪声;markLine = 当前时刻游标。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

function gauss(h: number, mu: number, sig: number) {return Math.exp(-((h - mu) ** 2) / (2 * sig * sig))}
function flow(h: number) {return 600 + 2400 * gauss(h, 8, 1.6) + 2600 * gauss(h, 18, 1.8) + 700 * gauss(h, 12, 2) + 350 * gauss(h, 7, 1)}
function speed(h: number) {return Math.max(16, Math.min(56, 56 - (flow(h) / 3000) * 38))}

// 当前时刻游标:每 120s 推进 1h,mod 24
const nowSrc = useDomainSeries({baseline: 0, unit: 'h', trend: (tt) => tt / 120, noiseAmp: 0}, {intervalMs: 1000, window: 2, seed: 13}).current
// 微噪声(让流量曲线轻微呼吸)
const wob = useDomainSeries({baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 60), cycleAmp: 0.04, noiseAmp: 0.01}, {seed: 17}).current

const hours = Array.from({length: 24}, (_, h) => h)
const flowData = computed(() => hours.map((h) => Math.round(flow(h) * wob.value)))
const speedData = computed(() => hours.map((h) => +(speed(h) / wob.value).toFixed(1)))
const nowH = computed(() => ((nowSrc.value % 24) + 24) % 24)

const accessibleTitle = computed(() => t('24小时流量与车速双轴', '24h flow and speed dual axis'))
const labelFlow = computed(() => t('流量', 'Flow'))
const labelSpeed = computed(() => t('车速', 'Speed'))

const option = computed(() => ({
  legend: {data: [labelFlow.value, labelSpeed.value], top: 0, icon: 'roundRect', itemWidth: 12, itemHeight: 8, fontSize: 11},
  tooltip: {trigger: 'axis', formatter: (p: any[]) => p.filter((x) => x.value != null).map((x) => `<div>${x.marker} ${x.seriesName} <b>${x.value}${x.seriesIndex === 0 ? ' veh/h' : ' km/h'}</b></div>`).join('')},
  grid: {left: 8, right: 12, top: 30, bottom: 8, containLabel: true},
  xAxis: {type: 'category', data: hours.map((h) => String(h)), name: t('时', 'h')},
  yAxis: [
    {type: 'value', position: 'left', name: t('veh/h', 'veh/h'), splitLine: {show: false}},
    {type: 'value', position: 'right', name: 'km/h', min: 0, max: 60, splitLine: {show: false}},
  ],
  series: [
    {name: labelFlow.value, type: 'line', yAxisIndex: 0, symbol: 'none', smooth: 0.3, data: flowData.value, markLine: {silent: true, symbol: 'none', label: {color: '#00e5ff', fontSize: 10, formatter: t('现在', 'now')}, lineStyle: {color: '#00e5ff', width: 1.5, type: 'dashed'}, data: [{xAxis: Math.round(nowH.value)}]}},
    {name: labelSpeed.value, type: 'line', yAxisIndex: 1, symbol: 'none', smooth: 0.3, data: speedData.value},
  ],
}))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" />
</template>
