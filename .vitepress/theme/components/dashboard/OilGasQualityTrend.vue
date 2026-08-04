<script setup lang="ts">
/**
 * 气质合规度四组分趋势(BaseChart 多线)。
 * 四组分:H₂S(mg/m³,≤20)、水露点(°C,≤-5 冬/≤0 夏)、CO₂(mol%,≤3.0)、热值(MJ/m³,≥31)。
 * 单位/量级各异,统一换算为"合规度 %"(对全月日均值):
 *   下限类(H₂S/CO₂/露点):合规度 = 限值/实测 ×100  → >100% 达标,<100% 超标
 *   下限类(热值):      合规度 = 实测/下限 ×100  → >100% 达标
 * 100% markLine = 规格限。tooltip 还原真实值 + 限值。
 * 全局漂移使四线缓变(±小 cycleAmp),绝不飙到几百。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const HOURS = Array.from({length: 24}, (_, h) => h)

// 各组分基准合规度(H₂S/CO₂/露点偏高优→基准 ~120-150%;热值基准 ~108%)。
// 用乘性慢周期 + 微噪声,clamp 到合理业务区间(50-180%)。
interface Comp {
  key: string
  name: string
  limit: number
  unit: string
  dir: 'upper' | 'lower' // upper=上限类(lower-is-better),lower=下限类(higher-is-better)
  base: number // 基准合规度 %
  amp: number
  phase: number
  seed: number
  baseReal: number // 基准实测值(用于 tooltip 还原)
}
const COMPS: Comp[] = [
  {key: 'h2s', name: 'H₂S', limit: 20, unit: 'mg/m³', dir: 'upper', base: 135, amp: 0.18, phase: 0.0, seed: 4101, baseReal: 14.8},
  {key: 'h2o', name: t('水露点', 'H₂O DP'), limit: -5, unit: '°C', dir: 'upper', base: 128, amp: 0.16, phase: 1.2, seed: 4102, baseReal: -6.4},
  {key: 'co2', name: 'CO₂', limit: 3.0, unit: 'mol%', dir: 'upper', base: 142, amp: 0.12, phase: 2.4, seed: 4103, baseReal: 2.1},
  {key: 'cv', name: t('热值', 'CV'), limit: 31, unit: 'MJ/m³', dir: 'lower', base: 112, amp: 0.04, phase: 3.6, seed: 4104, baseReal: 34.7},
]

const series24 = COMPS.map((c) => {
  // 每组分一路合规度漂移(baseline = base,乘性周期,24h 时序由 demandShape 模拟日变化)
  const drift = useDomainSeries(
    {baseline: c.base, unit: '%', cycle: (s) => Math.sin(s / 100 + c.phase), cycleAmp: 0.06, noiseAmp: 2.5},
    {seed: c.seed, window: 2},
  ).current
  return {ref: c, drift}
})

// 24h 形态:夜间(0-5)负荷低、组分略稳;峰时波动大。叠加到漂移乘子上。
function dayShape(hour: number): number {
  const morn = Math.exp(-((hour - 8) ** 2) / 4)
  const eve = Math.exp(-((hour - 19) ** 2) / 5)
  return 1 - 0.08 * (morn + eve)
}

const accessibleTitle = computed(() => t('气质四组分 24h 合规度趋势', 'Gas quality 4-component 24h compliance trend'))
const OK_TXT = computed(() => t('达标', 'OK'))
const NG_TXT = computed(() => t('超标', 'NG'))

const option = computed(() => {
  return {
    legend: {
      data: series24.map((s) => s.ref.name),
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
        const head = '<div style="font-weight:600;margin-bottom:2px">' + String(params[0]?.axisValue).padStart(2, '0') + ':00</div>'
        const rows = params
          .filter((p) => p.value != null)
          .map((p) => {
            const c = COMPS[p.seriesIndex]
            const comp = p.value
            const real =
              c.dir === 'upper'
                ? +(c.limit / (comp / 100)).toFixed(2)
                : +(c.baseReal * (comp / c.base)).toFixed(2)
            const ok = comp >= 100
            const tagColor = ok ? '#00e676' : '#ff5252'
            const tagTxt = ok ? OK_TXT.value : NG_TXT.value
            return '<div>' + p.marker + ' ' + c.name + ' <b>' + real + ' ' + c.unit + '</b> <span style="color:' + tagColor + '">(' + tagTxt + ')</span></div>'
          })
        return head + rows.join('')
      },
    },
    grid: {left: 10, right: 16, top: 30, bottom: 8, containLabel: true},
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: HOURS.map((h) => String(h)),
      axisTick: {show: false},
      axisLabel: {hideOverlap: true, formatter: (v: string) => (+v) % 6 === 0 ? v + ':00' : ''},
    },
    yAxis: {
      type: 'value',
      name: t('合规度 %', 'Compliance %'),
      nameTextStyle: {color: '#6b8cae', fontSize: 10},
      min: 50,
      max: 180,
    },
    series: series24.map((s, i) => {
      const c = s.ref
      const data = HOURS.map((h) => {
        const v = Math.max(50, Math.min(180, s.drift.value * dayShape(h)))
        return +v.toFixed(1)
      })
      const color = ['#00e676', '#00e5ff', '#ffb020', '#b980ff'][i]
      return {
        name: c.name,
        type: 'line',
        symbol: 'none',
        smooth: 0.3,
        lineStyle: {width: 2, color},
        itemStyle: {color},
        markLine:
          i === 0
            ? {
                symbol: 'none',
                silent: true,
                lineStyle: {type: 'dashed', color: '#ff5252', width: 1.2},
                label: {show: true, position: 'insideEndTop', color: '#ff5252', fontSize: 10, formatter: t('规格限 100%', 'Spec 100%')},
                data: [{yAxis: 100}],
              }
            : undefined,
        data,
      }
    }),
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
