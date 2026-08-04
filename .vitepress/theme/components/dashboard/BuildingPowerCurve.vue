<script setup lang="ts">
/**
 * 24h 功率曲线 + 峰谷分时电价(TOU)markArea 着色 + 需量契约 markLine。
 * 功率钟形(夜间低谷 ~175kW,工作时段钟形峰,午间尖峰叠加)。
 * useDomainSeries 乘性漂移让整条曲线缓慢呼吸(实时感)。
 * TOU:谷(0-8)/峰(8-11)/平(11-18)/尖峰(18-21)/谷(21-24)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 乘性慢漂移(±5%)
const drift = useDomainSeries(
  {baseline: 1, unit: '×', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 130), cycleAmp: 0.05, noiseAmp: 0.015},
  {seed: 44, window: 2},
).current

const HOURS = Array.from({length: 24}, (_, h) => `${String(h).padStart(2, '0')}:00`)
function powerShape(hour: number): number {
  const night = 175
  let work = 0
  if (hour >= 7 && hour <= 19) {
    work = Math.sin(((hour - 7) / 12) * Math.PI) * 940 // 钟形峰
  }
  let sharp = 0
  if (hour >= 10 && hour <= 14) sharp = 220 // 午间尖峰
  if (hour >= 18 && hour <= 20) sharp = 170 // 晚峰
  return night + work + sharp
}

const PEAK_LIMIT = 1380 // 需量契约 kW(申报最大需量)

const accessibleTitle = computed(() => t('24 小时功率与峰谷电价', '24h load power with TOU tariff'))

const option = computed(() => {
  const m = drift.value
  const data = HOURS.map((_, h) => Math.round(powerShape(h) * m))
  const mk = (zh: string, enText: string, x0: number, x1: number, color: string) => [
    {name: t(zh, enText), xAxis: HOURS[x0], itemStyle: {color}},
    {xAxis: HOURS[x1]},
  ]
  return {
    legend: {data: [t('实时功率', 'Load Power')], top: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 8, fontSize: 11},
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        const p = params[0]
        return `${p.axisValue}<br/>${t('功率', 'Power')}: <b>${p.value} kW</b>`
      },
    },
    grid: {left: 8, right: 16, top: 30, bottom: 8, containLabel: true},
    xAxis: {type: 'category', boundaryGap: false, data: HOURS, axisTick: {show: false}, axisLabel: {hideOverlap: true, interval: 0}},
    yAxis: {type: 'value', name: t('kW', 'kW'), nameTextStyle: {color: '#94a3b8', fontSize: 10}},
    series: [
      {
        name: t('实时功率', 'Load Power'),
        type: 'line',
        symbol: 'none',
        smooth: 0.3,
        data,
        markArea: {
          silent: true,
          itemStyle: {borderWidth: 0},
          label: {color: '#94a3b8', fontSize: 9, fontWeight: 600, position: 'insideTop', distance: 3},
          data: [
            mk('谷电', 'Valley', 0, 8, 'rgba(57,255,158,0.07)'),
            mk('峰电', 'Peak', 8, 11, 'rgba(255,82,82,0.08)'),
            mk('平电', 'Flat', 11, 18, 'rgba(0,229,255,0.05)'),
            mk('尖峰', 'Sharp', 18, 21, 'rgba(255,82,82,0.10)'),
            mk('谷电', 'Valley', 21, 24, 'rgba(57,255,158,0.07)'),
          ],
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {color: '#ffa726', type: 'dashed', width: 1.5},
          label: {show: true, position: 'insideEndTop', color: '#ffa726', fontSize: 10, formatter: () => t('需量契约 {c} kW', 'Demand limit {c} kW')},
          data: [{yAxis: PEAK_LIMIT}],
        },
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(220px, 26vh, 320px)" />
</template>

<style scoped></style>
