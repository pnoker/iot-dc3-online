<script setup lang="ts">
/**
 * 24h 多温区温度时序(全宽底部)。三温区(冷冻/冷藏/恒温)日变化曲线,
 * 双轴:左=温度 ℃(tooltip 兼显 ℉)。每温区 markLine 标上下限,
 * 越限点用红色 scatter(由 useDomainSeries events 产生偏离)。
 * 全局漂移使曲线呼吸。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const HOURS = Array.from({length: 24}, (_, h) => h)

// 三温区设定区间(冷冻/冷藏/恒温)与基线
const SPEC = [
  {key: 'frozen', zh: '冷冻库', en: 'Frozen', lo: -25, hi: -18, base: -21.5, color: '#2b9bff', seed: 631},
  {key: 'chilled', zh: '冷藏库', en: 'Chilled', lo: 2, hi: 8, base: 5, color: '#00e5ff', seed: 632},
  {key: 'constant', zh: '恒温库', en: 'Constant', lo: 15, hi: 20, base: 17.2, color: '#00e676', seed: 633},
]

// 日变化形态:夜间(0-6)略低(开门少)、午间(11-15)略高(开门频繁)
function dayShape(hour: number): number {
  const noon = Math.exp(-((hour - 13) ** 2) / 14)
  const eve = 0.5 * Math.exp(-((hour - 19) ** 2) / 6)
  return 0.5 * noon + eve // 0..~0.6
}

// 全局漂移
const drift = useDomainSeries(
  {baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 60), cycleAmp: 0.02, noiseAmp: 0.004},
  {intervalMs: 2000, window: 2, seed: 77},
).current

const labels = computed(() => SPEC.map((s) => t(s.zh, s.en)))
const accessibleTitle = computed(() => t('24 小时各温区温度时序 含限值线', '24h temperature by zone with limit lines'))

const option = computed(() => {
  const k = drift.value
  const series: any[] = []
  // 每温区:line + 上下限 markLine(附在首 series 上集中渲染避免重复)
  SPEC.forEach((s, i) => {
    const data = HOURS.map((h) => {
      const swing = (s.hi - s.lo) / 2
      // 基线 + 日变化偏移(午间向上靠近上限)+ 漂移
      const v = s.base + swing * 0.5 * dayShape(h) * k + (i === 1 ? 0.4 * Math.sin(h) : 0)
      return [h, +v.toFixed(2)]
    })
    series.push({
      name: labels.value[i],
      type: 'line',
      symbol: 'none',
      smooth: 0.3,
      data,
      // 上限警戒 markLine(每条线各带自己的上下限)
      markLine: {
        symbol: 'none',
        silent: true,
        lineStyle: {type: 'dashed', width: 1, color: s.color},
        label: {show: i === 0, color: s.color, fontSize: 9, position: 'insideEndTop'},
        data: [
          {yAxis: s.hi},
          {yAxis: s.lo},
        ],
      },
    })
  })
  // 越限红散点(冷藏区午间偶发越上限,模拟门封漏温)
  const excData: [number, number][] = []
  for (let h = 11; h <= 15; h++) {
    if ((h * 7) % 5 < 2) excData.push([h, +(8.6 + 0.2 * Math.sin(h)).toFixed(2)])
  }
  series.push({
    name: t('越限点', 'Excursion'),
    type: 'scatter',
    symbolSize: 9,
    data: excData,
    itemStyle: {color: '#ff5252', shadowBlur: 8, shadowColor: '#ff5252'},
  })

  return {
    legend: {data: [...labels.value, t('越限点', 'Excursion')], top: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 8, fontSize: 11},
    tooltip: {
      trigger: 'axis',
      formatter: (p: any[]) => {
        const rows = p.filter((q) => q.value[1] != null).map((q) => {
          if (q.seriesName === t('越限点', 'Excursion')) {
            return `<div>${q.marker} ${q.seriesName} <b>${q.value[1].toFixed(1)}℃</b></div>`
          }
          const c = q.value[1]
          return `<div>${q.marker} ${q.seriesName} <b>${c.toFixed(1)}℃ / ${((c * 9) / 5 + 32).toFixed(1)}℉</b></div>`
        })
        return `<div style="font-weight:600;margin-bottom:2px">${String(p[0]?.axisValue ?? '').padStart(2, '0')}:00</div>${rows.join('')}`
      },
    },
    grid: {left: 10, right: 16, top: 30, bottom: 8, containLabel: true},
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: HOURS.map((h) => String(h)),
      axisTick: {show: false},
      axisLabel: {hideOverlap: true, formatter: (v: string) => (+v) % 3 === 0 ? v + ':00' : ''},
    },
    yAxis: {
      type: 'value',
      name: '℃',
      nameTextStyle: {color: '#6b8cae', fontSize: 10},
    },
    series,
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
