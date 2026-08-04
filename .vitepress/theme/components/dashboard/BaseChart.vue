<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, watch, shallowRef} from 'vue'
import {echarts, type ECharts} from './echarts-core'

const props = withDefaults(
  defineProps<{
    option: any
    accessibleTitle: string
    height?: string
  }>(),
  {height: 'clamp(220px, 26vh, 320px)'},
)

const el = ref<HTMLDivElement>()
const chart = shallowRef<ECharts>()
const reducedMotion = ref(false)

function apply(replace = false) {
  if (!chart.value) return
  try {
    chart.value.setOption(mergeTheme(props.option), {notMerge: replace})
  } catch (e) {
    console.error('[BaseChart] setOption failed', e)
    if (el.value) el.value.innerHTML = '<div class="dc3d-chart-error">⚠</div>'
  }
}

let ro: ResizeObserver | undefined
onMounted(() => {
  reducedMotion.value = matchMedia('(prefers-reduced-motion: reduce)').matches
  // 看板舞台强制深色 DataV:init 统一 SVG,reduced-motion 关动画
  chart.value = echarts.init(el.value!, undefined, {renderer: 'svg', animation: !reducedMotion.value})
  apply(true)
  ro = new ResizeObserver(() => chart.value?.resize())
  ro.observe(el.value!)
})
watch(() => props.option, () => apply(false))
onBeforeUnmount(() => {
  ro?.disconnect()
  chart.value?.dispose()
})

defineExpose({
  pushPoint(seriesIdx: number, x: number, y: number, win = 60) {
    const c = chart.value
    if (!c) return
    const opt = c.getOption() as any
    const data = (opt.series[seriesIdx]?.data ?? []) as any[]
    data.push([x, y])
    if (data.length > win) data.shift()
    c.setOption({series: [{data}]})
  },
  resize() {
    chart.value?.resize()
  },
})
</script>

<template>
  <div ref="el" role="img" :aria-label="accessibleTitle" :style="{height}"></div>
</template>

<script lang="ts">
// DataV 科技大屏配色:霓虹色板 + 深色轴/tooltip + 自动给 line/bar/pictorialBar 注入渐变填充与发光。
// 看板舞台始终深色,不随 VitePress 亮色切(大屏 = 沉浸深色)。
const NEON = ['#00e5ff', '#2b9bff', '#7c4dff', '#00e676', '#ffa726', '#ff5252']

function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}
function grad(color: string, topAlpha = '66', botAlpha = '00') {
  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      {offset: 0, color: color + topAlpha},
      {offset: 1, color: color + botAlpha},
    ],
  }
}
// line → 渐变面积 + 发光线;bar/pictorialBar → 纵向渐变。已设 itemStyle/areaStyle 的不覆盖。
function injectSeries(series: any[]) {
  return (series ?? []).map((s: any, i: number) => {
    const hasItemColor = s.itemStyle && typeof s.itemStyle.color === 'string'
    const c = hasItemColor ? s.itemStyle.color : NEON[i % NEON.length]
    if (s.type === 'line') {
      return {
        ...s,
        smooth: s.smooth ?? true,
        symbol: s.symbol ?? 'circle',
        symbolSize: s.symbolSize ?? 5,
        lineStyle: {width: 2, shadowBlur: 10, shadowColor: c, ...(s.lineStyle ?? {})},
        itemStyle: {color: c, ...(s.itemStyle ?? {})},
        areaStyle: s.areaStyle ?? grad(c),
      }
    }
    if (s.type === 'bar' || s.type === 'pictorialBar') {
      return {...s, itemStyle: s.itemStyle ?? {color: grad(c, 'cc', '55')}}
    }
    return s
  })
}
function mergeTheme(option: any): any {
  const label = cssVar('--dc3d-text-dim', '#6b8cae')
  const divider = cssVar('--dc3d-panel-border', 'rgba(0,229,255,0.3)')
  const bg = cssVar('--dc3d-panel-bg-2', 'rgba(8,22,45,0.72)')
  const text = cssVar('--dc3d-text', '#d4ecff')
  const axisBase = {
    axisLabel: {color: label, fontSize: 11},
    axisLine: {lineStyle: {color: divider}},
    splitLine: {lineStyle: {color: divider, type: 'dashed' as const}},
  }
  const normAxis = (a: any) =>
    !a ? undefined : Array.isArray(a) ? a.map((x) => ({...axisBase, ...x})) : {...axisBase, ...a}
  return {
    ...option,
    color: option.color ?? NEON,
    textStyle: {color: text, fontSize: 12, ...(option.textStyle ?? {})},
    xAxis: normAxis(option.xAxis),
    yAxis: normAxis(option.yAxis),
    legend: {textStyle: {color: label}, ...(option.legend ?? {})},
    tooltip: {
      backgroundColor: bg,
      borderColor: divider,
      borderWidth: 1,
      textStyle: {color: text},
      extraCssText: 'backdrop-filter: blur(4px);',
      ...(option.tooltip ?? {}),
    },
    series: injectSeries(option.series),
  }
}
</script>

<style>
.dc3d-chart-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--dc3d-neon-red);
  font-size: 20px;
}
</style>
