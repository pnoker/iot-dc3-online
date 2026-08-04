<script setup lang="ts">
/**
 * 招牌①:楼层 × 防火分区 环境温度热力图(8 楼层 × 6 分区)。
 * 色阶连续(蓝-绿-琥珀-红),tooltip 联动派生 CO₂/占用(温度高→人多→CO₂高)。
 * 稳定基态(顶楼偏热、向阳面偏热)+ ~20% 易变格受实时漂移驱动翻转 → 实时感而不闪屏。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'
import {useTheme} from '../../composables/useTheme'

const {en, t} = useI18n()
const {isDark} = useTheme()

const FLOORS = ['8F', '7F', '6F', '5F', '4F', '3F', '2F', '1F']
const ZONES_ZH = ['A 分区', 'B 分区', 'C 分区', 'D 分区', 'E 分区', 'F 分区']
const ZONES_EN = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F']
const zoneNames = computed(() => (en.value ? ZONES_EN : ZONES_ZH))

// 纯函数哈希(确定性,SSR 可复现)
function hash3(a: number, b: number, c: number): number {
  let h = (a * 374761393 + b * 668265263 + c * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return ((h >>> 0) % 100000) / 100000
}
// 基态温度:顶楼(8F,index 0)偏热,各分区微异。中心 23.8-26.5°C
function baseTemp(floorIdx: number, zone: number): number {
  const floorBoost = (7 - floorIdx) * 0.22 // 顶楼偏热
  const zoneBias = (hash3(floorIdx, zone, 101) - 0.5) * 1.6
  return 23.8 + floorBoost + zoneBias
}
function isVolatile(floorIdx: number, zone: number): boolean {
  return hash3(floorIdx, zone, 303) < 0.2
}

// 实时温度漂移(additive 慢周期)
const {current} = useDomainSeries(
  {baseline: 0, unit: '°C', cycleMode: 'additive', cycle: (tt) => Math.sin(tt / 60), cycleAmp: 1.6, noiseAmp: 0.4},
  {intervalMs: 3000, seed: 9},
)

// CO₂/占用 随温度派生(温度高 = 人多 = CO₂高),确定性
function co2Of(floorIdx: number, zone: number, temp: number): number {
  const base = 470 + hash3(floorIdx, zone, 707) * 200
  return Math.round(base + (temp - 24) * 36)
}
function occOf(floorIdx: number, zone: number, temp: number): number {
  const cap = 18 + Math.round(hash3(floorIdx, zone, 808) * 32)
  const ratio = Math.max(0, Math.min(1, (temp - 22) / 8))
  return Math.round(cap * (0.25 + ratio * 0.7))
}

const accessibleTitle = computed(() => t('楼层×防火分区环境温度热力图', 'Floor × fire-zone temperature heatmap'))

const option = computed(() => {
  const drift = current.value
  const data: any[] = []
  for (let f = 0; f < 8; f++) {
    for (let z = 0; z < 6; z++) {
      const base = baseTemp(f, z)
      const live = isVolatile(f, z) ? drift * (0.6 + hash3(f, z, 404)) : 0
      const temp = +(base + live).toFixed(1)
      data.push({
        value: [z, f, temp],
        temp,
        floor: FLOORS[f],
        zone: zoneNames.value[z],
        co2: co2Of(f, z, temp),
        occ: occOf(f, z, temp),
      })
    }
  }
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const d = p.data
        return [
          `<b>${d.floor} · ${d.zone}</b>`,
          `${t('温度', 'Temp')}: <b>${d.temp}°C</b>`,
          `${t('CO₂', 'CO₂')}: ${d.co2} ppm`,
          `${t('占用', 'Occ.')}: ${d.occ} ${t('人', 'ppl')}`,
        ].join('<br/>')
      },
    },
    grid: {left: 40, right: 14, top: 12, bottom: 56, containLabel: true},
    xAxis: {type: 'category', data: zoneNames.value, position: 'bottom', axisTick: {show: false}, splitArea: {show: false}},
    yAxis: {type: 'category', data: FLOORS, axisTick: {show: false}, splitArea: {show: false}},
    visualMap: {
      type: 'continuous',
      min: 21,
      max: 30,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 8,
      itemWidth: 12,
      itemHeight: 110,
      // 蓝(冷)→绿(舒适 24±2)→琥珀(偏热)→红(过热)
      inRange: {color: ['#2b9bff', '#16c784', '#ffb020', '#ff5252']},
      textStyle: {color: isDark.value ? '#8a98a8' : '#6b7a89', fontSize: 10},
    },
    series: [
      {
        type: 'heatmap',
        data,
        animation: false,
        itemStyle: {borderColor: isDark.value ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)', borderWidth: 1, borderRadius: 3},
        emphasis: {itemStyle: {borderColor: isDark.value ? '#cbd5e1' : '#0f172a', borderWidth: 1.5}},
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(280px, 40vh, 440px)" />
</template>

<style scoped></style>
