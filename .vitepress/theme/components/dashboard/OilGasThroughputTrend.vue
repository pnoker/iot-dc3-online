<script setup lang="ts">
/**
 * 24h 输量与管网压力时序(全宽底部)。
 * 双轴:左=瞬时输量(Nm³/h,日变化曲线,晨 7-9 / 晚 17-22 用气双峰,夜 2-5 谷),
 * 右=管网出站压力(MPa,与需求反相关)。markArea 高亮晚高峰用气窗口(17-22 时)。
 * markLine 标注 MAOP 与供气压力下限。全局漂移使曲线呼吸。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 24h 用气负荷形态:夜间谷 ~0.18、日基线 ~0.5、晨/晚双峰。
function loadShape(hour: number): number {
  const morn = Math.exp(-((hour - 8) ** 2) / 3.5)
  const eve = Math.exp(-((hour - 19.5) ** 2) / 5)
  const base = hour >= 1 && hour <= 5 ? 0.18 : 0.48
  return Math.min(1, Math.max(0.12, base + 0.5 * morn + 0.68 * eve))
}

// 输量(Nm³/h):峰 ~46 万、谷 ~12 万;压力(MPa):与需求反相关 4.8-6.4。
const FLOW_BASE = 100000
const FLOW_AMP = 360000
const P_HI = 6.4
const P_LO = 4.8

const HOURS = Array.from({length: 24}, (_, h) => h)

const drift = useDomainSeries(
  {baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 60), cycleAmp: 0.03, noiseAmp: 0.005},
  {intervalMs: 2000, window: 2, seed: 1077},
).current

const labelFlow = computed(() => t('瞬时输量', 'Throughput'))
const labelPress = computed(() => t('出站压力', 'Outlet Press.'))
const MAOP = 6.5

const accessibleTitle = computed(() => t('24 小时输量与压力时序 含晚高峰窗口', '24h throughput and pressure with evening peak window'))

const option = computed(() => {
  const k = drift.value
  const flowData = HOURS.map((h) => Math.round((FLOW_BASE + FLOW_AMP * loadShape(h) * k) / 1000) * 1000)
  const pressData = HOURS.map((h) => +(P_HI - (P_HI - P_LO) * loadShape(h) * (0.6 + 0.4 * k)).toFixed(2))
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
        const head = '<div style="font-weight:600;margin-bottom:2px">' + String(params[0]?.axisValue).padStart(2, '0') + ':00</div>'
        const rows = params
          .filter((p) => p.value != null)
          .map((p) => {
            const unit = p.seriesIndex === 0 ? ' Nm³/h' : ' MPa'
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
      axisLabel: {hideOverlap: true, formatter: (v: string) => (+v) % 3 === 0 ? v + ':00' : ''},
    },
    yAxis: [
      {type: 'value', position: 'left', name: 'Nm³/h', nameTextStyle: {color: '#6b8cae', fontSize: 10}, splitLine: {show: true}, axisLabel: {formatter: (v: number) => v / 10000 + '万'}},
      {type: 'value', position: 'right', name: 'MPa', nameTextStyle: {color: '#6b8cae', fontSize: 10}, min: 4.4, max: 6.8, splitLine: {show: false}},
    ],
    series: [
      {
        name: labelFlow.value,
        type: 'line',
        yAxisIndex: 0,
        symbol: 'none',
        smooth: 0.3,
        lineStyle: {width: 2, color: '#00e5ff'},
        itemStyle: {color: '#00e5ff'},
        data: flowData,
        markArea: {
          silent: true,
          itemStyle: {color: 'rgba(255,160,32,0.10)', borderWidth: 0},
          label: {show: true, color: '#ffb020', fontSize: 10, fontWeight: 600, position: 'insideTop', distance: 4, formatter: t('晚高峰', 'Evening peak')},
          data: [[{xAxis: '17'}, {xAxis: '22'}]],
        },
      },
      {
        name: labelPress.value,
        type: 'line',
        yAxisIndex: 1,
        symbol: 'none',
        smooth: 0.3,
        lineStyle: {width: 2, color: '#ffb020'},
        itemStyle: {color: '#ffb020'},
        data: pressData,
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: {type: 'dashed', color: '#ff5252', width: 1.2},
          label: {show: true, position: 'insideEndTop', color: '#ff5252', fontSize: 10, formatter: t('MAOP {c} MPa', 'MAOP {c} MPa')},
          data: [{yAxis: MAOP}],
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
