<script setup lang="ts">
/**
 * 24h 空气质量时序(全宽底部)。
 * 双轴:左 = AQI(0-200,晨 7-9 与晚 18-21 交通扬尘峰,午后垂直扩散谷),
 * 右 = PM2.5(μg/m³,与 AQI 同形)。markArea 标 AQI 等级带(优/良/轻度/中度),
 * markLine 标良上限(100)与轻度上限(150)警戒线。全局漂移使曲线呼吸。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 24h AQI 形态(归一化 0..1):午后低(扩散强)、晨/晚峰(交通+湿度累积)。
function aqiShape(hour: number): number {
  const morn = Math.exp(-((hour - 8) ** 2) / 4)
  const eve = Math.exp(-((hour - 20) ** 2) / 5.5)
  const day = hour >= 11 && hour <= 15 ? 0.18 : 0.5
  return Math.min(1, Math.max(0.08, day + 0.62 * morn + 0.7 * eve))
}

const AQI_BASE = 55
const AQI_AMP = 95
const PM25_BASE = 28
const PM25_AMP = 36
const HOURS = Array.from({length: 24}, (_, h) => h)

// 全局漂移:使整条曲线缓变(±4%)。
const drift = useDomainSeries(
  {baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 60), cycleAmp: 0.04, noiseAmp: 0.006},
  {intervalMs: 2000, window: 2, seed: 88},
).current

const labelAqi = computed(() => t('空气质量 AQI', 'AQI'))
const labelPm = computed(() => t('PM2.5', 'PM2.5'))
const accessibleTitle = computed(() => t('24 小时 AQI 与 PM2.5 时序 含等级带', '24h AQI and PM2.5 with level bands'))

const option = computed(() => {
  const k = drift.value
  const aqiData = HOURS.map((h) => Math.round(AQI_BASE + AQI_AMP * aqiShape(h) * k))
  const pmData = HOURS.map((h) => +(PM25_BASE + PM25_AMP * aqiShape(h) * k).toFixed(0))
  return {
    legend: {
      data: [labelAqi.value, labelPm.value],
      top: 0,
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 8,
      fontSize: 11,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {type: 'line'},
      formatter: (params: any[]) => {
        const rows = params
          .filter((p) => p.value != null)
          .map((p) => {
            const unit = p.seriesIndex === 0 ? '' : ' μg/m³'
            return `<div>${p.marker} ${p.seriesName} <b>${p.value}${unit}</b></div>`
          })
        return `<div style="font-weight:600;margin-bottom:2px">${String(params[0]?.axisValue).padStart(2, '0')}:00</div>${rows.join('')}`
      },
    },
    grid: {left: 10, right: 16, top: 30, bottom: 8, containLabel: true},
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: HOURS.map((h) => String(h)),
      axisTick: {show: false},
      axisLabel: {hideOverlap: true, formatter: (v: string) => (+v) % 3 === 0 ? v + ':00' : ''},
    },
    yAxis: [
      {type: 'value', position: 'left', name: 'AQI', nameTextStyle: {color: '#6b8cae', fontSize: 10}, min: 0, max: 200, splitLine: {show: true}},
      {type: 'value', position: 'right', name: 'μg/m³', nameTextStyle: {color: '#6b8cae', fontSize: 10}, min: 0, max: 80, splitLine: {show: false}},
    ],
    series: [
      {
        name: labelAqi.value,
        type: 'line',
        yAxisIndex: 0,
        symbol: 'none',
        smooth: 0.3,
        lineStyle: {width: 2, color: '#ffa726'},
        itemStyle: {color: '#ffa726'},
        areaStyle: {color: {type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#ffa72655'}, {offset: 1, color: '#ffa72600'}]}},
        data: aqiData,
        // AQI 等级背景带(横向 markArea):优/良/轻度/中度
        markArea: {
          silent: true,
          itemStyle: {borderWidth: 0},
          label: {show: true, color: '#8a98a8', fontSize: 9, fontWeight: 600, position: 'insideTopLeft', distance: 4},
          data: [
            [{name: t('优', 'Good'), itemStyle: {color: 'rgba(0,230,118,0.08)'}, yAxis: 0}, {yAxis: 50}],
            [{name: t('良', 'Fair'), itemStyle: {color: 'rgba(168,224,99,0.08)'}, yAxis: 50}, {yAxis: 100}],
            [{name: t('轻度', 'Light'), itemStyle: {color: 'rgba(255,167,38,0.10)'}, yAxis: 100}, {yAxis: 150}],
            [{name: t('中度', 'Moderate'), itemStyle: {color: 'rgba(255,82,82,0.10)'}, yAxis: 150}, {yAxis: 200}],
          ],
        },
        // 良上限 / 轻度上限 警戒线
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: {type: 'dashed', width: 1.1},
          data: [
            {yAxis: 100, lineStyle: {color: '#a8e063'}, label: {color: '#a8e063', fontSize: 10, position: 'insideEndTop', formatter: t('良 100', 'Fair 100')}},
            {yAxis: 150, lineStyle: {color: '#ff8a8a'}, label: {color: '#ff8a8a', fontSize: 10, position: 'insideEndTop', formatter: t('轻度 150', 'Light 150')}},
          ],
        },
      },
      {
        name: labelPm.value,
        type: 'line',
        yAxisIndex: 1,
        symbol: 'none',
        smooth: 0.3,
        lineStyle: {width: 2, color: '#00e5ff'},
        itemStyle: {color: '#00e5ff'},
        areaStyle: {color: {type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#00e5ff55'}, {offset: 1, color: '#00e5ff00'}]}},
        data: pmData,
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
