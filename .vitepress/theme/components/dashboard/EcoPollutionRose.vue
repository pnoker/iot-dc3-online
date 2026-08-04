<script setup lang="ts">
/**
 * 招牌②:污染玫瑰图(ECharts polar + bar)。
 * 16 风向(N→NNW...CCW 顺序使罗盘方向正确)× PM2.5 浓度(μg/m³),
 * 西北(NW)盛行风 → 下风向 SE 浓度累积最高(高斯峰)。柱按浓度分级着色。
 * 中心叠加当前风向指示(NW 箭头,CSS 旋转,避免 ECharts graphic 定位漂移)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 16 方向,逆时针序(ECharts category angleAxis 自 startAngle=90 逆时针递增 → 罗盘正向)。
const DIRS = ['N', 'NNW', 'NW', 'WNW', 'W', 'WSW', 'SW', 'SSW', 'S', 'SSE', 'SE', 'ESE', 'E', 'ENE', 'NE', 'NNE']
// 各方向罗盘方位角(bearing),index i: bearing = (360 - i*22.5) % 360。
const BEARING = DIRS.map((_, i) => (360 - i * 22.5) % 360)
// 西北风(NW bearing=315)→ 污染向下风向 SE(bearing=135)输送累积。
const WIND_TO = 135
function angDist(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return Math.min(d, 360 - d)
}

// 峰值幅度慢漂移(实时感),背景浓度固定。
const peak = useDomainSeries(
  {baseline: 82, unit: 'μg/m³', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 120), cycleAmp: 0.07, noiseAmp: 1.6},
  {seed: 221, window: 2, intervalMs: 2000},
).current
const BG = 16
const SIGMA = 2.35

function concColor(v: number): string {
  if (v <= 35) return '#00e676'
  if (v <= 75) return '#a8e063'
  if (v <= 100) return '#ffd54f'
  if (v <= 130) return '#ffa726'
  return '#ff5252'
}

const labelMain = computed(() => t('PM2.5 浓度玫瑰', 'PM2.5 Pollution Rose'))
const windFrom = computed(() => t('NW 风', 'Wind: NW'))

const option = computed(() => {
  const pk = peak.value
  const data = BEARING.map((b, i) => {
    const d = angDist(b, WIND_TO)
    const v = +(BG + pk * Math.exp(-(d * d) / (2 * SIGMA * SIGMA))).toFixed(1)
    return {value: v, itemStyle: {color: concColor(v), shadowBlur: 6, shadowColor: concColor(v)}}
  })
  return {
    polar: {center: ['50%', '56%'], radius: '66%'},
    angleAxis: {
      type: 'category',
      data: DIRS,
      startAngle: 90,
      boundaryGap: false,
      axisLabel: {color: '#6b8cae', fontSize: 9, hideOverlap: true},
      axisLine: {lineStyle: {color: 'rgba(0,229,255,0.3)'}},
      axisTick: {show: false},
    },
    radiusAxis: {
      min: 0,
      max: 120,
      axisLabel: {color: '#6b8cae', fontSize: 9},
      axisLine: {show: false},
      splitLine: {lineStyle: {color: 'rgba(0,229,255,0.12)', type: 'dashed'}},
    },
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.name}<br/>PM2.5: <b>${p.value} μg/m³</b>`,
    },
    series: [
      {
        name: labelMain.value,
        type: 'bar',
        coordinateSystem: 'polar',
        data,
        barWidth: '62%',
      },
    ],
  }
})

const accessibleTitle = computed(() => t('16 方向污染浓度玫瑰图 含西北风向指示', '16-direction pollution concentration rose with NW wind indicator'))
</script>

<template>
  <div class="rose-wrap" role="img" :aria-label="accessibleTitle">
    <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
    <!-- 中心风向指示(CSS 旋转,稳态指向 NW) -->
    <div class="rose-center">
      <div class="rose-needle" :title="windFrom">
        <span class="rose-nub" />
      </div>
      <span class="rose-wind">{{ windFrom }}</span>
    </div>
  </div>
</template>

<style scoped>
.rose-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}
.rose-center {
  position: absolute;
  left: 50%;
  top: 56%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
}
.rose-needle {
  /* 默认指上(N),旋转 -45deg 指向 NW(盛行风来源) */
  width: 2px;
  height: 22px;
  background: linear-gradient(180deg, #00e5ff 0%, rgba(0, 229, 255, 0.15) 100%);
  transform: rotate(-45deg);
  transform-origin: bottom center;
  border-radius: 1px;
  box-shadow: 0 0 6px rgba(0, 229, 255, 0.7);
  position: relative;
}
.rose-nub {
  position: absolute;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00e5ff;
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.9);
}
.rose-wind {
  font-size: 10px;
  font-family: var(--dc3d-mono, monospace);
  color: #00e5ff;
  letter-spacing: 0.5px;
  text-shadow: 0 0 4px rgba(0, 229, 255, 0.6);
  margin-top: 6px;
}
</style>
