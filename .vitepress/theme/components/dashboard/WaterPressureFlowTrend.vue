<script setup lang="ts">
/**
 * 24h 管网压力与流量时序(全宽底部)。
 * 双轴:左=瞬时流量(m³/h,日变化曲线,晨 7-9 / 晚 18-21 峰,夜 2-4 MNF 谷),
 * 右=管网压力(MPa,与需求反相关)。markArea 高亮 MNF 夜间最小流量窗口(2-4 时)。
 * markLine 标注供水压力下限。全局漂移使曲线呼吸。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 24h 需求形态函数(归一化 0..1):夜间谷 ~0.12、日基线 ~0.45、晨/晚双峰。
function demandShape(hour: number): number {
  const morn = Math.exp(-((hour - 8) ** 2) / 3.5)
  const eve = Math.exp(-((hour - 19) ** 2) / 5)
  const night = hour >= 1 && hour <= 4 ? 0.12 : 0.42
  return Math.min(1, Math.max(0.1, night + 0.5 * morn + 0.62 * eve))
}

// 流量基线(m³/h):峰 ~760、谷 ~190;压力(MPa):与需求反相关 0.255-0.315。
const FLOW_BASE = 180
const FLOW_AMP = 580
const P_HI = 0.315
const P_LO = 0.255

const HOURS = Array.from({length: 24}, (_, h) => h)

// 全局漂移:使整条曲线缓变(±3%)。
const drift = useDomainSeries(
  {baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 60), cycleAmp: 0.03, noiseAmp: 0.005},
  {intervalMs: 2000, window: 2, seed: 77},
).current

const labelFlow = computed(() => t('瞬时流量', 'Flow'))
const labelPress = computed(() => t('管网压力', 'Pressure'))
const MNF_LABEL = 'MNF'

const accessibleTitle = computed(() => t('24 小时管网压力流量时序 含夜间最小流量窗口', '24h pressure and flow with MNF window'))

const option = computed(() => {
  const k = drift.value
  const flowData = HOURS.map((h) => +(FLOW_BASE + FLOW_AMP * demandShape(h) * k).toFixed(0))
  const pressData = HOURS.map((h) => +(P_HI - (P_HI - P_LO) * demandShape(h) * (0.6 + 0.4 * k)).toFixed(3))
  return {
    legend: {
      data: [labelFlow.value, labelPress.value],
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
        const rows = params
          .filter((p) => p.value != null)
          .map((p) => {
            const unit = p.seriesIndex === 0 ? ' m³/h' : ' MPa'
            return `<div>${p.marker} ${p.seriesName} <b>${p.value}${unit}</b></div>`
          })
        return `<div style="font-weight:600;margin-bottom:2px">${String(params[0]?.axisValue).padStart(2, '0')}:00</div>${rows.join('')}`
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
    yAxis: [
      {type: 'value', position: 'left', name: 'm³/h', nameTextStyle: {color: '#6b8cae', fontSize: 10}, splitLine: {show: true}},
      {type: 'value', position: 'right', name: 'MPa', nameTextStyle: {color: '#6b8cae', fontSize: 10}, min: 0.24, max: 0.33, splitLine: {show: false}},
    ],
    series: [
      {
        name: labelFlow.value,
        type: 'line',
        yAxisIndex: 0,
        symbol: 'none',
        smooth: 0.3,
        lineStyle: {width: 2},
        data: flowData,
        // 夜间最小流量窗口(2-4 时)高亮
        markArea: {
          silent: true,
          itemStyle: {color: 'rgba(255,138,138,0.10)', borderWidth: 0},
          label: {show: true, color: '#ff8a8a', fontSize: 10, fontWeight: 600, position: 'insideTop', distance: 4, formatter: MNF_LABEL},
          data: [[{xAxis: '2'}, {xAxis: '4'}]],
        },
      },
      {
        name: labelPress.value,
        type: 'line',
        yAxisIndex: 1,
        symbol: 'none',
        smooth: 0.3,
        lineStyle: {width: 2},
        data: pressData,
        // 供水压力下限警戒
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: {type: 'dashed', color: '#ffa726', width: 1.2},
          label: {show: true, position: 'insideEndTop', color: '#ffa726', fontSize: 10, formatter: t('压力下限 {c} MPa', 'Min {c} MPa')},
          data: [{yAxis: 0.26}],
        },
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
