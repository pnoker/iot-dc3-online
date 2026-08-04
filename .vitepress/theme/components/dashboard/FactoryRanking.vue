<script setup lang="ts">
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

/** 工厂 OEE 基准线(世界级 ≥85,典型 60–85,低效 <60)。 */
const BASELINE = 75
/** xAxis 对称半幅(值=OEE−BASELINE),两侧留肩供 OEE% 标签外置。 */
const DEVIATION_MAX = 30

interface Ws {
  code: string
  baseline: number
  phase: number
  seed: number
}

// 12 工位:基准呈钟形分布(多数居中段),覆盖三档语义色。
const WORKSTATIONS: Ws[] = Array.from({length: 12}, (_, i) => ({
  code: `WS-${String(i + 1).padStart(2, '0')}`,
  baseline: [91, 87, 84, 81, 78, 76, 73, 70, 66, 62, 57, 54][i],
  phase: i * 0.6, // 各工位周期错相,避免同步漂移显得假
  seed: 1000 + i * 13,
}))

// 每工位一路乘性慢周期 + 微噪声的 OEE 漂移,只取 current。
const stations = WORKSTATIONS.map((ws) => ({
  code: ws.code,
  oee: useDomainSeries(
    {
      baseline: ws.baseline,
      unit: '%',
      cycle: (time: number) => Math.sin(time / 130 + ws.phase),
      cycleAmp: 0.03,
      noiseAmp: 0.9,
    },
    {seed: ws.seed, window: 2},
  ).current,
}))

const clampOee = (v: number) => Math.max(0, Math.min(100, v))

/** OEE 等级语义色:≥85 正常 / 60–85 警告 / <60 严重(固定 hex,BaseChart 不覆盖)。 */
function oeeColor(oee: number): string {
  if (oee >= 85) return '#16a34a'
  if (oee >= 60) return '#d97706'
  return '#dc2626'
}

/** OEE 等级文案(tooltip 用)。 */
function oeeBand(oee: number): string {
  if (oee >= 85) return t('世界级', 'World-class')
  if (oee >= 60) return t('需改善', 'Needs improvement')
  return t('低效', 'Low efficiency')
}

// 按 OEE 降序排行(每 tick 重排,bar 动画过渡)。
const ranked = computed(() =>
  stations
    .map((s) => {
      const oee = clampOee(s.oee.value)
      return {code: s.code, oee, dev: oee - BASELINE}
    })
    .sort((a, b) => b.oee - a.oee),
)

const option = computed(() => {
  const r = ranked.value
  return {
    animationDuration: 600,
    animationDurationUpdate: 350,
    animationEasingUpdate: 'cubicOut',
    grid: {left: 8, right: 8, top: 26, bottom: 8, containLabel: true},
    tooltip: {
      trigger: 'axis',
      axisPointer: {type: 'shadow'},
      formatter: (params: any) => {
        const d = params?.[0]?.data
        if (!d) return ''
        const sign = d.dev >= 0 ? '+' : ''
        return [
          `<b>${d.code}</b>`,
          `${t('OEE', 'OEE')}: <b>${d.oee.toFixed(1)}%</b>`,
          `${t('偏差', 'Deviation')}: ${sign}${d.dev.toFixed(1)} pp`,
          `${t('等级', 'Band')}: ${d.band}`,
        ].join('<br/>')
      },
    },
    xAxis: {
      type: 'value',
      min: -DEVIATION_MAX,
      max: DEVIATION_MAX,
      axisLabel: {show: false},
      axisLine: {show: false},
      axisTick: {show: false},
      splitLine: {show: false},
    },
    yAxis: {
      type: 'category',
      data: r.map((d) => d.code),
      inverse: true,
      axisTick: {show: false},
      axisLine: {show: false},
      splitLine: {show: false},
    },
    series: [
      {
        type: 'pictorialBar',
        symbol: 'rect',
        symbolRepeat: false,
        symbolSize: ['100%', '58%'],
        data: r.map((d) => {
          const c = oeeColor(d.oee)
          return {
            value: d.dev,
            itemStyle: {color: c},
            code: d.code,
            oee: d.oee,
            dev: d.dev,
            band: oeeBand(d.oee),
            // OEE% 外置于条尖,沿用语义色(在明暗卡背景下均可读)。
            label: {
              show: true,
              position: d.dev >= 0 ? 'right' : 'left',
              color: c,
              fontSize: 11,
              fontWeight: 600,
              distance: 5,
              formatter: () => `${d.oee.toFixed(1)}%`,
            },
          }
        }),
        // 工厂基准 75%(x=0)竖虚线,锚定双向发散中心。
        markLine: {
          symbol: 'none',
          silent: true,
          animation: false,
          label: {
            show: true,
            position: 'end',
            color: '#8a98a8',
            fontSize: 10,
            formatter: () => t('基准 75%', 'Baseline 75%'),
          },
          lineStyle: {color: '#8a98a8', type: 'dashed', width: 1},
          data: [{xAxis: 0}],
        },
      },
    ],
  }
})

const accessibleTitle = computed(() => t('工位 OEE 排行榜', 'Workstation OEE ranking'))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(320px, 42vh, 460px)" />
</template>
