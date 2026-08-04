<script setup lang="ts">
/**
 * 月台作业甘特(BaseChart custom renderItem)。
 * X=时刻(05:00–22:00),Y=月台门(D01–D06)。每门若干作业块,
 * 状态:已完成(done)/ 进行中(active)/ 计划(planned),由实时 nowHour 判定,
 * 块色 = 货物温层(冷藏青/冷冻蓝/恒温绿/缓冲紫)。叠 now 垂线。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const DOORS = [
  {zh: '月台 D01', en: 'Dock D01'},
  {zh: '月台 D02', en: 'Dock D02'},
  {zh: '月台 D03', en: 'Dock D03'},
  {zh: '月台 D04', en: 'Dock D04'},
  {zh: '月台 D05', en: 'Dock D05'},
  {zh: '月台 D06', en: 'Dock D06'},
]
const doorNames = computed(() => DOORS.map((d) => t(d.zh, d.en)))

// 温层语义色
const LAYER = {
  chilled: {c: '#00e5ff', zh: '冷藏', en: 'Chilled'},
  frozen: {c: '#2b9bff', zh: '冷冻', en: 'Frozen'},
  constant: {c: '#00e676', zh: '恒温', en: 'Constant'},
  buffer: {c: '#7c4dff', zh: '缓冲', en: 'Buffer'},
}
type LayerKey = keyof typeof LAYER

// 各月台作业计划:[起始 h, 时长 h, 温层, 货量 t]
type Block = [number, number, LayerKey, number]
const SCHEDULE: Block[][] = [
  [[5.5, 1.0, 'frozen', 12], [10.0, 0.8, 'frozen', 9], [14.5, 1.0, 'chilled', 8], [19.0, 0.8, 'frozen', 7]],
  [[6.0, 0.9, 'chilled', 10], [11.0, 0.9, 'chilled', 11], [16.0, 0.7, 'constant', 6]],
  [[6.5, 1.2, 'frozen', 14], [12.5, 1.0, 'frozen', 10], [18.0, 0.9, 'chilled', 8]],
  [[7.0, 0.8, 'constant', 7], [13.0, 0.9, 'constant', 8], [17.5, 0.8, 'buffer', 5], [20.5, 0.6, 'constant', 5]],
  [[5.0, 1.1, 'frozen', 13], [9.5, 0.9, 'chilled', 9], [15.0, 1.0, 'frozen', 11], [20.0, 0.7, 'chilled', 6]],
  [[7.5, 0.7, 'buffer', 5], [11.5, 0.8, 'buffer', 6], [16.5, 0.9, 'constant', 7], [21.0, 0.5, 'buffer', 4]],
]

// 实时时钟:缓慢推进,包卷在 5..22 之间
const {current: nowRaw} = useDomainSeries(
  {baseline: 13.5, unit: 'h', trend: (tm) => tm * 0.00015, noiseAmp: 0},
  {seed: 9, window: 2},
)
const nowHour = computed(() => {
  const span = 22 - 5
  const v = nowRaw.value - 5
  return 5 + ((v % span) + span) % span
})

function statusOf(s: number, e: number, now: number): 'done' | 'active' | 'planned' {
  if (e <= now) return 'done'
  if (s <= now && now < e) return 'active'
  return 'planned'
}
const STATUS_ALPHA = {done: 0.78, active: 0.92, planned: 0.14}

const blocks = computed(() => {
  const now = nowHour.value
  const list: any[] = []
  SCHEDULE.forEach((door, di) => {
    door.forEach(([s, d, layer, tons]) => {
      const e = s + d
      list.push([s, di, e, layer, tons, statusOf(s, e, now)])
    })
  })
  return list
})

const accessibleTitle = computed(() => t('月台装车卸车作业时段甘特图', 'Dock door loading and unloading schedule gantt'))

const option = computed(() => {
  const now = nowHour.value
  const dNames = doorNames.value
  function renderItem(_params: any, api: any) {
    const s = api.value(0)
    const di = api.value(1)
    const e = api.value(2)
    const layerKey: LayerKey = api.value(3)
    const tons = api.value(4)
    const st = statusOf(s, e, now)
    const layer = LAYER[layerKey]
    const start = api.coord([s, di])
    const end = api.coord([e, di])
    const w = end[0] - start[0]
    const bandH = api.size([0, 1])[1]
    const h = bandH * 0.5
    const x = start[0]
    const y = start[1] - h / 2
    const alpha = STATUS_ALPHA[st]
    const children: any[] = [
      {
        type: 'rect',
        shape: {x, y, width: Math.max(2, w), height: h, r: 3},
        style: {
          fill: layer.c,
          opacity: alpha,
          stroke: layer.c,
          lineWidth: st === 'planned' ? 1 : 1.4,
          lineDash: st === 'planned' ? [3, 2] : [0],
          shadowBlur: st === 'active' ? 10 : 0,
          shadowColor: layer.c,
        },
      },
      {
        type: 'text',
        style: {
          text: tons + 't',
          x: x + Math.max(2, w) / 2,
          y: y + h / 2,
          textAlign: 'center',
          textVerticalAlign: 'middle',
          fill: st === 'planned' ? layer.c : '#062a33',
          fontSize: 10,
          fontWeight: 600,
          fontFamily: 'JetBrains Mono, monospace',
        },
      },
    ]
    if (st === 'active') {
      children.push({type: 'circle', shape: {cx: x + 3, cy: y + h / 2, r: 2.5}, style: {fill: '#ffffff', shadowBlur: 8, shadowColor: layer.c}})
    }
    return {type: 'group', children}
  }

  const legendData = (Object.keys(LAYER) as LayerKey[]).map((k) => t(LAYER[k].zh, LAYER[k].en))

  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const [s, di, e, layerKey, tons, st] = p.value
        const layer = LAYER[layerKey as LayerKey]
        const stLabel = st === 'done' ? t('已完成', 'Done') : st === 'active' ? t('进行中', 'Active') : t('计划', 'Planned')
        const fmtH = (h: number) => {
          const hh = Math.floor(h)
          const mm = Math.round((h - hh) * 60)
          return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
        }
        return [
          `<b>${dNames[di]}</b>`,
          `${t('时段', 'Window')}: ${fmtH(s)} – ${fmtH(e)}`,
          `${t('温层', 'Layer')}: ${t(layer.zh, layer.en)}`,
          `${t('状态', 'Status')}: ${stLabel}`,
          `${t('货量', 'Cargo')}: ${tons} t`,
        ].join('<br/>')
      },
    },
    grid: {left: 56, right: 16, top: 26, bottom: 24},
    xAxis: {
      type: 'value',
      min: 5,
      max: 22,
      interval: 3,
      axisLabel: {formatter: (v: number) => String(Math.floor(v)).padStart(2, '0') + ':00', fontSize: 10},
      name: t('时刻', 'Time'),
      nameTextStyle: {color: '#6b8cae', fontSize: 10, padding: [0, 0, 0, -10]},
    },
    yAxis: {
      type: 'category',
      data: dNames,
      inverse: true,
      axisTick: {show: false},
    },
    legend: {data: legendData, top: 2, textStyle: {color: '#6b8cae', fontSize: 11}, itemWidth: 12, itemHeight: 8},
    series: [
      {
        name: t('月台作业', 'Dock Ops'),
        type: 'custom',
        renderItem,
        encode: {x: [0, 2], y: 1},
        data: blocks.value,
        markLine: {
          silent: true,
          symbol: 'none',
          label: {show: true, position: 'end', formatter: t('现在', 'now'), color: '#ffffff', fontSize: 10},
          lineStyle: {color: 'rgba(255,255,255,0.55)', type: 'solid', width: 1.2},
          data: [{xAxis: now}],
        },
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
