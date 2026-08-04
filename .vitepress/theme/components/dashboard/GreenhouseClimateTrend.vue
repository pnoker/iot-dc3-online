<script setup lang="ts">
/**
 * 棚内气候时序(BaseChart line,双 Y 轴):CO₂ 浓度(ppm,左轴)+ 冠层温度(℃,右轴)。
 * 真实工况:白天 CO₂ 富集(光合消耗使浓度回落 + 补气维持 800-1000),夜间呼吸上升;
 * 温度随光照昼升夜降。useDomainSeries 各自缓变 + 60 点滚动窗,实时趋势。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// CO₂:baseline 760 ppm,白天富集(±8%),夜间呼吸会升高;此处小周期模拟日内波动
const co2 = useDomainSeries(
  {baseline: 760, unit: 'ppm', cycle: (s) => Math.sin(s / 130), cycleAmp: 0.07, noiseAmp: 12},
  {intervalMs: 1500, window: 60, seed: 801},
)
// 冠层温度:baseline 24.2℃,昼升夜降的小幅周期 + 微噪声
const temp = useDomainSeries(
  {baseline: 24.2, unit: '℃', cycle: (s) => Math.sin(s / 140 + 1.5), cycleAmp: 0.06, noiseAmp: 0.18},
  {intervalMs: 1500, window: 60, seed: 802},
)

const accessibleTitle = computed(() => t('棚内 CO₂ 与温度实时趋势', 'Greenhouse CO₂ & temperature trend'))

const option = computed(() => ({
  legend: {
    data: ['CO₂', t('冠层温度', 'Canopy Temp')],
    top: 2,
    textStyle: {color: '#6b8cae', fontSize: 11},
    itemWidth: 12,
    itemHeight: 8,
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any[]) =>
      params
        .map((p) => {
          const unit = p.seriesName === 'CO₂' ? 'ppm' : '℃'
          return `${p.seriesName}: <b>${(+p.value[1]).toFixed(1)}</b> ${unit}`
        })
        .join('<br/>'),
  },
  grid: {left: 50, right: 46, top: 30, bottom: 24},
  xAxis: {
    type: 'value',
    min: 'dataMin',
    max: 'dataMax',
    axisLabel: {show: false},
    splitLine: {show: false},
  },
  yAxis: [
    {
      type: 'value',
      name: 'CO₂(ppm)',
      nameTextStyle: {color: '#00e5ff', fontSize: 10},
      min: 400,
      max: 1100,
      interval: 200,
      position: 'left',
      axisLabel: {color: '#00e5ff', fontSize: 10},
    },
    {
      type: 'value',
      name: '℃',
      nameTextStyle: {color: '#ffb020', fontSize: 10},
      min: 16,
      max: 32,
      interval: 4,
      position: 'right',
      axisLabel: {color: '#ffb020', fontSize: 10},
      splitLine: {show: false},
    },
  ],
  series: [
    {
      name: 'CO₂',
      type: 'line',
      yAxisIndex: 0,
      data: co2.series.value.map((p) => [p[0], p[1]]),
      showSymbol: false,
      // CO₂ 富集目标带 800-1000 ppm(语义色固定 hex)
      markArea: {
        silent: true,
        itemStyle: {color: 'rgba(0,230,118,0.06)', borderWidth: 0},
        label: {show: false},
        data: [[{yAxis: 800}, {yAxis: 1000}]],
      },
      itemStyle: {color: '#00e5ff'},
      lineStyle: {color: '#00e5ff'},
    },
    {
      name: t('冠层温度', 'Canopy Temp'),
      type: 'line',
      yAxisIndex: 1,
      data: temp.series.value.map((p) => [p[0], p[1]]),
      showSymbol: false,
      itemStyle: {color: '#ffb020'},
      lineStyle: {color: '#ffb020'},
    },
  ],
}))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(200px, 26vh, 280px)" />
</template>

<style scoped>
/* 图表区由 BaseChart 托管 */
</style>
