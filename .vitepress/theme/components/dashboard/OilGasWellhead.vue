<script setup lang="ts">
/**
 * 井口多参数:气井 W-1 实时多参数卡组(2×2 网格)。
 * 四参数:油压/套压(MPa)、井口温度(°C)、日产气量(10⁴Nm³/d)。
 * 每卡:大号实时值 + 量程进度条 + 高低限标记。每路 useDomainSeries 缓变。
 * 油压/套压差值反映井筒健康状况(差值过大→井筒堵塞或液体积聚)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Param {
  key: string
  label: string
  unit: string
  baseline: number
  min: number
  max: number
  lo: number // 下限
  hi: number // 上限
  color: string
  cycle: (s: number) => number
  amp: number
  noise: number
  seed: number
  round: boolean
}
const PARAMS: Param[] = [
  {key: 'tp', label: t('油压', 'Tubing Press'), unit: 'MPa', baseline: 18.6, min: 0, max: 35, lo: 8, hi: 28, color: '#00e5ff', cycle: (s) => Math.sin(s / 120), amp: 0.04, noise: 0.15, seed: 7101, round: false},
  {key: 'cp', label: t('套压', 'Casing Press'), unit: 'MPa', baseline: 21.4, min: 0, max: 35, lo: 8, hi: 30, color: '#2b9bff', cycle: (s) => Math.sin(s / 130 + 1.1), amp: 0.03, noise: 0.15, seed: 7102, round: false},
  {key: 'temp', label: t('井口温度', 'Wellhead Temp'), unit: '°C', baseline: 36.8, min: 0, max: 80, lo: 5, hi: 65, color: '#ffa726', cycle: (s) => Math.sin(s / 150 + 2.2), amp: 0.05, noise: 0.3, seed: 7103, round: false},
  {key: 'rate', label: t('日产气量', 'Daily Gas Rate'), unit: '10⁴Nm³/d', baseline: 12.8, min: 0, max: 25, lo: 3, hi: 20, color: '#00e676', cycle: (s) => Math.sin(s / 110 + 3.3), amp: 0.05, noise: 0.18, seed: 7104, round: false},
]

const params = PARAMS.map((p) => ({
  ref: p,
  val: useDomainSeries(
    {baseline: p.baseline, unit: p.unit, cycle: p.cycle, cycleAmp: p.amp, noiseAmp: p.noise},
    {seed: p.seed, window: 2},
  ).current,
}))

const cards = computed(() =>
  params.map((p) => {
    const v = Math.max(p.ref.min, Math.min(p.ref.max, p.val.value))
    const pct = ((v - p.ref.min) / (p.ref.max - p.ref.min)) * 100
    const loPct = ((p.ref.lo - p.ref.min) / (p.ref.max - p.ref.min)) * 100
    const hiPct = ((p.ref.hi - p.ref.min) / (p.ref.max - p.ref.min)) * 100
    const alarm = v >= p.ref.hi || v <= p.ref.lo
    return {
      key: p.ref.key,
      label: p.ref.label,
      unit: p.ref.unit,
      value: p.ref.round ? Math.round(v) : +v.toFixed(1),
      pct,
      loPct,
      hiPct,
      color: alarm ? '#ff5252' : p.ref.color,
    }
  }),
)

const wellLabel = computed(() => t('井场 W-1', 'Well W-1'))
const accessibleTitle = computed(() => t('气井井口多参数实时监测', 'Gas well wellhead real-time multi-parameter'))
</script>

<template>
  <div class="ogwell" role="group" :aria-label="accessibleTitle">
    <div class="ogwell__head">
      <span class="ogwell__well">{{ wellLabel }}</span>
      <span class="ogwell__live">{{ t('采气中', 'Producing') }}</span>
    </div>
    <div class="ogwell__grid">
      <div v-for="c in cards" :key="c.key" class="ogwell__card" :style="{ '--c': c.color }">
        <div class="ogwell__row">
          <span class="ogwell__label">{{ c.label }}</span>
          <span class="ogwell__unit">{{ c.unit }}</span>
        </div>
        <div class="ogwell__value" :style="{color: c.color}">{{ c.value }}</div>
        <div class="ogwell__track">
          <span class="ogwell__lo" :style="{left: c.loPct + '%'}" />
          <span class="ogwell__hi" :style="{left: c.hiPct + '%'}" />
          <span class="ogwell__fill" :style="{width: c.pct + '%', background: c.color, boxShadow: '0 0 8px ' + (c.color)}" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ogwell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
}
.ogwell__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.ogwell__well {
  font-size: 13px;
  font-weight: 600;
  color: var(--dc3d-text);
  letter-spacing: 0.5px;
}
.ogwell__live {
  font-size: 11px;
  color: #00e676;
  font-family: var(--dc3d-mono, monospace);
}
.ogwell__live::before {
  content: '● ';
  animation: ogwell-blink 1.4s ease-in-out infinite;
}
@keyframes ogwell-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.ogwell__grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 8px;
}
.ogwell__card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 10px;
  border: 1px solid color-mix(in srgb, var(--c) 30%, transparent);
  border-radius: var(--dc3d-radius);
  background: var(--dc3d-panel-bg);
  box-shadow: inset 0 0 10px color-mix(in srgb, var(--c) 6%, transparent);
  min-width: 0;
}
.ogwell__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.ogwell__label {
  font-size: 12px;
  color: var(--dc3d-text-dim);
}
.ogwell__unit {
  font-size: 10px;
  color: var(--dc3d-text-dim);
  font-family: var(--dc3d-mono, monospace);
}
.ogwell__value {
  font-size: clamp(20px, 2.6vw, 30px);
  font-weight: 700;
  font-family: var(--dc3d-mono, monospace);
  text-shadow: 0 0 10px color-mix(in srgb, var(--c) 50%, transparent);
  line-height: 1.1;
}
.ogwell__track {
  position: relative;
  height: 5px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: visible;
}
.ogwell__fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
/* 高低限标记线 */
.ogwell__lo,
.ogwell__hi {
  position: absolute;
  top: -2px;
  width: 1.5px;
  height: 9px;
  background: rgba(255, 255, 255, 0.45);
}
</style>
