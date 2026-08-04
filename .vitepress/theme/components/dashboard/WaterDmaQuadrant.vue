<script setup lang="ts">
/**
 * 招牌②:DMA 分区漏损四象限分析(scatter)。
 * x = 夜间最小流量 MNF(m³/h),y = 单位管长漏损(L/km·h),
 * 气泡大小 = 分区面积(km²),颜色 = ILI 基础设施漏损指数风险带。
 * markArea 四象限(健康/关注/漏损/严重)+ markLine ILI 警戒阈值。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Dma {
  code: string
  mnf: number // 夜间最小流量 m³/h
  ull: number // 单位管长漏损 L/km·h
  area: number // 分区面积 km²
  ili: number // 基础设施漏损指数
  seed: number
}
// 8 个 DMA,覆盖四象限:ILI<2 良好 / 2-4 关注 / 4-6 漏损 / >6 严重。
const DMAS: Dma[] = [
  {code: 'DMA-01', mnf: 28, ull: 12, area: 3.2, ili: 1.6, seed: 301},
  {code: 'DMA-02', mnf: 45, ull: 22, area: 5.1, ili: 2.8, seed: 302},
  {code: 'DMA-03', mnf: 72, ull: 38, area: 6.8, ili: 4.6, seed: 303},
  {code: 'DMA-04', mnf: 95, ull: 52, area: 7.4, ili: 6.2, seed: 304},
  {code: 'DMA-05', mnf: 38, ull: 18, area: 2.4, ili: 2.2, seed: 305},
  {code: 'DMA-06', mnf: 60, ull: 30, area: 4.5, ili: 3.4, seed: 306},
  {code: 'DMA-07', mnf: 22, ull: 9, area: 1.8, ili: 1.3, seed: 307},
  {code: 'DMA-08', mnf: 110, ull: 58, area: 8.2, ili: 7.5, seed: 308},
]

// 各 DMA 漂移:MNF 与 ULL 各一路乘性慢周期(±5%),ILI 随之微动。
const series = DMAS.map((d) => ({
  ref: d,
  mnf: useDomainSeries({baseline: d.mnf, unit: 'm³/h', cycle: (s) => Math.sin(s / 130 + d.seed), cycleAmp: 0.05, noiseAmp: 0.6}, {seed: d.seed, window: 2}).current,
  ull: useDomainSeries({baseline: d.ull, unit: 'L/km·h', cycle: (s) => Math.sin(s / 120 + d.seed * 0.7), cycleAmp: 0.06, noiseAmp: 0.5}, {seed: d.seed + 50, window: 2}).current,
}))

// 象限阈值:MNF 55 m³/h、单位管长漏损 30 L/km·h(对应 ILI≈3 警戒)。
const X_TH = 55
const Y_TH = 30

function iliColor(ili: number): string {
  if (ili < 2) return '#16a34a'
  if (ili < 4) return '#0891b2'
  if (ili < 6) return '#d97706'
  return '#dc2626'
}
function iliBand(ili: number): string {
  if (ili < 2) return t('良好 (A)', 'Good (A)')
  if (ili < 4) return t('关注 (B)', 'Watch (B)')
  if (ili < 6) return t('漏损 (C)', 'Leak (C)')
  return t('严重 (D)', 'Severe (D)')
}

const option = computed(() => {
  const data = series.map((it) => {
    const mnf = Math.max(0, it.mnf.value)
    const ull = Math.max(0, it.ull.value)
    const ili = it.ref.ili
    return {
      value: [mnf, ull, it.ref.area],
      symbolSize: Math.sqrt(it.ref.area) * 9 + 12,
      itemStyle: {color: iliColor(ili), shadowBlur: 10, shadowColor: iliColor(ili), opacity: 0.85},
      code: it.ref.code,
      area: it.ref.area,
      ili,
      band: iliBand(ili),
      mnf,
      ull,
    }
  })
  return {
    grid: {left: 10, right: 18, top: 24, bottom: 40, containLabel: true},
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const d = p.data
        return [
          `<b>${d.code}</b>`,
          `${t('夜间最小流量', 'MNF')}: <b>${d.mnf.toFixed(1)} m³/h</b>`,
          `${t('单位管长漏损', 'ULL')}: <b>${d.ull.toFixed(1)} L/km·h</b>`,
          `${t('分区面积', 'Area')}: ${d.area} km²`,
          `${t('漏损指数 ILI', 'ILI')}: <b>${d.ili.toFixed(1)}</b> · ${d.band}`,
        ].join('<br/>')
      },
    },
    xAxis: {
      type: 'value',
      name: t('MNF (m³/h)', 'MNF (m³/h)'),
      nameLocation: 'middle',
      nameGap: 26,
      min: 0,
      max: 130,
    },
    yAxis: {
      type: 'value',
      name: t('ULL (L/km·h)', 'ULL (L/km·h)'),
      min: 0,
      max: 70,
    },
    series: [
      {
        type: 'scatter',
        data,
        // 四象限背景:左下健康(绿)、右下/左上关注(灰)、右上严重(红)
        markArea: {
          silent: true,
          itemStyle: {borderWidth: 0},
          label: {color: '#8a98a8', fontSize: 10, fontWeight: 600, position: 'insideTopLeft', distance: 6},
          data: [
            [{name: t('健康', 'Healthy'), itemStyle: {color: 'rgba(22,163,74,0.10)'}, coord: [0, 0]}, {coord: [X_TH, Y_TH]}],
            [{name: t('严重漏损', 'Severe'), itemStyle: {color: 'rgba(220,38,38,0.12)'}, coord: [X_TH, Y_TH]}, {coord: [130, 70]}],
            [{name: t('高压漏损', 'High-MNF leak'), itemStyle: {color: 'rgba(217,119,6,0.08)'}, coord: [X_TH, 0]}, {coord: [130, Y_TH]}],
            [{name: t('管网老化', 'Aging'), itemStyle: {color: 'rgba(217,119,6,0.08)'}, coord: [0, Y_TH]}, {coord: [X_TH, 70]}],
          ],
        },
        markLine: {
          symbol: 'none',
          silent: true,
          label: {color: '#ff8a8a', fontSize: 10, formatter: t('ILI 警戒', 'ILI alert')},
          lineStyle: {color: 'rgba(255,138,138,0.6)', type: 'dashed', width: 1.2},
          data: [{xAxis: X_TH}, {yAxis: Y_TH}],
        },
      },
    ],
  }
})

const accessibleTitle = computed(() => t('DMA 分区漏损四象限分析', 'DMA leakage quadrant analysis'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
