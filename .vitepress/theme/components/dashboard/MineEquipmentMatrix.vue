<script setup lang="ts">
/**
 * 综采设备矩阵(三机一架)负载热力图:设备类型 × 工作面。
 * 行:采煤机/刮板输送机/转载机/液压支架/破碎机/乳化液泵站(三机一架+辅机);
 * 列:1301/1302/1303/1305 工作面。值=负载率%(0-100)。
 * 色阶:蓝(空载)→绿(健康 60-80)→琥珀(重载)→红(过载>90)。tooltip 派生电流/温度。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const EQUIP_ZH = ['采煤机', '刮板输送机', '转载机', '液压支架', '破碎机', '乳化液泵站']
const EQUIP_EN = ['Shearer', 'AFC', 'Stage Loader', 'Shield', 'Crusher', 'Emulsion Pump']
const equipNames = computed(() => (en.value ? EQUIP_EN : EQUIP_ZH))
const FACES = ['1301', '1302', '1303', '1305']

function hash3(a: number, b: number, c: number): number {
  let h = (a * 374761393 + b * 668265263 + c * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return ((h >>> 0) % 100000) / 100000
}
// 基态负载:重设备(采煤机/支架)偏高,泵站中等;各面微异。
function baseLoad(equipIdx: number, faceIdx: number): number {
  const equipBias = [76, 68, 58, 82, 54, 64][equipIdx] // 采煤机/支架高
  const faceBias = (hash3(equipIdx, faceIdx, 101) - 0.5) * 16
  return Math.max(8, Math.min(96, equipBias + faceBias))
}
function isVolatile(equipIdx: number, faceIdx: number): boolean {
  return hash3(equipIdx, faceIdx, 303) < 0.22
}

// 实时负载漂移
const {current} = useDomainSeries(
  {baseline: 0, unit: '%', cycleMode: 'additive', cycle: (tt) => Math.sin(tt / 55), cycleAmp: 10, noiseAmp: 2.4},
  {intervalMs: 3000, seed: 49},
)

// 派生:负载高→电流/温度高(确定性)
function currentOf(load: number): number {
  return Math.round(180 + load * 3.1) // A
}
function tempOf(equipIdx: number, load: number): number {
  const base = [62, 54, 48, 58, 50, 56][equipIdx]
  return Math.round(base + (load - 60) * 0.4)
}

const accessibleTitle = computed(() => t('综采设备三机一架负载热力图', 'Longwall equipment load heatmap'))

const option = computed(() => {
  const drift = current.value
  const data: any[] = []
  for (let e = 0; e < 6; e++) {
    for (let f = 0; f < 4; f++) {
      const base = baseLoad(e, f)
      const live = isVolatile(e, f) ? drift * (0.5 + hash3(e, f, 404)) : 0
      const load = Math.max(0, Math.min(100, +(base + live).toFixed(0)))
      data.push({
        value: [f, e, load],
        load,
        equip: equipNames.value[e],
        face: FACES[f],
        amp: currentOf(load),
        temp: tempOf(e, load),
      })
    }
  }
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const d = p.data
        return [
          `<b>${d.equip} · ${d.face}${t('面', '')}</b>`,
          `${t('负载率', 'Load')}: <b>${d.load}%</b>`,
          `${t('电流', 'Current')}: ${d.amp} A`,
          `${t('温度', 'Temp')}: ${d.temp}°C`,
        ].join('<br/>')
      },
    },
    grid: {left: 14, right: 14, top: 14, bottom: 60, containLabel: true},
    xAxis: {type: 'category', data: FACES.map((f) => f + (en.value ? '' : '面')), position: 'bottom', axisTick: {show: false}, splitArea: {show: false}},
    yAxis: {type: 'category', data: equipNames.value, axisTick: {show: false}, splitArea: {show: false}},
    visualMap: {
      type: 'continuous',
      min: 20,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 10,
      itemWidth: 12,
      itemHeight: 96,
      inRange: {color: ['#2b9bff', '#16c784', '#ffb020', '#ff5252']},
      textStyle: {color: '#8a98a8', fontSize: 10},
    },
    series: [
      {
        type: 'heatmap',
        data,
        animation: false,
        itemStyle: {borderColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderRadius: 3},
        emphasis: {itemStyle: {borderColor: '#cbd5e1', borderWidth: 1.5}},
        label: {show: true, color: '#0a1428', fontSize: 10, fontWeight: 700, formatter: (p: any) => p.data.load},
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
</template>

<style scoped></style>
