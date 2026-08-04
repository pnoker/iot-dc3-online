<script setup lang="ts">
/**
 * 招牌③:瓦斯浓度多测点实时时序(ECharts line + 法定阈值 markLine + 超标 markArea)。
 * 瓦斯 CH₄ 用 %vol 体积比(非 %LEL)。三测点:
 *   T1 工作面回风隅角(最高,落煤涌出偶发阶跃)、T2 掘进面、T3 回风巷。
 * 法定阈值(markLine):1.0% 报警 / 1.5% 断电 / 2.5% 撤人(接近爆炸下限)。
 * markArea:1.0-1.5 琥珀(报警区)、1.5-2.5 红(断电撤人区),超限区一目了然。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 三测点滚动时序:T1 偶发 spike 跨越 1.0% 报警线(落煤瓦斯涌出)
const t1 = useDomainSeries(
  {baseline: 0.62, unit: '%vol', cycle: (s) => Math.sin(s / 60), cycleAmp: 0.18, noiseAmp: 0.025, events: [{rate: 1 / 45, type: 'spike', size: 0.46}, {rate: 1 / 120, type: 'step', size: 0.4, duration: 22}]},
  {intervalMs: 1500, window: 60, seed: 41},
)
const t2 = useDomainSeries(
  {baseline: 0.44, unit: '%vol', cycle: (s) => Math.sin(s / 70 + 1.1), cycleAmp: 0.14, noiseAmp: 0.02, events: [{rate: 1 / 90, type: 'spike', size: 0.3}]},
  {intervalMs: 1500, window: 60, seed: 42},
)
const t3 = useDomainSeries(
  {baseline: 0.3, unit: '%vol', cycle: (s) => Math.sin(s / 80 + 2.2), cycleAmp: 0.12, noiseAmp: 0.015},
  {intervalMs: 1500, window: 60, seed: 43},
)

const L1 = computed(() => t('T1 工作面', 'T1 Face'))
const L2 = computed(() => t('T2 掘进面', 'T2 Heading'))
const L3 = computed(() => t('T3 回风巷', 'T3 Return'))

const accessibleTitle = computed(() => t('瓦斯浓度三测点时序与法定阈值', 'Gas %vol at 3 sensors with legal thresholds'))

const option = computed(() => ({
  legend: {data: [L1.value, L2.value, L3.value], top: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 8, fontSize: 11},
  tooltip: {
    trigger: 'axis',
    formatter: (p: any[]) => p
      .filter((x) => x.value != null)
      .map((x) => `<div>${x.marker} ${x.seriesName} <b>${x.value.toFixed(2)} %vol</b></div>`)
      .join(''),
  },
  grid: {left: 8, right: 16, top: 30, bottom: 8, containLabel: true},
  xAxis: {type: 'category', boundaryGap: false, axisTick: {show: false}, axisLabel: {show: false}},
  yAxis: {
    type: 'value',
    min: 0,
    max: 2.6,
    name: '%vol',
    nameTextStyle: {color: '#6b8cae', fontSize: 10},
    splitLine: {show: true},
  },
  series: [
    {
      name: L1.value,
      type: 'line',
      symbol: 'none',
      smooth: 0.3,
      // 超标渐变面积:正常青→报警红
      areaStyle: {type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#ff525266'}, {offset: 1, color: '#ff525200'}]},
      lineStyle: {color: '#ff6b35', width: 2},
      itemStyle: {color: '#ff6b35'},
      // 法定阈值:1.0 报警 / 1.5 断电 / 2.5 撤人
      markLine: {
        symbol: 'none',
        silent: true,
        lineStyle: {type: 'dashed', width: 1.2},
        label: {position: 'insideEndTop', fontSize: 10, fontWeight: 600},
        data: [
          {yAxis: 1.0, lineStyle: {color: '#ffb020'}, label: {color: '#ffb020', formatter: t('报警 1.0%', 'Alarm 1.0%')}},
          {yAxis: 1.5, lineStyle: {color: '#ff6b35'}, label: {color: '#ff6b35', formatter: t('断电 1.5%', 'Cut 1.5%')}},
          {yAxis: 2.5, lineStyle: {color: '#ff5252'}, label: {color: '#ff5252', formatter: t('撤人 2.5%', 'Evac 2.5%')}},
        ],
      },
      // 超标危险区:报警区(琥珀)、断电撤人区(红)
      markArea: {
        silent: true,
        data: [
          [{yAxis: 1.0, itemStyle: {color: 'rgba(255,176,32,0.12)'}}, {yAxis: 1.5}],
          [{yAxis: 1.5, itemStyle: {color: 'rgba(255,82,82,0.16)'}}, {yAxis: 2.6}],
        ],
      },
      data: t1.series.value.map(([, v]) => +v.toFixed(3)),
    },
    {
      name: L2.value,
      type: 'line',
      symbol: 'none',
      smooth: 0.3,
      itemStyle: {color: '#00e5ff'},
      data: t2.series.value.map(([, v]) => +v.toFixed(3)),
    },
    {
      name: L3.value,
      type: 'line',
      symbol: 'none',
      smooth: 0.3,
      itemStyle: {color: '#00e676'},
      data: t3.series.value.map(([, v]) => +v.toFixed(3)),
    },
  ],
}))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
