<script setup lang="ts">
/**
 * 作物胁迫指数概览(BaseChart gauge):0-100 健康度,绿/黄/红三段弧。
 * 胁迫由冠层温度偏离 + VPD + VWC 偏离合成 → 复合成健康度(越高越健康)。
 * 双标:中心大字健康度 + 下方 VPD kPa(水汽压差,理想 0.8-1.2)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 三路合成信号:温度偏离度 / VPD / VWC 偏离度,均小 cycleAmp 缓变。
// 温度偏离:0(适)→ 偏离越大胁迫越高(baseline 0.18,0-1)
const tempDev = useDomainSeries(
  {baseline: 0.2, unit: '', cycle: (s) => Math.sin(s / 120), cycleAmp: 0.25, noiseAmp: 0.04},
  {seed: 11, window: 2},
).current
// VPD 偏离:理想 1.0 kPa,偏离越多越胁迫(baseline 0.22)
const vpdDev = useDomainSeries(
  {baseline: 0.22, unit: '', cycle: (s) => Math.sin(s / 140 + 1.5), cycleAmp: 0.22, noiseAmp: 0.03},
  {seed: 22, window: 2},
).current
// VWC 偏离:适墒偏离(baseline 0.18)
const vwcDev = useDomainSeries(
  {baseline: 0.18, unit: '', cycle: (s) => Math.sin(s / 110 + 3.1), cycleAmp: 0.28, noiseAmp: 0.04},
  {seed: 33, window: 2},
).current

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// 健康度 = 100 - 加权胁迫(温度 40% + VPD 30% + VWC 30%)*100,钳到 55-98(作物不致枯死)
const health = computed(() => {
  const stress = clamp(0.4 * tempDev.value + 0.3 * vpdDev.value + 0.3 * vwcDev.value, 0, 0.9)
  return Math.round(clamp(100 - stress * 100, 55, 98))
})
// 实时 VPD(kPa),0.6-1.4 业务区间
const vpd = computed(() => Number((1.0 + (vpdDev.value - 0.22) * 2).toFixed(2)))

const accessibleTitle = computed(() =>
  t(`作物健康度 ${health.value}%`, `Crop health ${health.value}%`),
)

const option = computed(() => ({
  series: [
    {
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      radius: '92%',
      center: ['50%', '58%'],
      progress: {
        show: true,
        width: 14,
        roundCap: true,
        itemStyle: {
          // 渐变随健康度:绿→琥珀→红(语义色固定 hex,内联渐变)
          color: {type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [
            {offset: 0, color: '#ff5252'},
            {offset: 0.5, color: '#ffb020'},
            {offset: 1, color: '#00e676'},
          ]},
        },
      },
      axisLine: {
        lineStyle: {width: 14, color: [[0.55, '#1a2b45'], [1, '#1a2b45']]},
      },
      pointer: {show: false},
      axisTick: {show: false},
      splitLine: {show: false},
      axisLabel: {show: false},
      anchor: {show: false},
      title: {show: false},
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        fontSize: 30,
        fontWeight: 700,
        offsetCenter: [0, '-2%'],
        color: '#d4ecff',
      },
      data: [{value: health.value}],
    },
  ],
  graphic: [
    {
      type: 'text',
      left: 'center',
      top: '72%',
      style: {
        text: t('作物健康度', 'Crop Health'),
        fontSize: 12,
        fill: '#6b8cae',
        textAlign: 'center',
      },
    },
    {
      type: 'text',
      left: 'center',
      top: '82%',
      style: {
        text: `VPD ${vpd.value} kPa`,
        fontSize: 11,
        fill: vpd.value >= 0.8 && vpd.value <= 1.2 ? '#00e676' : '#ffb020',
        textAlign: 'center',
        fontFamily: 'var(--dc3d-mono)',
      },
    },
  ],
}))
</script>

<template>
  <div class="gauge">
    <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(180px, 22vh, 240px)" />
  </div>
</template>

<style scoped>
.gauge {
  width: 100%;
  height: 100%;
}
</style>
