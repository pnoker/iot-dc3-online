<script setup lang="ts">
/**
 * 辅:空间占用时空热力(8 楼层 × 24 小时)。
 * 占用率钟形(夜间 ~6%,工作时段 7-20h 钟形峰 ~90%,午休微凹)。
 * 静态日形态 + 近时段(右侧)受实时漂移轻微影响 → 既见全日规律又有实时感。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'
import {useTheme} from '../../composables/useTheme'

const {t} = useI18n()
const {isDark} = useTheme()

const FLOORS = ['8F', '7F', '6F', '5F', '4F', '3F', '2F', '1F']
const HOURS = Array.from({length: 24}, (_, h) => `${String(h).padStart(2, '0')}:00`)

// 占用率钟形(按楼层微异,顶楼偏少)
function occupancyShape(hour: number, floorIdx: number): number {
  const base = 6
  let work = 0
  if (hour >= 7 && hour <= 20) {
    const x = (hour - 7) / 13
    work = Math.sin(x * Math.PI) * 88
  }
  if (hour === 12 || hour === 13) work *= 0.7 // 午休
  const floorBias = (3.5 - floorIdx) * 1.6
  return Math.max(0, Math.min(100, base + work + floorBias))
}

// 实时漂移(additive,影响近时段)
const {current} = useDomainSeries(
  {baseline: 0, unit: '%', cycleMode: 'additive', cycle: (tt) => Math.sin(tt / 50), cycleAmp: 3.5, noiseAmp: 1},
  {intervalMs: 3000, seed: 5},
)

const accessibleTitle = computed(() => t('楼层 24 小时占用时空热力图', 'Floor 24h occupancy heatmap'))

const option = computed(() => {
  const drift = current.value
  const data: any[] = []
  for (let f = 0; f < 8; f++) {
    for (let h = 0; h < 24; h++) {
      const recency = h / 23
      const live = recency * drift
      let occ = +(occupancyShape(h, f) + live).toFixed(1)
      occ = Math.max(0, Math.min(100, occ))
      data.push({value: [h, f, occ], occ, floor: FLOORS[f], hour: HOURS[h]})
    }
  }
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const d = p.data
        return `<b>${d.floor} · ${d.hour}</b><br/>${t('占用率', 'Occupancy')}: <b>${d.occ}%</b>`
      },
    },
    grid: {left: 40, right: 14, top: 12, bottom: 50, containLabel: true},
    xAxis: {
      type: 'category',
      data: HOURS,
      position: 'bottom',
      axisTick: {show: false},
      splitArea: {show: false},
      axisLabel: {interval: 2},
    },
    yAxis: {type: 'category', data: FLOORS, axisTick: {show: false}, splitArea: {show: false}},
    visualMap: {
      type: 'continuous',
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 6,
      itemWidth: 12,
      itemHeight: 110,
      inRange: {color: ['#0a2a4a', '#0a5e8e', '#00e5ff', '#39ff9e', '#ffb020']},
      textStyle: {color: isDark.value ? '#8a98a8' : '#6b7a89', fontSize: 10},
    },
    series: [
      {
        type: 'heatmap',
        data,
        animation: false,
        itemStyle: {borderColor: isDark.value ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)', borderWidth: 1, borderRadius: 2},
        emphasis: {itemStyle: {borderColor: isDark.value ? '#cbd5e1' : '#0f172a', borderWidth: 1.5}},
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(260px, 36vh, 400px)" />
</template>

<style scoped></style>
