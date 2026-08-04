<script setup lang="ts">
/**
 * 管存量(line-pack)24h 趋势(BaseChart line + markArea)。
 * 管存是天然气管网的重要储能:夜间用气低谷管存蓄压(升),晚高峰前调峰释放(降)。
 * 双系列:管存量(10⁴Nm³,左轴)、输量(Nm³/h,右轴)。
 * markArea 高亮晚高峰调峰窗口(17-22 时,管存被快速采出)。
 * 全局漂移使曲线呼吸(±3%)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const HOURS = Array.from({length: 24}, (_, h) => h)

// 24h 用气负荷形态:夜间 0-5 谷、6-9 晨峰、日间中载、17-22 晚峰(调峰释放)。
function loadShape(hour: number): number {
  const morn = Math.exp(-((hour - 7.5) ** 2) / 3.5)
  const eve = Math.exp(-((hour - 19.5) ** 2) / 5)
  const base = hour >= 1 && hour <= 5 ? 0.35 : 0.6
  return Math.min(1, Math.max(0.2, base + 0.55 * morn + 0.7 * eve))
}

// 管存量(10⁴Nm³):与负荷反相关 —— 谷时蓄压(高)、峰时采出(低)。基准 520-680。
const PACK_BASE = 540
const PACK_SWING = 90
// 输量(Nm³/h):与负荷正相关。基准 28-48 万。
const FLOW_BASE = 200000
const FLOW_SWING = 260000

const drift = useDomainSeries(
  {baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 70), cycleAmp: 0.025, noiseAmp: 0.004},
  {intervalMs: 2000, window: 2, seed: 677},
).current

const labelPack = computed(() => t('管存量', 'Line-pack'))
const labelFlow = computed(() => t('输量', 'Throughput'))
const accessibleTitle = computed(() => t('管存量与输量 24h 趋势 含调峰窗口', 'Line-pack and throughput 24h trend with peak-shaving window'))

const option = computed(() => {
  const k = drift.value
  // 管存 = 基线 + 摆幅 × (1 - 负荷) —— 谷时高、峰时低
  const packData = HOURS.map((h) => +(PACK_BASE + PACK_SWING * (1 - loadShape(h)) * k).toFixed(1))
  // 输量 = 基线 + 摆幅 × 负荷
  const flowData = HOURS.map((h) => Math.round(FLOW_BASE + FLOW_SWING * loadShape(h) * k))
  return {
    legend: {
      data: [labelPack.value, labelFlow.value],
      top: 0,
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 8,
      fontSize: 11,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {type: 'line'},
      formatter: (params: any[]) => {
        const head = '<div style="font-weight:600;margin-bottom:2px">' + String(params[0]?.axisValue).padStart(2, '0') + ':00</div>'
        const rows = params
          .filter((p) => p.value != null)
          .map((p) => {
            const unit = p.seriesIndex === 0 ? ' 10⁴Nm³' : ' Nm³/h'
            return '<div>' + p.marker + ' ' + p.seriesName + ' <b>' + p.value + unit + '</b></div>'
          })
        return head + rows.join('')
      },
    },
    grid: {left: 10, right: 16, top: 30, bottom: 8, containLabel: true},
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: HOURS.map((h) => String(h)),
      axisTick: {show: false},
      axisLabel: {hideOverlap: true, formatter: (v: string) => (+v) % 6 === 0 ? v + ':00' : ''},
    },
    yAxis: [
      {type: 'value', position: 'left', name: '10⁴Nm³', nameTextStyle: {color: '#6b8cae', fontSize: 10}, min: 500, max: 720, splitLine: {show: true}},
      {type: 'value', position: 'right', name: 'Nm³/h', nameTextStyle: {color: '#6b8cae', fontSize: 10}, splitLine: {show: false}, axisLabel: {formatter: (v: number) => v / 10000 + '万'}},
    ],
    series: [
      {
        name: labelPack.value,
        type: 'line',
        yAxisIndex: 0,
        symbol: 'none',
        smooth: 0.3,
        lineStyle: {width: 2, color: '#b980ff'},
        itemStyle: {color: '#b980ff'},
        data: packData,
        markArea: {
          silent: true,
          itemStyle: {color: 'rgba(255,160,32,0.12)', borderWidth: 0},
          label: {show: true, color: '#ffb020', fontSize: 10, fontWeight: 600, position: 'insideTop', distance: 4, formatter: t('调峰释放', 'Peak-shaving')},
          data: [[{xAxis: '17'}, {xAxis: '22'}]],
        },
      },
      {
        name: labelFlow.value,
        type: 'line',
        yAxisIndex: 1,
        symbol: 'none',
        smooth: 0.3,
        lineStyle: {width: 2, color: '#00e5ff'},
        itemStyle: {color: '#00e5ff'},
        data: flowData,
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
