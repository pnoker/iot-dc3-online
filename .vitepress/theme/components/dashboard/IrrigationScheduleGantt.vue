<script setup lang="ts">
/**
 * 招牌 ③ 灌溉调度甘特图(BaseChart custom renderItem)。
 * X=时刻(06:00–22:00,value 小时),Y=灌溉分区(滴灌A / 滴灌B / 喷灌C / 微雾D)。
 * 每分区若干灌溉块,状态:已灌(done)/ 正在(active)/ 计划(planned),由实时 nowHour 判定。
 * 叠加:累积蒸散需水 ETc 曲线(右轴 mm,单调升)+ ET₀ 触发阈值 markLine(2.0mm 需水线)
 *       + 当前时刻 now 垂线。阈值越限即触发下一次灌溉 —— 真实灌溉调度逻辑。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const ZONES = [
  {zh: '滴灌 A 区', en: 'Drip A'},
  {zh: '滴灌 B 区', en: 'Drip B'},
  {zh: '喷灌 C 区', en: 'Sprink C'},
  {zh: '微雾 D 区', en: 'Mist D'},
]
const zoneNames = computed(() => ZONES.map((z) => t(z.zh, z.en)))

// 各分区灌溉计划:[起始 h, 时长 h, 灌水深度 mm]
type Block = [number, number, number]
const SCHEDULE: Block[][] = [
  [[6.5, 0.5, 1.8], [11.0, 0.5, 2.0], [15.5, 0.6, 2.2], [19.0, 0.5, 1.6]], // A
  [[7.0, 0.5, 1.5], [12.5, 0.6, 2.1], [16.5, 0.5, 1.9]], // B
  [[8.0, 0.7, 2.4], [14.0, 0.7, 2.6], [18.0, 0.6, 2.0]], // C
  [[9.5, 0.4, 1.2], [13.0, 0.4, 1.3], [17.0, 0.4, 1.2], [20.5, 0.4, 1.0]], // D
]

// 实时时钟:缓慢推进(每秒 +0.00012h ≈ 每分钟 +0.0072h),包卷在 6..22 之间
const {current: nowRaw} = useDomainSeries(
  {baseline: 14.0, unit: 'h', trend: (tm) => tm * 0.00012, noiseAmp: 0},
  {seed: 5, window: 2},
)
const nowHour = computed(() => {
  const span = 22 - 6
  const v = nowRaw.value - 6
  return 6 + ((v % span) + span) % span
})

const STATUS = {
  done: {fill: 'rgba(31,122,60,0.78)', stroke: 'rgba(46,200,110,0.9)', text: '#bff0d0', lw: 1},
  active: {fill: 'rgba(0,229,255,0.85)', stroke: '#00e5ff', text: '#062a33', lw: 1.5},
  planned: {fill: 'rgba(255,176,32,0.10)', stroke: '#ffb020', text: '#ffb020', lw: 1.2},
}
type StatusKey = keyof typeof STATUS

// 构造 custom 数据 + 汇总今日灌水量
const blocks = computed(() => {
  const now = nowHour.value
  const list: any[] = []
  let totalMm = 0
  let activeZone = -1
  SCHEDULE.forEach((zone, zi) => {
    zone.forEach(([s, d, depth]) => {
      const e = s + d
      let st: StatusKey = 'planned'
      if (e <= now) st = 'done'
      else if (s <= now && now < e) {
        st = 'active'
        activeZone = zi
      }
      list.push([s, zi, e, st, depth])
      if (st !== 'planned') totalMm += depth
    })
  })
  return {list, totalMm: +totalMm.toFixed(1), activeZone}
})

// 累积蒸散需水 ETc(单调升,日钟形速率 0.5mm/h @ 13h)+ 触发阈值 2.0mm
const TRIGGER_MM = 2.0
const etcLine = computed(() => {
  const now = nowHour.value
  const pts: [number, number][] = []
  let cum = 0
  for (let h = 6; h <= 22; h += 0.5) {
    const rate = 0.5 * Math.exp(-((h - 13) ** 2) / (2 * 2.6 * 2.6))
    cum += rate * 0.5
    // 未来时段不画(只显示到当前时刻,实线),只到 now
    if (h <= now + 0.01) pts.push([h, +cum.toFixed(2)])
  }
  return pts
})

const accessibleTitle = computed(() => t('灌溉调度甘特图与 ET₀ 需水线', 'Irrigation schedule gantt with ET₀ demand line'))

function statusOf(s: number, e: number, now: number): StatusKey {
  if (e <= now) return 'done'
  if (s <= now && now < e) return 'active'
  return 'planned'
}

const option = computed(() => {
  const now = nowHour.value
  const zNames = zoneNames.value
  // custom renderItem:按状态着色 + 灌水深度的圆角条
  function renderItem(_params: any, api: any) {
    const s = api.value(0)
    const zi = api.value(1)
    const e = api.value(2)
    const st = statusOf(s, e, now)
    const depth = api.value(4)
    const start = api.coord([s, zi])
    const end = api.coord([e, zi])
    const w = end[0] - start[0]
    const bandH = api.size([0, 1])[1]
    const h = bandH * 0.5
    const x = start[0]
    const y = start[1] - h / 2
    const style = STATUS[st]
    const label = `${depth}mm`
    const children: any[] = [
      {
        type: 'rect',
        shape: {x, y, width: Math.max(2, w), height: h, r: 3},
        style: {
          fill: style.fill,
          stroke: style.stroke,
          lineWidth: style.lw,
          lineDash: st === 'planned' ? [3, 2] : [0],
          shadowBlur: st === 'active' ? 10 : 0,
          shadowColor: '#00e5ff',
        },
      },
      {
        type: 'text',
        style: {
          text: label,
          x: x + Math.max(2, w) / 2,
          y: y + h / 2,
          textAlign: 'center',
          textVerticalAlign: 'middle',
          fill: style.text,
          fontSize: 10,
          fontWeight: 600,
          fontFamily: 'JetBrains Mono, monospace',
        },
      },
    ]
    // 正在灌:进度脉冲点
    if (st === 'active') {
      children.push({
        type: 'circle',
        shape: {cx: x + 3, cy: y + h / 2, r: 2.5},
        style: {fill: '#ffffff', shadowBlur: 8, shadowColor: '#00e5ff'},
      })
    }
    return {type: 'group', children}
  }

  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const [s, zi, e, st, depth] = p.value
        const statusLabel = st === 'done' ? t('已灌', 'Done') : st === 'active' ? t('正在灌溉', 'Active') : t('计划', 'Planned')
        const fmtH = (h: number) => {
          const hh = Math.floor(h)
          const mm = Math.round((h - hh) * 60)
          return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
        }
        return [
          `<b>${zNames[zi]}</b>`,
          `${t('时段', 'Window')}: ${fmtH(s)} – ${fmtH(e)}`,
          `${t('状态', 'Status')}: ${statusLabel}`,
          `${t('灌水深度', 'Depth')}: ${depth} mm`,
        ].join('<br/>')
      },
    },
    grid: {left: 56, right: 44, top: 26, bottom: 28},
    xAxis: {
      type: 'value',
      min: 6,
      max: 22,
      interval: 2,
      axisLabel: {
        formatter: (v: number) => {
          const hh = Math.floor(v)
          return `${String(hh).padStart(2, '0')}:00`
        },
        fontSize: 10,
      },
      name: t('时刻', 'Time'),
      nameTextStyle: {color: '#6b8cae', fontSize: 10, padding: [0, 0, 0, -10]},
    },
    yAxis: [
      {
        type: 'category',
        data: zNames,
        inverse: true,
        axisTick: {show: false},
        splitArea: {show: false},
      },
      {
        type: 'value',
        name: 'ETc(mm)',
        min: 0,
        max: 3.5,
        position: 'right',
        nameTextStyle: {color: '#ffb020', fontSize: 9},
        axisLabel: {color: '#ffb020', fontSize: 9, formatter: '{value}'},
        splitLine: {show: false},
      },
    ],
    legend: {
      data: [t('已灌', 'Done'), t('正在', 'Active'), t('计划', 'Planned'), t('累积蒸散 ETc', 'Cumulative ETc')],
      top: 2,
      textStyle: {color: '#6b8cae', fontSize: 11},
      itemWidth: 12,
      itemHeight: 8,
    },
    series: [
      {
        name: t('灌溉调度', 'Irrigation'),
        type: 'custom',
        renderItem,
        yAxisIndex: 0,
        encode: {x: [0, 2], y: 1},
        data: blocks.value.list,
        markLine: {
          silent: true,
          symbol: 'none',
          label: {
            show: true,
            position: 'end',
            formatter: t('现在', 'now'),
            color: '#ffffff',
            fontSize: 10,
          },
          lineStyle: {color: 'rgba(255,255,255,0.55)', type: 'solid', width: 1.2},
          data: [{xAxis: now}],
        },
      },
      {
        name: t('累积蒸散 ETc', 'Cumulative ETc'),
        type: 'line',
        yAxisIndex: 1,
        data: etcLine.value,
        smooth: true,
        symbol: 'none',
        lineStyle: {width: 2, color: '#ffb020', shadowBlur: 8, shadowColor: '#ffb020'},
        areaStyle: {color: {type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: 'rgba(255,176,32,0.35)'}, {offset: 1, color: 'rgba(255,176,32,0)'}]}},
        markLine: {
          silent: true,
          symbol: 'none',
          label: {show: true, position: 'insideStartTop', formatter: t('ET₀ 需水阈值 2.0mm', 'ET₀ trigger 2.0mm'), color: '#ff5252', fontSize: 10, fontWeight: 600},
          lineStyle: {color: '#ff5252', type: 'dashed', width: 1.2},
          data: [{yAxis: TRIGGER_MM}],
        },
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(220px, 28vh, 320px)" />
</template>

<style scoped>
/* 图表区由 BaseChart 托管 */
</style>
