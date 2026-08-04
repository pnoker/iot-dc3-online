<script setup lang="ts">
/**
 * 招牌②:分项能耗桑基图(总表 → 暖通/照明/插座/动力/特殊 → 代表楼层)。
 * 分项比例遵循 GB 50189 / 用电分项计量(暖通空调 ~46% 占比最大)。
 * 总能耗 useDomainSeries 缓漂,各支路按 share 分配,楼层按占比二次分摊。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 分项能耗比例(办公楼典型,暖通最大)
const SPLIT = [
  {key: 'hvac', zh: '暖通空调', en: 'HVAC', share: 0.46, color: '#00e5ff'},
  {key: 'light', zh: '照明', en: 'Lighting', share: 0.21, color: '#ffb020'},
  {key: 'plug', zh: '插座', en: 'Plug Load', share: 0.17, color: '#39ff9e'},
  {key: 'power', zh: '动力运输', en: 'Power', share: 0.10, color: '#b980ff'},
  {key: 'special', zh: '特殊用电', en: 'Special', share: 0.06, color: '#ff5cf0'},
]
// 代表楼层(避免桑基支路过密,8 层全显会糊成网)
const FLOORS = ['2F', '4F', '6F', '8F']
// 楼层分配比例(顶楼设备层动力大、商业层照明大,此处统一简化)
const FLOOR_SHARE: Record<string, number> = {'2F': 0.24, '4F': 0.26, '6F': 0.26, '8F': 0.24}

// 总能耗缓漂(乘性慢周期)
const total = useDomainSeries(
  {baseline: 1280, unit: 'kWh', cycle: (s) => Math.sin(s / 120), cycleAmp: 0.04, noiseAmp: 8},
  {intervalMs: 3000, window: 2, seed: 33},
).current

const mainName = computed(() => t('总表', 'Main Meter'))
const accessibleTitle = computed(() => t('分项能耗桑基图(总表→分项→楼层)', 'Sub-metered energy sankey'))

const option = computed(() => {
  const tot = Math.max(0, total.value)
  const fsum = FLOORS.reduce((a, f) => a + FLOOR_SHARE[f], 0)
  const nodes: any[] = [{name: mainName.value, itemStyle: {color: '#2b9bff'}}]
  SPLIT.forEach((s) => nodes.push({name: t(s.zh, s.en), itemStyle: {color: s.color}}))
  FLOORS.forEach((f) => nodes.push({name: f}))
  const links: any[] = []
  SPLIT.forEach((s) => {
    const catVal = +(tot * s.share).toFixed(1)
    links.push({source: mainName.value, target: t(s.zh, s.en), value: catVal})
    FLOORS.forEach((f) => {
      const v = +(catVal * (FLOOR_SHARE[f] / fsum)).toFixed(1)
      links.push({source: t(s.zh, s.en), target: f, value: v})
    })
  })
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        if (p.dataType === 'edge') {
          return `${p.data.source} → ${p.data.target}<br/>${t('能耗', 'Energy')}: <b>${p.data.value} kWh</b>`
        }
        return `<b>${p.name}</b>`
      },
    },
    series: [
      {
        type: 'sankey',
        top: 14,
        bottom: 14,
        right: 28,
        left: 28,
        nodeWidth: 14,
        nodeGap: 9,
        nodeAlign: 'justify',
        data: nodes,
        links,
        emphasis: {focus: 'adjacency'},
        lineStyle: {color: 'gradient', curveness: 0.5, opacity: 0.55},
        label: {color: '#d4ecff', fontSize: 11, fontWeight: 600},
        itemStyle: {borderWidth: 0},
        animation: false,
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(260px, 36vh, 400px)" />
</template>

<style scoped></style>
