<script setup lang="ts">
/**
 * 泵站机组效率:3 个 gauge 并排(1#/2#/3# 泵站综合效率%)。
 * 基准 70-82%(典型离心泵机组效率),乘性慢周期 + 微噪声。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const PUMPS = [
  {zh: '1#泵站', en: 'PS-1', baseline: 81.5, seed: 411},
  {zh: '2#泵站', en: 'PS-2', baseline: 76.2, seed: 422},
  {zh: '3#泵站', en: 'PS-3', baseline: 71.8, seed: 433},
]
const effs = PUMPS.map((p) => ({
  ref: p,
  val: useDomainSeries({baseline: p.baseline, unit: '%', cycle: (s) => Math.sin(s / 130 + p.seed), cycleAmp: 0.04, noiseAmp: 0.4}, {seed: p.seed, window: 2}).current,
}))

function effColor(v: number): string {
  if (v >= 78) return '#00e676'
  if (v >= 70) return '#ffa726'
  return '#ff5252'
}

const option = computed(() => {
  return {
    tooltip: {trigger: 'item', formatter: (p: any) => `${p.name}<br/>${t('泵效', 'Eff.')}: <b>${p.value.toFixed(1)}%</b>`},
    series: effs.map((e, i) => {
      const v = Math.max(50, Math.min(92, e.val.value))
      return {
        type: 'gauge',
        center: [`${16 + i * 34}%`, '58%'],
        radius: '52%',
        min: 50,
        max: 92,
        startAngle: 200,
        endAngle: -20,
        splitNumber: 4,
        axisLine: {lineStyle: {width: 8, color: [[0.5, '#ff5252'], [0.75, '#ffa726'], [1, '#00e676']]}},
        pointer: {itemStyle: {color: effColor(v)}, length: '58%', width: 3},
        anchor: {show: true, size: 8, itemStyle: {color: '#d4ecff'}},
        axisTick: {distance: -12, length: 4, lineStyle: {color: 'rgba(255,255,255,0.3)'}},
        splitLine: {distance: -14, length: 8, lineStyle: {color: '#d4ecff', width: 2}},
        axisLabel: {color: '#6b8cae', fontSize: 9, distance: -22},
        title: {show: true, offsetCenter: [0, '72%'], color: '#d4ecff', fontSize: 12, fontWeight: 600},
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '30%'],
          formatter: '{value}%',
          color: effColor(v),
          fontSize: 16,
          fontWeight: 700,
          fontFamily: 'var(--dc3d-mono, monospace)',
        },
        data: [{value: +v.toFixed(1), name: t(e.ref.zh, e.ref.en)}],
      }
    }),
  }
})

const accessibleTitle = computed(() => t('泵站机组实时效率仪表', 'Pump unit real-time efficiency gauges'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
