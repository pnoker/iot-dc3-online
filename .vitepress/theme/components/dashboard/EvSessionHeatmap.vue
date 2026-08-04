<script setup lang="ts">
/**
 * 招牌③:单桩充电会话热力(ECharts heatmap)。
 * 枪号(6 直流快充 + 6 交流慢充)× 24 小时,值 = 充电功率(kW),识别功率密度与高峰。
 * 占位不充(充满未拔/油车占位)用 scatter 红圈叠加——区分"空闲 0kW"与"占用却不充电"。
 * DC 快充:晚高峰(18-22)密集、功率高;AC 慢充:凌晨(0-6)网约车/居民密集。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const DC_GUNS = 6
const AC_GUNS = 6
const GUN_COUNT = DC_GUNS + AC_GUNS
const HOURS = 24

const gunNames = computed(() => {
  const dc = Array.from({length: DC_GUNS}, (_, i) => 'DC-' + String(i + 1).padStart(2, '0'))
  const ac = Array.from({length: AC_GUNS}, (_, i) => 'AC-' + String(i + 1).padStart(2, '0'))
  return en.value ? dc.concat(ac) : dc.concat(ac)
})

const DC_MAX = 120 // kW 直流快充额定
const AC_MAX = 22 // kW 交流慢充额定

function hash3(a: number, b: number, c: number): number {
  let h = (a * 374761393 + b * 668265263 + c * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return ((h >>> 0) % 100000) / 100000
}

// 占用率 shape(0..1):DC 晚高峰主导,AC 凌晨主导
function dcOcc(h: number): number {
  const base = 0.4
  const evening = 0.5 * Math.exp(-((h - 20) ** 2) / 8)
  const morning = 0.22 * Math.exp(-((h - 8) ** 2) / 4)
  const day = 0.12 * Math.exp(-((h - 13) ** 2) / 14)
  return Math.min(0.95, base + evening + morning + day)
}
function acOcc(h: number): number {
  const base = 0.32
  const night = 0.5 * Math.exp(-((h - 3) ** 2) / 6)
  const day = 0.16 * Math.exp(-((h - 11) ** 2) / 12)
  const eve = 0.12 * Math.exp(-((h - 19) ** 2) / 6)
  return Math.min(0.95, base + night + day + eve)
}

// live 漂移(0..1)驱动易变格在阈值翻转
const {current} = useDomainSeries(
  {baseline: 0.5, unit: '', cycleMode: 'multiplicative', cycle: (tt) => Math.sin(tt / 22), cycleAmp: 0.4, noiseAmp: 0.15},
  {intervalMs: 3000, seed: 9},
)

const accessibleTitle = computed(() => t('充电枪会话功率热力图', 'Charging-gun session power heatmap'))

const option = computed(() => {
  const live = Math.max(0, Math.min(1, current.value))
  const data: any[] = []
  const stalls: any[] = [] // 占位不充标记
  for (let g = 0; g < GUN_COUNT; g++) {
    const isDc = g < DC_GUNS
    const maxP = isDc ? DC_MAX : AC_MAX
    for (let hr = 0; hr < HOURS; hr++) {
      const occ0 = isDc ? dcOcc(hr) : acOcc(hr)
      // 确定性微扰 + live 驱动翻转
      let occ = occ0 + (hash3(g, hr, 101) - 0.5) * 0.18
      if (hash3(g, hr, 202) < 0.22) {
        const phase = hash3(g, hr, 303) * 6.2832
        occ += Math.sin(live * 6.2832 + phase) * 0.12
      }
      occ = Math.max(0, Math.min(1, occ))
      let power = 0
      let status = 'idle'
      if (occ > 0.55) {
        // 充电中:实际功率随车端需求(SOC 高时降流)+ 枪间差异
        const demand = 0.5 + 0.5 * occ
        const soc = 0.75 + (hash3(g, hr, 404) - 0.5) * 0.4 // 后半段降功率
        const taper = soc > 0.9 ? 0.55 : 1
        power = +(maxP * demand * taper * (0.88 + 0.12 * live)).toFixed(1)
        status = 'charging'
      } else if (occ > 0.36) {
        // 占位不充(充满未拔 / 油车占位)
        power = 0
        status = 'stall'
        stalls.push({value: [hr, g], gun: gunNames.value[g], hour: String(hr).padStart(2, '0') + ':00'})
      }
      data.push({
        value: [hr, g, power],
        gun: gunNames.value[g],
        hour: String(hr).padStart(2, '0') + ':00',
        status,
      })
    }
  }
  const statusTxt = (s: string) => (s === 'charging' ? t('充电中', 'Charging') : s === 'stall' ? t('占位不充', 'Stalled') : t('空闲', 'Idle'))
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const d = p.data
        if (p.seriesName === 'stall') {
          return '<b>' + d.gun + '</b><br/>' + t('时段', 'Hour') + ': ' + d.hour + '<br/><span style="color:#ff5252">● ' + t('占位不充', 'Stalled (occupied, no charge)') + '</span>'
        }
        return '<b>' + d.gun + '</b><br/>' + t('时段', 'Hour') + ': ' + d.hour + '<br/>' + t('功率', 'Power') + ': <b>' + d.value[2] + ' kW</b> (' + statusTxt(d.status) + ')'
      },
    },
    grid: {left: 50, right: 12, top: 10, bottom: 74, containLabel: false},
    xAxis: {
      type: 'category',
      data: Array.from({length: HOURS}, (_, h) => (h % 3 === 0 ? String(h) : '')),
      position: 'bottom',
      axisTick: {show: false},
      splitArea: {show: false},
    },
    yAxis: {
      type: 'category',
      data: gunNames.value,
      inverse: true,
      axisTick: {show: false},
      splitArea: {show: false},
    },
    visualMap: {
      min: 0,
      max: 120,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 6,
      itemWidth: 11,
      itemHeight: 110,
      inRange: {color: ['#0d1b2a', '#1b3a5b', '#00e676', '#00e5ff', '#ffb020', '#ff5252']},
      text: [t('高 kW', 'High'), t('空闲', 'Idle')],
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
      {
        name: 'stall',
        type: 'scatter',
        data: stalls,
        symbol: 'circle',
        symbolSize: 12,
        itemStyle: {color: 'transparent', borderColor: '#ff5252', borderWidth: 1.6},
        z: 5,
        tooltip: {show: true},
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
