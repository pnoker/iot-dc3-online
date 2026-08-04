<script setup lang="ts">
/**
 * 水质断面小多图:4 个断面 WQI 仪表并排(gauge)。
 * GB 3838 地表水 6 类:Ⅰ(≥90)/Ⅱ(75-90)/Ⅲ(60-75)/Ⅳ(40-60)/Ⅴ(30-40)/劣Ⅴ(<30)。
 * 仪表色带按 6 类渐变,指针读数 + 类别标签。各断面 useDomainSeries 慢漂移。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Section {
  name: string
  base: number
  seed: number
}
// 4 个监测断面(自上游清洁向下游恶化),WQI 跨 Ⅰ-Ⅴ 类。
const SECTIONS: Section[] = [
  {name: t('渭河上游', 'Wei R. Up'), base: 92, seed: 511},
  {name: t('沣河入渭', 'Feng Mouth'), base: 78, seed: 522},
  {name: t('灞河中游', 'Ba R. Mid'), base: 64, seed: 533},
  {name: t('浐河下游', 'Chan R. Low'), base: 46, seed: 544},
]

const drifts = SECTIONS.map((s) => ({
  ref: s,
  val: useDomainSeries(
    {baseline: s.base, unit: '', cycleMode: 'multiplicative', cycle: (st) => Math.sin(st / 130 + s.seed), cycleAmp: 0.05, noiseAmp: 1.4},
    {seed: s.seed, window: 2, intervalMs: 2000},
  ).current,
}))

// WQI → 水质类别(GB 3838)。
function wqiClass(v: number): {tag: string; color: string} {
  if (v >= 90) return {tag: 'Ⅰ', color: '#00e676'}
  if (v >= 75) return {tag: 'Ⅱ', color: '#00e5ff'}
  if (v >= 60) return {tag: 'Ⅲ', color: '#a8e063'}
  if (v >= 40) return {tag: 'Ⅳ', color: '#ffa726'}
  if (v >= 30) return {tag: 'Ⅴ', color: '#ff7043'}
  return {tag: t('劣Ⅴ', 'WorseⅤ'), color: '#ff5252'}
}

// 仪表色带:6 类分段(0-30 劣Ⅴ红 / 30-40 Ⅴ / 40-60 Ⅳ / 60-75 Ⅲ / 75-90 Ⅱ / 90-100 Ⅰ)。
const AXIS_COLOR = [
  [0.3, '#ff5252'],
  [0.4, '#ff7043'],
  [0.6, '#ffa726'],
  [0.75, '#a8e063'],
  [0.9, '#00e5ff'],
  [1, '#00e676'],
]

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (p: any) => {
      const cls = wqiClass(p.value)
      return `${p.name}<br/>${t('水质指数', 'WQI')}: <b>${p.value.toFixed(0)}</b><br/>${t('类别', 'Class')}: <b style="color:${cls.color}">${cls.tag}</b>`
    },
  },
  series: drifts.map((d, i) => {
    const v = Math.max(0, Math.min(100, d.val.value))
    const cls = wqiClass(v)
    return {
      type: 'gauge',
      center: [`${12 + i * 25.3}%`, '58%'],
      radius: '54%',
      min: 0,
      max: 100,
      startAngle: 200,
      endAngle: -20,
      splitNumber: 5,
      axisLine: {lineStyle: {width: 7, color: AXIS_COLOR}},
      pointer: {itemStyle: {color: cls.color}, length: '58%', width: 3},
      anchor: {show: true, size: 7, itemStyle: {color: '#d4ecff'}},
      axisTick: {distance: -11, length: 4, lineStyle: {color: 'rgba(255,255,255,0.3)'}},
      splitLine: {distance: -13, length: 7, lineStyle: {color: '#d4ecff', width: 1.5}},
      axisLabel: {color: '#6b8cae', fontSize: 8, distance: -20},
      title: {show: true, offsetCenter: [0, '74%'], color: '#d4ecff', fontSize: 11, fontWeight: 600},
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '30%'],
        formatter: '{value}',
        color: cls.color,
        fontSize: 15,
        fontWeight: 700,
        fontFamily: 'var(--dc3d-mono, monospace)',
      },
      data: [{value: +v.toFixed(0), name: d.ref.name + ' · ' + cls.tag}],
    }
  }),
}))

const accessibleTitle = computed(() => t('水质监测断面 WQI 仪表 Ⅰ至劣Ⅴ 类', 'Water quality cross-section WQI gauges, class I to worse-V'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
