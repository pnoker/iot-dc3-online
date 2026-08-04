<script setup lang="ts">
/**
 * 招牌辅图:24h 充电功率时序 + 分时电价阶梯(双轴)。
 * 堆叠面积:直流快充 + 交流慢充(左轴 kW);阶梯折线:分时电价(右轴 元/kWh,尖峰最高)。
 * 有序充电:尖峰(19-21)OBMS 对直流快充降功率 ~18%(削峰填谷,响应电价)。
 * markArea 标尖峰时段。充电负荷双峰(晚高峰主导)+ 凌晨慢充小峰。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const drift = useDomainSeries(
  {baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 140), cycleAmp: 0.06, noiseAmp: 0.01},
  {seed: 91, window: 2},
).current
const acDrift = useDomainSeries(
  {baseline: 1, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 120 + 1), cycleAmp: 0.05, noiseAmp: 0.01},
  {seed: 92, window: 2},
).current

// 直流快充:晚高峰主导
function dcShape(h: number): number {
  const base = 760
  const evening = 1500 * Math.exp(-((h - 20) ** 2) / 8)
  const morning = 420 * Math.exp(-((h - 8) ** 2) / 4)
  const day = 220 * Math.exp(-((h - 13) ** 2) / 14)
  let v = base + evening + morning + day
  // 有序充电:尖峰 OBMS 降功率
  if (h >= 19 && h < 21) v *= 0.82
  return v
}
// 交流慢充:凌晨网约车/居民主导
function acShape(h: number): number {
  const base = 280
  const night = 520 * Math.exp(-((h - 3) ** 2) / 6)
  const day = 200 * Math.exp(-((h - 11) ** 2) / 12)
  const eve = 160 * Math.exp(-((h - 19) ** 2) / 6)
  return base + night + day + eve
}
// 分时电价(元/kWh,典型充电站):谷/平/峰/尖阶梯
function priceAt(h: number): number {
  if (h < 7) return 0.35
  if (h < 10) return 0.78
  if (h < 15) return 1.05
  if (h < 19) return 1.15
  if (h < 21) return 1.32 // 尖峰
  if (h < 23) return 1.05
  return 0.55
}

const N = 48
const hours = Array.from({length: N}, (_, i) => i / 2)
const xLabels = hours.map((h) => {
  const hh = Math.floor(h)
  return hh % 4 === 0 ? String(hh).padStart(2, '0') + ':00' : ''
})

const option = computed(() => {
  const d = drift.value
  const ad = acDrift.value
  const dc = hours.map((h, i) => (i === N - 1 ? {value: +(dcShape(h) * d).toFixed(1), symbol: 'circle', symbolSize: 6} : +(dcShape(h) * d).toFixed(1)))
  const ac = hours.map((h, i) => (i === N - 1 ? {value: +(acShape(h) * ad).toFixed(1), symbol: 'circle', symbolSize: 6} : +(acShape(h) * ad).toFixed(1)))
  const price = hours.map((h) => priceAt(h))
  return {
    legend: {
      data: [t('直流快充', 'DC Fast'), t('交流慢充', 'AC Slow'), t('分时电价', 'TOU Tariff')],
      top: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 8, fontSize: 11,
    },
    tooltip: {trigger: 'axis', axisPointer: {type: 'line'}},
    grid: {left: 8, right: 52, top: 30, bottom: 8, containLabel: true},
    xAxis: {type: 'category', boundaryGap: false, data: xLabels, axisTick: {show: false}, axisLabel: {hideOverlap: true}},
    yAxis: [
      {type: 'value', name: 'kW', nameTextStyle: {color: '#6b8cae', fontSize: 10}},
      {type: 'value', name: t('元/kWh', '¥/kWh'), nameTextStyle: {color: '#6b8cae', fontSize: 10}, min: 0, max: 1.5, splitLine: {show: false}, axisLabel: {formatter: (v: number) => v.toFixed(2)}},
    ],
    series: [
      {name: t('直流快充', 'DC Fast'), type: 'line', stack: 'charge', symbol: 'none', smooth: 0.3, areaStyle: {}, data: dc},
      {name: t('交流慢充', 'AC Slow'), type: 'line', stack: 'charge', symbol: 'none', smooth: 0.3, areaStyle: {}, data: ac},
      {
        name: t('分时电价', 'TOU Tariff'),
        type: 'line',
        yAxisIndex: 1,
        step: 'start',
        symbol: 'none',
        smooth: false,
        itemStyle: {color: '#ffb020'},
        lineStyle: {width: 2.4, type: 'dashed', shadowBlur: 8},
        areaStyle: {opacity: 0},
        data: price,
        markArea: {
          silent: true,
          data: [
            [{itemStyle: {color: 'rgba(255,82,82,0.14)', borderWidth: 0}, xAxis: '19:00'}, {xAxis: '21:00', name: t('尖峰', 'Sharp')}],
            [{itemStyle: {color: 'rgba(43,155,255,0.10)', borderWidth: 0}, xAxis: '00:00'}, {xAxis: '07:00', name: t('谷', 'Valley')}],
          ],
        },
      },
    ],
  }
})

const accessibleTitle = computed(() => t('24 小时充电功率与分时电价阶梯', '24h charging power & TOU tariff ladder'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
