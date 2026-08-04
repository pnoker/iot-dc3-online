<script setup lang="ts">
/**
 * 日吞吐达成概览:ECharts gauge(今日 TEU/d vs 目标)+ 关键子指标条。
 * 码头日吞吐目标按泊位与岸桥产能核定,gauge 分段:<70% 红 / 70-90% 琥珀 / 90-100% 绿 / >100% 青(超额)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const DAILY_TARGET = 9200 // TEU/d 目标

const teu = useDomainSeries(
  {baseline: 8240, unit: 'TEU', trend: (time) => time * 1.6, cycle: (s) => Math.sin(s / 200), cycleAmp: 0.008, noiseAmp: 6},
  {seed: 66, window: 2},
).current

const achieve = computed(() => Math.max(0, Math.min(140, (teu.value / DAILY_TARGET) * 100)))
const band = computed(() => {
  const v = achieve.value
  if (v < 70) return {color: '#ff5252', zh: '未达产', en: 'Below target'}
  if (v < 90) return {color: '#ffb020', zh: '接近目标', en: 'Near target'}
  if (v <= 100) return {color: '#00e676', zh: '达成', en: 'On target'}
  return {color: '#00e5ff', zh: '超额', en: 'Exceeded'}
})

// 泊位工时利用率与岸桥利用率(辅指标)
const berthUtil = useDomainSeries(
  {baseline: 88, unit: '%', cycle: (s) => Math.sin(s / 140 + 1), cycleAmp: 0.03, noiseAmp: 0.4},
  {seed: 77, window: 2},
).current
const stsUtil = useDomainSeries(
  {baseline: 79, unit: '%', cycle: (s) => Math.sin(s / 120 + 2), cycleAmp: 0.04, noiseAmp: 0.5},
  {seed: 88, window: 2},
).current

const option = computed(() => ({
  series: [
    {
      type: 'gauge',
      min: 0,
      max: 140,
      startAngle: 210,
      endAngle: -30,
      radius: '94%',
      center: ['50%', '62%'],
      progress: {show: true, width: 10, roundCap: true},
      pointer: {width: 3, length: '60%', itemStyle: {color: '#d4ecff'}},
      anchor: {show: true, size: 9, itemStyle: {color: '#d4ecff', borderColor: band.value.color, borderWidth: 2}},
      axisLine: {
        lineStyle: {
          width: 10,
          color: [
            [0.5, '#ff5252'],
            [0.643, '#ffb020'],
            [0.714, '#00e676'],
            [1, '#00e5ff'],
          ],
        },
      },
      axisTick: {distance: -18, length: 4, lineStyle: {color: 'rgba(212,236,255,0.5)'}},
      splitLine: {distance: -20, length: 9, lineStyle: {color: 'rgba(212,236,255,0.6)', width: 1.4}},
      axisLabel: {distance: -2, color: '#6b8cae', fontSize: 8},
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '34%'],
        formatter: '{value}%',
        color: band.value.color,
        fontSize: 22,
        fontWeight: 800,
        fontFamily: 'var(--dc3d-mono)',
      },
      title: {offsetCenter: [0, '58%'], color: '#6b8cae', fontSize: 9},
      data: [{value: Math.round(achieve.value), name: 'TEU/d'}],
    },
  ],
}))

const accessibleTitle = computed(() => t('日吞吐 TEU/d 达成率概览', 'Daily TEU throughput achievement overview'))
</script>

<template>
  <div class="thp" role="group" :aria-label="accessibleTitle">
    <div class="thp-gauge">
      <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
    </div>
    <div class="thp-sub">
      <div class="thp-row">
        <span class="thp-name">{{ t('今日 TEU', 'Today TEU') }}</span>
        <span class="thp-val">{{ Math.round(teu).toLocaleString() }}</span>
      </div>
      <div class="thp-row">
        <span class="thp-name">{{ t('目标', 'Target') }}</span>
        <span class="thp-val thp-dim">{{ DAILY_TARGET.toLocaleString() }}</span>
      </div>
      <div class="thp-row">
        <span class="thp-name">{{ t('泊位工时', 'Berth Util') }}</span>
        <span class="thp-val" :style="{color: '#00e676'}">{{ Math.round(berthUtil) }}%</span>
      </div>
      <div class="thp-row">
        <span class="thp-name">{{ t('岸桥利用率', 'STS Util') }}</span>
        <span class="thp-val" :style="{color: '#00e5ff'}">{{ Math.round(stsUtil) }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thp { display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0; box-sizing: border-box; }
.thp-gauge { flex: 1; min-height: 0; }
.thp-sub { flex: 0 0 auto; display: flex; flex-direction: column; gap: 3px; padding: 4px 10px 2px; }
.thp-row { display: flex; justify-content: space-between; align-items: baseline; font-size: 11px; }
.thp-name { color: var(--dc3d-text-dim); }
.thp-val { color: var(--dc3d-text); font-family: var(--dc3d-mono); font-weight: 700; }
.thp-dim { color: var(--dc3d-text-dim); }
</style>
