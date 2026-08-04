<script setup lang="ts">
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'
import {useTheme} from '../../composables/useTheme'

const {en, t} = useI18n()
const {isDark} = useTheme()

// 5 态枚举:code 同时作为 visualMap 的 piece value 与 data 第三维。
// 语义色为固定 hex(BaseChart 不覆盖 itemStyle.color)。
const STATES = [
  {code: 0, color: '#16a34a', zh: '运行', en: 'Running'},
  {code: 1, color: '#6b7a89', zh: '待机', en: 'Idle'},
  {code: 2, color: '#d97706', zh: '换型', en: 'Changeover'},
  {code: 3, color: '#0891b2', zh: '缺料', en: 'Starve'},
  {code: 4, color: '#dc2626', zh: '停机', en: 'Down'},
] as const

const LINES = 8 // 8 条产线(行)
const WINDOWS = 24 // 最近 24 个 5min 班次窗(列)= 2h

const LINES_ZH = ['总装A1', '总装A2', '焊装B1', '焊装B2', '涂装C1', '涂装C2', '装配D1', '测试E1']
const LINES_EN = ['FA-1', 'FA-2', 'WB-1', 'WB-2', 'PT-1', 'PT-2', 'AS-1', 'TS-1']
const lineNames = computed(() => (en.value ? LINES_EN : LINES_ZH))

// 纯函数哈希(确定性,SSR 可复现):驱动稳定基态矩阵 + 少量"易变格"。
function hash3(a: number, b: number, c: number): number {
  let h = (a * 374761393 + b * 668265263 + c * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return ((h >>> 0) % 100000) / 100000
}
// 稳定基态:running 占多数,down/starve 稀有(贴近真实产线可用性分布)。
function baseCode(line: number, col: number): number {
  const r = hash3(line, col, 101)
  if (r < 0.6) return 0 // running
  if (r < 0.76) return 1 // idle
  if (r < 0.86) return 2 // changeover
  if (r < 0.94) return 3 // starve
  return 4 // down
}
// ~15% 的格为"易变格":其状态由实时 live 信号 + 每格相位驱动,
// live 漂移时这些格在阈值处翻转 → 视觉上"每 tick 翻转少量格子"。
function isVolatile(line: number, col: number): boolean {
  return hash3(line, col, 303) < 0.15
}
function liveCode(line: number, col: number, live: number): number {
  const phase = hash3(line, col, 202) * 6.2832
  const x = (Math.sin(live * 6.2832 + phase) + 1) / 2
  if (x < 0.46) return 0
  if (x < 0.7) return 1
  if (x < 0.84) return 2
  if (x < 0.94) return 3
  return 4
}
function cellCode(line: number, col: number, live: number): number {
  return isVolatile(line, col) ? liveCode(line, col, live) : baseCode(line, col)
}
// 持续时长(min):确定性,越近的窗越短,易变格叠加 live 抖动。
function duration(line: number, col: number, code: number, live: number): number {
  const recency = col / (WINDOWS - 1)
  const base = 2 + hash3(line, col, code * 7 + 404) * 26
  const adj = isVolatile(line, col) ? Math.round((0.5 + live) * 6) : 0
  return Math.max(1, Math.round(base * (1.15 - recency * 0.5)) + adj)
}

// 实时信号:useDomainSeries 产 0..1 current(乘性慢漂移 + 高斯噪声)。
// current 仅驱动"易变格"翻转,基态矩阵保持稳定 → 实时感而不闪屏。
const {current} = useDomainSeries(
  {baseline: 0.5, unit: '', cycleMode: 'multiplicative', cycle: (tt) => Math.sin(tt / 18), cycleAmp: 0.35, noiseAmp: 0.18},
  {intervalMs: 3000, seed: 7},
)

function fmtWin(minAgo: number): string {
  if (minAgo === 0) return t('现在', 'now')
  if (minAgo < 60) return `-${minAgo}m`
  const h = Math.floor(minAgo / 60)
  const m = minAgo % 60
  return m ? `-${h}h${String(m).padStart(2, '0')}` : `-${h}h`
}

const accessibleTitle = computed(() => t('设备状态矩阵热力图', 'Machine status matrix heatmap'))

const option = computed(() => {
  const live = Math.max(0, Math.min(1, current.value))
  const data: any[] = []
  for (let row = 0; row < LINES; row++) {
    for (let col = 0; col < WINDOWS; col++) {
      const code = cellCode(row, col, live)
      data.push({
        value: [col, row, code],
        itemStyle: {color: STATES[code].color},
        lineName: lineNames.value[row],
        winName: fmtWin((WINDOWS - 1 - col) * 5),
        code,
        dur: duration(row, col, code, live),
      })
    }
  }
  // x 轴窗标签:仅每 4 列 + 末列(now)显示,其余留空(避免与 BaseChart 主题色冲突)。
  const xLabels = Array.from({length: WINDOWS}, (_, col) => {
    const show = col % 4 === 3 || col === WINDOWS - 1
    return show ? fmtWin((WINDOWS - 1 - col) * 5) : ''
  })

  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const d = p.data
        const s = STATES[d.code as number]
        return [
          `<b>${d.lineName}</b>`,
          `${t('时段', 'Window')}: ${d.winName}`,
          `${t('状态', 'Status')}: <span style="color:${s.color}">●</span> <b>${t(s.zh, s.en)}</b>`,
          `${t('持续', 'Duration')}: ${d.dur} ${t('分', 'min')}`,
        ].join('<br/>')
      },
    },
    grid: {left: 54, right: 14, top: 12, bottom: 66, containLabel: false},
    xAxis: {
      type: 'category',
      data: xLabels,
      position: 'bottom',
      axisTick: {show: false},
      splitArea: {show: false},
    },
    yAxis: {
      type: 'category',
      data: lineNames.value,
      inverse: true, // L01(首条产线)置顶
      axisTick: {show: false},
      splitArea: {show: false},
    },
    visualMap: {
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      bottom: 4,
      itemWidth: 11,
      itemHeight: 11,
      symbol: 'roundRect',
      seriesIndex: 0,
      pieces: STATES.map((s) => ({value: s.code, label: t(s.zh, s.en), color: s.color})),
      // BaseChart 不注入 visualMap 文本色,此处按暗亮自适应(非语义状态色)。
      textStyle: {color: isDark.value ? '#8a98a8' : '#6b7a89', fontSize: 11},
    },
    series: [
      {
        type: 'heatmap',
        data,
        // 全矩阵每 tick 整体替换,关掉单元格入场动画避免频闪(reduced-motion 由 BaseChart 在 init 期另行处理)。
        animation: false,
        itemStyle: {
          borderColor: isDark.value ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)',
          borderWidth: 1,
          borderRadius: 2,
        },
        emphasis: {
          itemStyle: {
            borderColor: isDark.value ? '#cbd5e1' : '#0f172a',
            borderWidth: 1.5,
          },
        },
      },
    ],
  }
})
</script>

<template>
  <BaseChart
    :option="option"
    :accessible-title="accessibleTitle"
    height="clamp(280px, 40vh, 440px)"
  />
</template>

<style scoped>
/* 图表区由 BaseChart 托管尺寸/主题;此组件仅做 option 组装,无额外样式。 */
</style>
