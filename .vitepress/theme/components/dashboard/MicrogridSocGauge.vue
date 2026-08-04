<script setup lang="ts">
/**
 * 招牌②:储能 SOC 仪表(ECharts gauge 0-100 绿黄红分段)+ 充放电功率条 + SOC 水位球(DvWaterLevelPond)。
 * SOC 分段:0-20 红(过放) / 20-40 琥珀(低) / 40-90 绿(健康) / 90-100 琥珀(过充告警)。
 * WaterLevelPond 用整数缓存引用,值不变不重建,防波浪动画重置闪屏。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const socSrc = useDomainSeries(
  {baseline: 68, unit: '%', cycle: (s) => Math.sin(s / 150), cycleAmp: 0.1, noiseAmp: 0.5},
  {intervalMs: 2000, seed: 21, window: 2},
)
// PCS 充放电功率:正=放电,负=充电
const pcsSrc = useDomainSeries(
  {baseline: 60, unit: 'kW', cycle: (s) => Math.sin(s / 90 + 1), cycleAmp: 0.9, noiseAmp: 6},
  {seed: 24, window: 2},
)

const soc = computed(() => Math.max(0, Math.min(100, socSrc.current.value)))
const pcs = computed(() => Math.round(pcsSrc.current.value))
const PCS_MAX = 200 // PCS 额定 kW,充放电条按此归一

const band = computed(() => {
  const v = soc.value
  if (v < 20) return {color: '#ff5252', zh: '过放告警', en: 'Deep discharge'}
  if (v < 40) return {color: '#ffb020', zh: '电量偏低', en: 'Low charge'}
  if (v <= 90) return {color: '#00e676', zh: '健康区间', en: 'Healthy'}
  return {color: '#ffb020', zh: '过充告警', en: 'Over-charge'}
})

const option = computed(() => ({
  series: [
    {
      type: 'gauge',
      min: 0,
      max: 100,
      startAngle: 210,
      endAngle: -30,
      radius: '92%',
      center: ['50%', '60%'],
      progress: {show: true, width: 12, roundCap: true},
      pointer: {width: 4, length: '62%', itemStyle: {color: '#d4ecff'}},
      anchor: {show: true, size: 10, itemStyle: {color: '#d4ecff', borderColor: band.value.color, borderWidth: 2}},
      axisLine: {
        lineStyle: {
          width: 12,
          color: [
            [0.2, '#ff5252'],
            [0.4, '#ffb020'],
            [0.9, '#00e676'],
            [1, '#ffb020'],
          ],
        },
      },
      axisTick: {distance: -20, length: 4, lineStyle: {color: 'rgba(212,236,255,0.5)'}},
      splitLine: {distance: -22, length: 10, lineStyle: {color: 'rgba(212,236,255,0.6)', width: 1.5}},
      axisLabel: {distance: -2, color: '#6b8cae', fontSize: 9},
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '32%'],
        formatter: '{value}%',
        color: band.value.color,
        fontSize: 26,
        fontWeight: 800,
        fontFamily: 'var(--dc3d-mono)',
      },
      title: {offsetCenter: [0, '58%'], color: '#6b8cae', fontSize: 10},
      data: [{value: soc.value, name: 'SOC'}],
    },
  ],
}))

const pcsPct = computed(() => Math.min(100, (Math.abs(pcs.value) / PCS_MAX) * 100))
const pcsColor = computed(() => (pcs.value >= 0 ? '#00e676' : '#2b9bff'))
const pcsLabel = computed(() => (pcs.value >= 0 ? t('放电', 'Discharge') : t('充电', 'Charge')))
const pcsSign = computed(() => (pcs.value >= 0 ? '+' : ''))

// WaterLevelPond 防闪:整数不变返回同一引用
let lastPond = -1
let pondCfg: any = null
const pondConfig = computed(() => {
  const v = Math.round(soc.value)
  if (v !== lastPond) {
    lastPond = v
    pondCfg = {
      data: [v],
      shape: 'round',
      colors: ['#00e5ff', '#2b9bff'],
      formatter: '{value}%',
      waveHeight: 10,
      waveNum: 2,
      digitalFlopStyle: {fontSize: 12, fill: '#d4ecff'},
      digitalFlopToFixed: 0,
    }
  }
  return pondCfg
})

const accessibleTitle = computed(() => t('储能电池 SOC 仪表与充放电功率', 'Battery SOC gauge and PCS power'))
</script>

<template>
  <div class="socg" role="group" :aria-label="accessibleTitle">
    <div class="socg-gauge">
      <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
    </div>
    <div class="socg-side">
      <ClientOnly>
        <div class="socg-pond">
          <DvWaterLevelPond :config="pondConfig" style="width: 100%; height: 100%" />
        </div>
        <template #fallback>
          <div class="socg-pond socg-pond--fb"><span>{{ Math.round(soc) }}%</span></div>
        </template>
      </ClientOnly>
      <div class="socg-pcs">
        <div class="socg-pcs-head">
          <span class="socg-pcs-name">{{ t('PCS 功率', 'PCS Power') }}</span>
          <span class="socg-pcs-val" :style="{color: pcsColor}">{{ pcsSign }}{{ pcs }} kW</span>
        </div>
        <div class="socg-track">
          <div class="socg-fill" :style="{width: pcsPct + '%', background: pcsColor, boxShadow: '0 0 8px ' + (pcsColor)}"/>
        </div>
        <span class="socg-pcs-state" :style="{color: pcsColor}">{{ pcsLabel }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.socg { display: flex; gap: 8px; width: 100%; height: 100%; box-sizing: border-box; }
.socg-gauge { flex: 1.5; min-width: 0; height: 100%; }
.socg-side { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.socg-pond { flex: 1; min-height: 0; }
.socg-pond--fb { display: flex; align-items: center; justify-content: center; border-radius: 50%;
  border: 2px solid #00e5ff; color: #d4ecff; font-family: var(--dc3d-mono); font-weight: 700; }
.socg-pcs { flex: 0 0 auto; padding: 4px 6px; border: 1px solid var(--dc3d-panel-border); border-radius: var(--dc3d-radius); background: var(--dc3d-panel-bg); }
.socg-pcs-head { display: flex; justify-content: space-between; align-items: baseline; }
.socg-pcs-name { font-size: 11px; color: var(--dc3d-text-dim); }
.socg-pcs-val { font-size: 15px; font-weight: 700; font-family: var(--dc3d-mono); }
.socg-track { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; margin: 5px 0 3px; overflow: hidden; }
.socg-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
.socg-pcs-state { font-size: 11px; font-weight: 600; }
</style>
