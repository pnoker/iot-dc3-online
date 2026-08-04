<script setup lang="ts">
/**
 * 岸桥效率:ECharts gauge(全场 STS moves/h 加权平均,0-35)+ 利用率条 + 在线台数。
 * gauge 分段:<22 红(低效掉档) / 22-26 琥珀 / 26-30 绿(健康) / 30-35 青(高效)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const movesSrc = useDomainSeries(
  {baseline: 26.7, unit: 'moves/h', cycle: (s) => Math.sin(s / 120), cycleAmp: 0.08, noiseAmp: 0.4},
  {seed: 901, window: 2, intervalMs: 2000},
)
const moves = computed(() => Math.max(0, Math.min(35, movesSrc.current.value)))

const utilSrc = useDomainSeries(
  {baseline: 79, unit: '%', cycle: (s) => Math.sin(s / 140 + 1), cycleAmp: 0.04, noiseAmp: 0.5},
  {seed: 902, window: 2},
)
const util = computed(() => Math.max(0, Math.min(100, utilSrc.current.value)))

const onlineSrc = useDomainSeries(
  {baseline: 7.4, unit: 'set', cycle: (s) => Math.sin(s / 200 + 2), cycleAmp: 0.05, noiseAmp: 0.06},
  {seed: 903, window: 2, intervalMs: 3000},
)
const online = computed(() => Math.round(onlineSrc.current.value))
const TOTAL_STC = 8

const band = computed(() => {
  const v = moves.value
  if (v < 22) return {color: '#ff5252', zh: '低效掉档', en: 'Low / miss'}
  if (v < 26) return {color: '#ffb020', zh: '待提升', en: 'Fair'}
  if (v < 30) return {color: '#00e676', zh: '健康', en: 'Healthy'}
  return {color: '#00e5ff', zh: '高效', en: 'Excellent'}
})

const option = computed(() => ({
  series: [
    {
      type: 'gauge',
      min: 0,
      max: 35,
      startAngle: 210,
      endAngle: -30,
      radius: '92%',
      center: ['50%', '60%'],
      progress: {show: true, width: 11, roundCap: true},
      pointer: {width: 4, length: '60%', itemStyle: {color: '#d4ecff'}},
      anchor: {show: true, size: 10, itemStyle: {color: '#d4ecff', borderColor: band.value.color, borderWidth: 2}},
      axisLine: {
        lineStyle: {
          width: 11,
          color: [
            [22 / 35, '#ff5252'],
            [26 / 35, '#ffb020'],
            [30 / 35, '#00e676'],
            [1, '#00e5ff'],
          ],
        },
      },
      axisTick: {distance: -20, length: 4, lineStyle: {color: 'rgba(212,236,255,0.5)'}},
      splitLine: {distance: -22, length: 10, lineStyle: {color: 'rgba(212,236,255,0.6)', width: 1.4}},
      axisLabel: {distance: -2, color: '#6b8cae', fontSize: 9},
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '32%'],
        formatter: '{value}',
        color: band.value.color,
        fontSize: 24,
        fontWeight: 800,
        fontFamily: 'var(--dc3d-mono)',
      },
      title: {offsetCenter: [0, '56%'], color: '#6b8cae', fontSize: 10},
      data: [{value: +moves.value.toFixed(1), name: 'moves/h'}],
    },
  ],
}))

const utilPct = computed(() => Math.round(util.value))
const utilColor = computed(() => (util.value >= 85 ? '#ff5252' : util.value >= 70 ? '#00e676' : '#ffb020'))
const accessibleTitle = computed(() => t('岸桥 moves/h 仪表与利用率', 'STS moves per hour gauge and utilization'))
</script>

<template>
  <div class="mv" role="group" :aria-label="accessibleTitle">
    <div class="mv-gauge">
      <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
    </div>
    <div class="mv-side">
      <div class="mv-band" :style="{color: band.color}">● {{ t(band.zh, band.en) }}</div>
      <div class="mv-row">
        <span class="mv-name">{{ t('利用率', 'Utilization') }}</span>
        <span class="mv-val" :style="{color: utilColor}">{{ utilPct }}%</span>
      </div>
      <div class="mv-track">
        <div class="mv-fill" :style="{width: utilPct + '%', background: utilColor, boxShadow: '0 0 8px ' + utilColor}" />
      </div>
      <div class="mv-row">
        <span class="mv-name">{{ t('在线岸桥', 'STC Online') }}</span>
        <span class="mv-val">{{ online }} / {{ TOTAL_STC }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mv { display: flex; gap: 8px; width: 100%; height: 100%; box-sizing: border-box; }
.mv-gauge { flex: 1.5; min-width: 0; height: 100%; }
.mv-side { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; justify-content: center; padding: 0 4px; }
.mv-band { font-size: 13px; font-weight: 700; letter-spacing: 0.5px; }
.mv-row { display: flex; justify-content: space-between; align-items: baseline; }
.mv-name { font-size: 11px; color: var(--dc3d-text-dim); }
.mv-val { font-size: 14px; font-weight: 700; font-family: var(--dc3d-mono); color: var(--dc3d-text); }
.mv-track { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
.mv-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
</style>
