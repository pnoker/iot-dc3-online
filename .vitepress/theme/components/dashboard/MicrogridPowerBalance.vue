<script setup lang="ts">
/**
 * 招牌③:24h 发用电功率平衡。
 * 堆叠面积:光伏发电 + 储能放电(供电侧);折线:负荷 / 电网交换(±,正购负售)。
 * markArea:峰/平/谷电价背景带(工业分时电价,深色低透明)。
 * 数据由日内 shape(PV 钟形、负荷双峰)× live 漂移生成 48 个半小时点。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const PV_MAX = 560
const BESS_KW = 180

// live 漂移:驱动日内曲线缓慢呼吸(整体出力 ±6%)。
const drift = useDomainSeries(
  {baseline: 1, unit: 'x', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 140), cycleAmp: 0.06, noiseAmp: 0.01},
  {seed: 5, window: 2},
)
const loadDrift = useDomainSeries(
  {baseline: 1, unit: 'x', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 110 + 1), cycleAmp: 0.05, noiseAmp: 0.01},
  {seed: 6, window: 2},
)

function pvShape(h: number): number {
  if (h < 6 || h > 18) return 0
  return Math.sin(((h - 6) / 12) * Math.PI) ** 2
}
function loadShape(h: number): number {
  const base = 430
  const morning = 200 * Math.exp(-((h - 10) ** 2) / 8)
  const evening = 260 * Math.exp(-((h - 19) ** 2) / 6)
  return base + morning + evening
}
// 储能策略:谷时(2-6)充电(负),峰时(9-11, 19-21)放电(正)
function bessShape(h: number): number {
  if (h >= 2 && h < 6) return -BESS_KW
  if ((h >= 9 && h < 11) || (h >= 19 && h < 21)) return BESS_KW
  return 0
}

const N = 48
const hours = Array.from({length: N}, (_, i) => i / 2)

const xLabels = hours.map((h) => {
  const hh = Math.floor(h)
  return hh % 2 === 0 ? `${String(hh).padStart(2, '0')}:00` : ''
})

function seriesData(pick: (h: number) => number) {
  return hours.map((h) => {
    const last = h === hours[hours.length - 1]
    const v = pick(h)
    return last ? {value: v, symbol: 'circle', symbolSize: 6} : v
  })
}

const option = computed(() => {
  const d = drift.current.value
  const ld = loadDrift.current.value
  const pv = seriesData((h) => +(PV_MAX * pvShape(h) * d).toFixed(1))
  const bess = seriesData((h) => {
    const b = bessShape(h)
    return b > 0 ? +(b * d).toFixed(1) : 0 // 仅堆正(放电)
  })
  const load = seriesData((h) => +(loadShape(h) * ld).toFixed(1))
  // 电网交换 = 负荷 - 光伏 - 储能放电(正=购电,负=售电)
  const grid = hours.map((h) => {
    const v = +(loadShape(h) * ld - PV_MAX * pvShape(h) * d - (bessShape(h) > 0 ? bessShape(h) * d : 0)).toFixed(1)
    return h === hours[hours.length - 1] ? {value: v, symbol: 'circle', symbolSize: 6} : v
  })

  const lp = t('峰', 'Peak')
  const lf = t('平', 'Flat')
  const lv = t('谷', 'Valley')
  const mkColor = (c: string) => ({itemStyle: {color: c, borderWidth: 0}, label: {color: '#8a98a8', fontSize: 9, position: 'insideTop', distance: 3}})

  return {
    legend: {
      data: [t('光伏发电', 'PV Gen'), t('储能放电', 'BESS Discharge'), t('负荷', 'Load'), t('电网交换', 'Grid Exchange')],
      top: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 8, fontSize: 11,
    },
    tooltip: {trigger: 'axis', axisPointer: {type: 'line'}},
    grid: {left: 8, right: 16, top: 30, bottom: 8, containLabel: true},
    xAxis: {type: 'category', boundaryGap: false, data: xLabels, axisTick: {show: false}, axisLabel: {hideOverlap: true}},
    yAxis: {type: 'value', name: 'kW', nameTextStyle: {color: '#6b8cae', fontSize: 10}},
    series: [
      {name: t('光伏发电', 'PV Gen'), type: 'line', stack: 'supply', symbol: 'none', smooth: 0.3, areaStyle: {}, data: pv},
      {name: t('储能放电', 'BESS Discharge'), type: 'line', stack: 'supply', symbol: 'none', smooth: 0.3, areaStyle: {}, data: bess},
      {name: t('负荷', 'Load'), type: 'line', symbol: 'none', smooth: 0.3, lineStyle: {width: 2.4}, data: load},
      {name: t('电网交换', 'Grid Exchange'), type: 'line', symbol: 'none', smooth: 0.3, lineStyle: {width: 2, type: 'dashed'}, data: grid,
        markArea: {
          silent: true,
          data: [
            [{...mkColor('rgba(43,155,255,0.12)'), xAxis: '00:00'}, {xAxis: '08:00'}],
            [{...mkColor('rgba(255,82,82,0.12)'), xAxis: '08:00', name: lp}, {xAxis: '12:00'}],
            [{...mkColor('rgba(148,163,184,0.08)'), xAxis: '12:00', name: lf}, {xAxis: '17:00'}],
            [{...mkColor('rgba(255,82,82,0.12)'), xAxis: '17:00', name: lp}, {xAxis: '21:00'}],
            [{...mkColor('rgba(43,155,255,0.12)'), xAxis: '21:00', name: lv}, {xAxis: '23:30'}],
          ],
        },
      },
    ],
  }
})

const accessibleTitle = computed(() => t('24 小时发用电功率平衡与峰平谷电价', '24h power balance with peak-flat-valley tariff'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
