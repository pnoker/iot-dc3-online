<script setup lang="ts">
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 理论产能(件/班):瀑布的固定起点,六大损失从其上逐级扣除。
const THEORETICAL = 1200

// 六大损失基线幅度(件)。可用性损失占比最大,符合离散制造实际分布。
const BASE = {
  failure: 60, // 故障停机(unplanned breakdown)
  changeover: 36, // 换型/调试(setup & changeover)
  material: 18, // 缺料/物流(material shortage)
  minorStop: 30, // 小停机(minor stops / idling)
  taktDev: 42, // 节拍偏离(ideal cycle time 偏差)
  rework: 12, // 返工(rework)
  scrap: 22, // 废品(scrap / reject)
}

// 三组损失幅度漂移乘子(各自独立相位、~±15%、约 10min 周期),驱动瀑布缓慢呼吸。
// 用 useDomainSeries 的 multiplicative cycle 做慢漂移,computed option 每 tick 重算。
const driftAvail = useDomainSeries(
  {baseline: 1, unit: '×', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 95), cycleAmp: 0.15, noiseAmp: 0.02},
  {intervalMs: 1000, window: 60, seed: 7},
)
const driftPerf = useDomainSeries(
  {baseline: 1, unit: '×', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 95 + 2.1), cycleAmp: 0.15, noiseAmp: 0.02},
  {intervalMs: 1000, window: 60, seed: 19},
)
const driftQual = useDomainSeries(
  {baseline: 1, unit: '×', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 95 + 4.2), cycleAmp: 0.13, noiseAmp: 0.015},
  {intervalMs: 1000, window: 60, seed: 31},
)

// 当前损失幅度(件,随漂移缓慢变化)
const losses = computed(() => {
  const a = driftAvail.current.value
  const p = driftPerf.current.value
  const q = driftQual.current.value
  return {
    failure: Math.round(BASE.failure * a),
    changeover: Math.round(BASE.changeover * a),
    material: Math.round(BASE.material * a),
    minorStop: Math.round(BASE.minorStop * p),
    taktDev: Math.round(BASE.taktDev * p),
    rework: Math.round(BASE.rework * q),
    scrap: Math.round(BASE.scrap * q),
  }
})

// OEE 及三分解率:可用性 × 性能 × 质量 = 良品/理论(瀑布终点即良品)
const metrics = computed(() => {
  const L = losses.value
  const availLoss = L.failure + L.changeover + L.material
  const perfLoss = L.minorStop + L.taktDev
  const qualLoss = L.rework + L.scrap
  const runAfterAvail = THEORETICAL - availLoss
  const runAfterPerf = runAfterAvail - perfLoss
  const good = runAfterPerf - qualLoss
  const a = runAfterAvail / THEORETICAL
  const p = runAfterAvail > 0 ? runAfterPerf / runAfterAvail : 0
  const qq = runAfterPerf > 0 ? good / runAfterPerf : 0
  return {
    good,
    a: (a * 100).toFixed(1),
    p: (p * 100).toFixed(1),
    q: (qq * 100).toFixed(1),
    o: ((good / THEORETICAL) * 100).toFixed(1),
  }
})

const accessibleTitle = computed(() => t('OEE 六大损失瀑布', 'OEE six-loss waterfall'))

// 瀑布技法:同 stack('oee')的两条 bar —— 透明占位(底,= 扣除该损失后的累计水位)+
// 实色增量(顶,= 该损失幅度)。二者堆叠即悬浮于累计水位上的损失条。
// 终点(实际产出)与起点(理论产能)占位为 0,画成贯穿到底的整条。
const option = computed(() => {
  const L = losses.value
  const m = metrics.value
  const unit = t('件', 'units')
  const names = [
    t('理论产能', 'Theoretical'),
    t('故障', 'Failure'),
    t('换型', 'Changeover'),
    t('缺料', 'Material'),
    t('小停机', 'Minor stop'),
    t('节拍偏离', 'Takt gap'),
    t('返工', 'Rework'),
    t('废品', 'Scrap'),
    t('实际产出', 'Actual'),
  ]
  const grpAvail = t('可用性损失', 'Availability loss')
  const grpPerf = t('性能损失', 'Performance loss')
  const grpQual = t('质量损失', 'Quality loss')
  const seq = [
    {v: L.failure, color: '#dc2626', group: grpAvail},
    {v: L.changeover, color: '#d97706', group: grpAvail},
    {v: L.material, color: '#dc2626', group: grpAvail},
    {v: L.minorStop, color: '#d97706', group: grpPerf},
    {v: L.taktDev, color: '#d97706', group: grpPerf},
    {v: L.rework, color: '#d97706', group: grpQual},
    {v: L.scrap, color: '#dc2626', group: grpQual},
  ]

  const placeholder: number[] = new Array(9).fill(0)
  const items: any[] = []

  // 起点:理论产能(整条,信息色)
  placeholder[0] = 0
  items[0] = solidItem({
    value: THEORETICAL,
    color: '#0a6cb2',
    label: String(THEORETICAL),
    meta: {kind: 'ref', name: names[0], value: THEORETICAL, desc: t('计划理论产出', 'Planned theoretical output')},
  })

  // 七大损失:逐级下扣,占位 = 扣除后的累计水位
  let running = THEORETICAL
  seq.forEach((s, i) => {
    running -= s.v
    placeholder[i + 1] = running
    items[i + 1] = solidItem({
      value: s.v,
      color: s.color,
      label: `−${s.v}`,
      meta: {
        kind: 'loss',
        name: names[i + 1],
        group: s.group,
        value: s.v,
        pct: ((s.v / THEORETICAL) * 100).toFixed(1),
      },
    })
  })

  // 终点:实际产出(良品,正常色)+ OEE 双行标签
  placeholder[8] = 0
  items[8] = {
    value: m.good,
    itemStyle: {color: '#16a34a', borderRadius: [3, 3, 0, 0]},
    label: {
      show: true,
      position: 'top',
      formatter: [`{a|${m.good}}`, `{b|OEE ${m.o}%}`].join('\n'),
      rich: {
        a: {fontSize: 12, fontWeight: 700, color: '#16a34a', lineHeight: 14, align: 'center'},
        b: {fontSize: 9, fontWeight: 600, color: '#94a3b8', lineHeight: 11, align: 'center'},
      },
    },
    _meta: {kind: 'output', name: names[8], value: m.good, oee: m.o, a: m.a, p: m.p, q: m.q},
  }

  return {
    grid: {left: 46, right: 16, top: 34, bottom: 64},
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: {interval: 0, rotate: 38, fontSize: 10},
      axisTick: {alignWithLabel: true},
    },
    yAxis: {
      type: 'value',
      name: unit,
      nameTextStyle: {color: '#94a3b8', fontSize: 10, padding: [0, 0, 4, -22]},
      max: Math.ceil(THEORETICAL * 1.05),
      splitNumber: 4,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {type: 'shadow'},
      formatter: (params: any[]) => {
        const p = (params || []).find((x) => x.seriesName === '__val')
        const d = p?.data?._meta
        if (!d) return ''
        if (d.kind === 'ref') {
          return `<b>${d.name}</b><br/>${d.desc} · ${d.value} ${unit}`
        }
        if (d.kind === 'loss') {
          return `<b>${d.name}</b> <span style="color:#94a3b8">${d.group}</span><br/>${t('损失', 'Loss')} ${d.value} ${unit} (${d.pct}%)`
        }
        return `<b>${d.name}</b> · ${t('良品', 'Good')} ${d.value} ${unit}<br/>OEE ${d.oee}% · ${t('可用性', 'A')} ${d.a}% · ${t('性能', 'P')} ${d.p}% · ${t('质量', 'Q')} ${d.q}%`
      },
    },
    series: [
      {
        name: '__ph',
        type: 'bar',
        stack: 'oee',
        silent: true,
        itemStyle: {color: 'transparent', borderColor: 'transparent'},
        barWidth: '48%',
        data: placeholder,
        z: 1,
      },
      {
        name: '__val',
        type: 'bar',
        stack: 'oee',
        barWidth: '48%',
        data: items,
        z: 2,
        // 三组损失的背景色带 + 组名(可用性/性能/质量),中性低透明,暗亮通用
        markArea: {
          silent: true,
          itemStyle: {color: 'rgba(148,163,184,0.06)', borderWidth: 0},
          label: {color: '#94a3b8', fontSize: 9, fontWeight: 600, position: 'insideTop', distance: 2},
          data: [
            [{name: t('可用性', 'Availability'), xAxis: names[1]}, {xAxis: names[3]}],
            [{name: t('性能', 'Performance'), xAxis: names[4]}, {xAxis: names[5]}],
            [{name: t('质量', 'Quality'), xAxis: names[6]}, {xAxis: names[7]}],
          ],
        },
        // 理论产能参考线:贯穿全图,凸显逐级下扣的落差
        markLine: {
          silent: true,
          symbol: 'none',
          label: {show: false},
          lineStyle: {color: 'rgba(148,163,184,0.5)', type: 'dashed', width: 1},
          data: [{yAxis: THEORETICAL}],
        },
      },
    ],
  }
})

// 实色增量条:itemStyle.color 用固定语义 hex(BaseChart 不覆盖 data 级 itemStyle),
// label 颜色取条本身的语义色,损失一目了然。
function solidItem(o: {value: number; color: string; label: string; meta: any}) {
  return {
    value: o.value,
    itemStyle: {color: o.color, borderRadius: [3, 3, 0, 0]},
    label: {show: true, position: 'top', formatter: o.label, color: o.color, fontSize: 11, fontWeight: 600},
    _meta: o.meta,
  }
}
</script>

<template>
  <div class="dc3d-oee-waterfall">
    <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(240px, 30vh, 360px)" />
  </div>
</template>

<style scoped>
.dc3d-oee-waterfall {
  width: 100%;
}
</style>
