<script setup lang="ts">
/**
 * 余氯水质热力图:24 小时 × 8 监测站,值为余氯浓度(mg/L,GB 5749 末端≥0.05)。
 * 出厂口/近泵站高,远端/末梢低。确定性基态 + 易变格 live 漂移(实时感而不闪屏)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const STATIONS_ZH = ['出厂口', '1#泵站', '管网中段', 'DMA-01', 'DMA-02', 'DMA-03', '末梢点', '边远区']
const STATIONS_EN = ['WTP Out', 'PS-1', 'Mid-net', 'DMA-01', 'DMA-02', 'DMA-03', 'End-point', 'Remote']
const stationNames = computed(() => (en.value ? STATIONS_EN : STATIONS_ZH))
const HOURS = 24

// 各站基准余氯:自水源向末端递减(0.85→0.42)。
const STATION_BASE = [0.86, 0.80, 0.70, 0.64, 0.58, 0.50, 0.46, 0.42]

function hash3(a: number, b: number, c: number): number {
  let h = (a * 374761393 + b * 668265263 + c * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return ((h >>> 0) % 100000) / 100000
}
// 夜间(2-5 点)水量小、停留久,余氯略降;确定性叠加。
function hourAdj(hour: number): number {
  if (hour >= 2 && hour <= 5) return -0.06
  if (hour >= 7 && hour <= 9) return 0.04
  if (hour >= 18 && hour <= 21) return 0.03
  return 0
}
function isVolatile(st: number, hr: number): boolean {
  return hash3(st, hr, 303) < 0.18
}

// 实时漂移信号(0..1)驱动易变格在阈值处翻转。
const {current} = useDomainSeries(
  {baseline: 0.5, unit: '', cycleMode: 'multiplicative', cycle: (tt) => Math.sin(tt / 20), cycleAmp: 0.35, noiseAmp: 0.15},
  {intervalMs: 3000, seed: 9},
)

const accessibleTitle = computed(() => t('余氯水质热力图', 'Residual chlorine heatmap'))

const option = computed(() => {
  const live = Math.max(0, Math.min(1, current.value))
  const data: any[] = []
  for (let st = 0; st < STATION_BASE.length; st++) {
    for (let hr = 0; hr < HOURS; hr++) {
      let v = STATION_BASE[st] + hourAdj(hr)
      v += (hash3(st, hr, 101) - 0.5) * 0.04
      if (isVolatile(st, hr)) {
        const phase = hash3(st, hr, 202) * 6.2832
        v += (Math.sin(live * 6.2832 + phase) * 0.5) * 0.12
      }
      data.push({
        value: [hr, st, +v.toFixed(2)],
        station: stationNames.value[st],
        hour: `${String(hr).padStart(2, '0')}:00`,
      })
    }
  }
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const d = p.data
        return `<b>${d.station}</b><br/>${t('时段', 'Hour')}: ${d.hour}<br/>${t('余氯', 'Cl₂')}: <b>${d.value[2]} mg/L</b>`
      },
    },
    grid: {left: 56, right: 14, top: 12, bottom: 78, containLabel: false},
    xAxis: {
      type: 'category',
      data: Array.from({length: HOURS}, (_, h) => (h % 3 === 0 ? String(h) : '')),
      position: 'bottom',
      axisTick: {show: false},
      splitArea: {show: false},
    },
    yAxis: {
      type: 'category',
      data: stationNames.value,
      inverse: true,
      axisTick: {show: false},
      splitArea: {show: false},
    },
    visualMap: {
      min: 0.2,
      max: 1.0,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 6,
      itemWidth: 11,
      itemHeight: 120,
      inRange: {color: ['#ff5252', '#ffa726', '#00e676', '#00e5ff']},
      text: [t('高 mg/L', 'High'), t('低', 'Low')],
      textStyle: {color: '#8a98a8', fontSize: 11},
    },
    series: [
      {
        type: 'heatmap',
        data,
        animation: false,
        itemStyle: {borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderRadius: 2},
        emphasis: {itemStyle: {borderColor: '#cbd5e1', borderWidth: 1.5}},
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
