<script setup lang="ts">
/**
 * 主扇工况:风量主仪表(ECharts gauge,绿黄红分段)+
 * 侧栏负压/温度/振动三指标条(各带法定/厂规阈值)。
 * 主扇为抽出式:风量 m³/min(额定 9200)、负压 kPa(矿井负压)、
 * 轴承温度 °C、振动速度 mm/s(ISO 10816 预警 7.1 / 危险 11.2)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const FAN_MAX = 9200
const flowSrc = useDomainSeries({baseline: 8400, unit: 'm³/min', cycle: (s) => Math.sin(s / 110), cycleAmp: 0.04, noiseAmp: 26}, {seed: 33, window: 2}).current
const pressSrc = useDomainSeries({baseline: 4.2, unit: 'kPa', cycle: (s) => Math.sin(s / 100 + 1.2), cycleAmp: 0.06, noiseAmp: 0.06}, {seed: 61, window: 2}).current
const tempSrc = useDomainSeries({baseline: 58, unit: '°C', cycle: (s) => Math.sin(s / 90 + 2.1), cycleAmp: 0.05, noiseAmp: 0.8}, {seed: 62, window: 2}).current
const vibSrc = useDomainSeries({baseline: 4.6, unit: 'mm/s', cycle: (s) => Math.sin(s / 75 + 0.4), cycleAmp: 0.18, noiseAmp: 0.3, events: [{rate: 1 / 110, type: 'spike', size: 3.5}]}, {seed: 63, window: 2}).current

const flow = computed(() => Math.max(0, Math.min(FAN_MAX, flowSrc.value)))
const flowPct = computed(() => flow.value / FAN_MAX)

function flowBand(p: number) {
  if (p < 0.6) return {color: '#ffb020', zh: '风量不足', en: 'Low flow'}
  if (p <= 0.95) return {color: '#00e676', zh: '运行正常', en: 'Normal'}
  return {color: '#ff5252', zh: '超额定', en: 'Overload'}
}
const fband = computed(() => flowBand(flowPct.value))

const option = computed(() => ({
  series: [
    {
      type: 'gauge',
      min: 0,
      max: FAN_MAX,
      startAngle: 210,
      endAngle: -30,
      radius: '94%',
      center: ['50%', '62%'],
      progress: {show: true, width: 11, roundCap: true},
      pointer: {width: 4, length: '60%', itemStyle: {color: '#d4ecff'}},
      anchor: {show: true, size: 9, itemStyle: {color: '#d4ecff', borderColor: fband.value.color, borderWidth: 2}},
      axisLine: {
        lineStyle: {
          width: 11,
          color: [
            [0.6, '#ffb020'],
            [0.95, '#00e676'],
            [1, '#ff5252'],
          ],
        },
      },
      axisTick: {distance: -18, length: 4, lineStyle: {color: 'rgba(212,236,255,0.5)'}},
      splitLine: {distance: -20, length: 9, lineStyle: {color: 'rgba(212,236,255,0.6)', width: 1.4}},
      axisLabel: {distance: -2, color: '#6b8cae', fontSize: 8, formatter: (v: number) => (v >= 1000 ? v / 1000 + 'k' : '')},
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '34%'],
        formatter: '{value}',
        color: fband.value.color,
        fontSize: 22,
        fontWeight: 800,
        fontFamily: 'var(--dc3d-mono)',
      },
      title: {offsetCenter: [0, '58%'], color: '#6b8cae', fontSize: 9},
      data: [{value: Math.round(flow.value), name: 'm³/min'}],
    },
  ],
}))

// 侧栏三指标:负压(kPa,预警>5.5)、温度(°C,预警>75)、振动(mm/s,预警7.1/危险11.2)
interface Ind {key: string; name: string; value: number; max: number; unit: string; warn: number; danger: number}
const indicators = computed<Ind[]>(() => [
  {key: 'press', name: t('负压', 'Pressure'), value: +pressSrc.value.toFixed(2), max: 8, unit: 'kPa', warn: 5.5, danger: 7},
  {key: 'temp', name: t('轴承温度', 'Bearing Temp'), value: Math.round(tempSrc.value), max: 100, unit: '°C', warn: 75, danger: 90},
  {key: 'vib', name: t('振动', 'Vibration'), value: +vibSrc.value.toFixed(1), max: 14, unit: 'mm/s', warn: 7.1, danger: 11.2},
])
function indColor(it: Ind): string {
  if (it.value >= it.danger) return '#ff5252'
  if (it.value >= it.warn) return '#ffa726'
  return '#00e676'
}
function indPct(it: Ind): number {
  return Math.max(0, Math.min(100, (it.value / it.max) * 100))
}

const accessibleTitle = computed(() => t('主扇风量负压温度振动工况', 'Main fan flow, pressure, temp, vibration'))
</script>

<template>
  <div class="fan" role="group" :aria-label="accessibleTitle">
    <div class="fan-gauge">
      <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
    </div>
    <ul class="fan-side">
      <li v-for="it in indicators" :key="it.key" class="ind">
        <div class="ind-head">
          <span class="ind-name">{{ it.name }}</span>
          <span class="ind-val" :style="{color: indColor(it)}">{{ it.value }}<small>{{ it.unit }}</small></span>
        </div>
        <div class="ind-track">
          <span class="ind-fill" :style="{width: indPct(it) + '%', background: indColor(it), boxShadow: '0 0 8px ' + (indColor(it))}"/>
          <span class="ind-warn" :style="{left: (it.warn / it.max) * 100 + '%'}" />
          <span class="ind-warn ind-danger" :style="{left: (it.danger / it.max) * 100 + '%'}" />
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.fan {display: flex; gap: 8px; width: 100%; height: 100%; box-sizing: border-box;}
.fan-gauge {flex: 1.5; min-width: 0; height: 100%;}
.fan-side {flex: 1; list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; justify-content: center; gap: 14px; min-width: 0;}
.ind-head {display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;}
.ind-name {font-size: 11px; color: var(--dc3d-text-dim);}
.ind-val {font-size: 15px; font-weight: 700; font-family: var(--dc3d-mono, monospace);}
.ind-val small {font-size: 9px; opacity: 0.7; margin-left: 2px;}
.ind-track {position: relative; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: visible;}
.ind-fill {display: block; height: 100%; border-radius: 3px; transition: width 0.5s ease;}
.ind-warn {position: absolute; top: -2px; width: 1.5px; height: 10px; background: #ffa726; opacity: 0.8;}
.ind-danger {background: #ff5252;}
</style>
