<script setup lang="ts">
/**
 * 路口排队长度(横向 bar,按长度语义着色:<50 绿/50-120 黄/120-200 橙/>200 红 spillback)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface I {zh: string; en: string; base: number; phase: number; seed: number}
const IS: I[] = [
  {zh: '人民·解放', en: 'Renmin-Jiefang', base: 210, phase: 0.0, seed: 301},
  {zh: '解放·中山', en: 'Jiefang-Zhongshan', base: 165, phase: 0.7, seed: 302},
  {zh: '中山·建国', en: 'Zhongshan-Jianguo', base: 132, phase: 1.4, seed: 303},
  {zh: '建国·滨海', en: 'Jianguo-Binhai', base: 98, phase: 2.1, seed: 304},
  {zh: '人民·中山', en: 'Renmin-Zhongshan', base: 178, phase: 2.8, seed: 305},
  {zh: '解放·滨海', en: 'Jiefang-Binhai', base: 76, phase: 3.5, seed: 306},
  {zh: '外环·人民', en: 'Ring-Renmin', base: 54, phase: 4.2, seed: 307},
  {zh: '滨海·沿海', en: 'Binhai-Coast', base: 42, phase: 4.9, seed: 308},
]
const items = IS.map((it) => ({
  name: computed(() => t(it.zh, it.en)),
  q: useDomainSeries({baseline: it.base, unit: 'm', cycle: (s) => Math.sin(s / 120 + it.phase), cycleAmp: 0.18, noiseAmp: 6, events: [{rate: 1 / 90, type: 'spike', size: 60}]}, {seed: it.seed, window: 2}).current,
}))
function qColor(v: number) {return v < 50 ? '#16c784' : v < 120 ? '#ffd24a' : v < 200 ? '#ff6b35' : '#ff5252'}

const accessibleTitle = computed(() => t('路口排队长度柱状图', 'Intersection queue length bars'))
const option = computed(() => ({
  tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}, formatter: (p: any[]) => p.filter((x) => x.value != null).map((x) => `<div>${x.name}<br/>${t('排队', 'Queue')} <b style="color:${x.color}">${x.value} m</b></div>`).join('')},
  grid: {left: 8, right: 18, top: 12, bottom: 8, containLabel: true},
  xAxis: {type: 'value', name: 'm'},
  yAxis: {type: 'category', data: items.map((it) => it.name.value), inverse: true, axisTick: {show: false}},
  series: [{
    type: 'bar', barWidth: '55%',
    data: items.map((it) => {
      const v = Math.max(0, Math.round(it.q.value))
      return {value: v, itemStyle: {color: qColor(v), borderRadius: [0, 3, 3, 0]}, _v: v}
    }),
    label: {show: true, position: 'right', color: '#d4ecff', fontSize: 10, fontFamily: 'var(--dc3d-mono)', formatter: (p: any) => `${p.data._v}m`},
  }],
}))
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" />
</template>
