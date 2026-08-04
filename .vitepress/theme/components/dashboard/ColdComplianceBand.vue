<script setup lang="ts">
/**
 * 温度合规带(BaseChart line + markArea 温层band + 越限红)。
 * 单台冷藏车最近时段温度曲线,左轴 ℃(tooltip 兼显 ℉),
 * markArea 标合规温层带 2~8℃(冷藏),markLine 标上下限,
 * markArea 越限区段红色高亮(events step 制造越限段)。
 * useDomainSeries 注入一次 step 越限事件 + 全局漂移。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const LO = 2 // 冷藏下限 ℃
const HI = 8 // 冷藏上限 ℃

// 温度基线 5℃(合规带中段),乘性缓漂 + 一次持续越上限事件(step +size,模拟门封漏温)
const {series, current} = useDomainSeries(
  {
    baseline: 5,
    unit: '℃',
    cycleMode: 'multiplicative',
    cycle: (s) => Math.sin(s / 30),
    cycleAmp: 0.18,
    noiseAmp: 0.22,
    events: [{at: 45, type: 'step', size: 3.4, duration: 22}],
  },
  {intervalMs: 1000, window: 90, seed: 88},
)

const label = computed(() => t('车厢温度', 'Reefer Temp'))
const accessibleTitle = computed(() => t('单车温度合规带与越限区段', 'Single reefer temperature compliance band with excursion'))

const option = computed(() => {
  const data = series.value.map(([x, y]) => [x, +y.toFixed(2)])
  const xs = data.map((d) => d[0])
  const xMin = xs.length ? xs[0] : 0
  const xMax = xs.length ? xs[xs.length - 1] : 90
  // 找越限区段(连续 >HI 或 <LO)的起止 x
  const exc: [[number, number]] = [] as any
  let st = -1
  for (const [x, y] of data) {
    const over = y > HI || y < LO
    if (over && st < 0) st = x
    if (!over && st >= 0) {
      exc.push([st, x] as any)
      st = -1
    }
  }
  if (st >= 0) exc.push([st, xMax] as any)
  const markAreas = exc.map(([a, b]) => [{xAxis: a}, {xAxis: b}])

  return {
    legend: {data: [label.value], top: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 8, fontSize: 11},
    tooltip: {
      trigger: 'axis',
      formatter: (p: any[]) => {
        const c = p[0]?.value[1]
        if (c == null) return ''
        const f = (c * 9) / 5 + 32
        return `<div>${p[0].marker} ${label.value} <b>${c.toFixed(1)}℃ / ${f.toFixed(1)}℉</b></div>`
      },
    },
    grid: {left: 10, right: 16, top: 30, bottom: 8, containLabel: true},
    xAxis: {
      type: 'value',
      min: xMin,
      max: xMax,
      axisLabel: {formatter: (v: number) => Math.round(v - xMin) + 's', fontSize: 10},
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 12,
      name: '℃',
      nameTextStyle: {color: '#6b8cae', fontSize: 10},
    },
    series: [
      {
        name: label.value,
        type: 'line',
        symbol: 'none',
        smooth: 0.3,
        lineStyle: {width: 2},
        data,
        // 合规温层带 2~8℃ 绿底
        markArea: {
          silent: true,
          itemStyle: {color: 'rgba(0,230,118,0.10)', borderWidth: 0},
          label: {show: true, color: '#7fffb0', fontSize: 10, position: 'insideTopLeft', distance: 6, formatter: t('合规带 2~8℃', 'OK 2~8℃')},
          data: [[{yAxis: LO}, {yAxis: HI}]],
        },
        // 上下限 markLine
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: {type: 'dashed', width: 1.2},
          label: {fontSize: 10},
          data: [
            {yAxis: HI, lineStyle: {color: '#ff5252'}, label: {color: '#ff5252', formatter: t('上限', 'Hi') + ' ' + HI + '℃'}},
            {yAxis: LO, lineStyle: {color: '#ffa726'}, label: {color: '#ffa726', formatter: t('下限', 'Lo') + ' ' + LO + '℃'}},
          ],
        },
      },
      {
        // 越限区段红色高亮(独立 series 仅承载 markArea)
        type: 'line',
        data: [],
        markArea: {
          silent: true,
          itemStyle: {color: 'rgba(255,82,82,0.22)', borderWidth: 0},
          data: markAreas,
        },
      },
    ],
  }
})

// 引用 current 防止 tree-shake(实际由 series 驱动渲染)
void current
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
