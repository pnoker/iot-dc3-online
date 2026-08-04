<script setup lang="ts">
/**
 * 矿山顶部数字翻牌 KPI 组:DvDigitalFlop ×6 横排。
 * 瓦斯 CH₄ %vol(体积比,非 %LEL)/ 井下人数 / 主扇风量 m³/min /
 * 当班产量 t / 设备开机率 % / 掘进进尺 m/d。
 * 每路 useDomainSeries 独立驱动,config computed 依赖 current 自动重渲。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const CYAN = '#00e5ff', GREEN = '#00e676', AMBER = '#ffb020', PURPLE = '#b980ff', RED = '#ff5252', BLUE = '#2b9bff'

interface Kpi {
  key: string; label: string; content: string; fill: string
  toFixed: number; baseline: number; unit: string
  cycle: (t: number) => number; cycleAmp: number; noiseAmp: number
  seed: number
}
// 瓦斯基线 0.62 %vol(工作面回风隅角典型值,远低于 1.0% 报警线);风量 8400 m³/min;
// 产量/开机率(百分比小 cycleAmp 防 overflow)/掘进进尺各自合理区间。
const KPIS: Kpi[] = [
  {key: 'gas', label: t('瓦斯 CH₄', 'Gas CH₄'), content: '{nt} %vol', fill: RED, toFixed: 2, baseline: 0.62, unit: '%vol', cycle: (s) => Math.sin(s / 90), cycleAmp: 0.22, noiseAmp: 0.03, seed: 11},
  {key: 'ppl', label: t('井下人数', 'Underground'), content: '{nt}', fill: GREEN, toFixed: 0, baseline: 186, unit: '人', cycle: (s) => Math.sin(s / 70 + 1.1), cycleAmp: 0.04, noiseAmp: 2.4, seed: 22},
  {key: 'fan', label: t('主扇风量', 'Fan Flow'), content: '{nt}', fill: CYAN, toFixed: 0, baseline: 8400, unit: 'm³/min', cycle: (s) => Math.sin(s / 110 + 2.2), cycleAmp: 0.03, noiseAmp: 26, seed: 33},
  {key: 'output', label: t('当班产量', 'Shift Output'), content: '{nt} t', fill: AMBER, toFixed: 0, baseline: 3260, unit: 't', trend: (tt) => tt * 1.8, cycle: (s) => Math.sin(s / 130 + 0.5), cycleAmp: 0.02, noiseAmp: 14, seed: 44},
  {key: 'avail', label: t('设备开机率', 'Availability'), content: '{nt} %', fill: BLUE, toFixed: 1, baseline: 88.5, unit: '%', cycle: (s) => Math.sin(s / 140 + 3.0), cycleAmp: 0.03, noiseAmp: 0.5, seed: 55},
  {key: 'advance', label: t('掘进进尺', 'Tunneling'), content: '{nt} m', fill: PURPLE, toFixed: 1, baseline: 14.6, unit: 'm/d', cycle: (s) => Math.sin(s / 100 + 1.7), cycleAmp: 0.05, noiseAmp: 0.25, seed: 66},
]

const flops = KPIS.map((k) => ({
  spec: k,
  current: useDomainSeries({baseline: k.baseline, unit: k.unit, cycle: k.cycle, cycleAmp: k.cycleAmp, noiseAmp: k.noiseAmp, trend: k.trend}, {seed: k.seed, window: 2}).current,
}))

const cards = computed(() =>
  flops.map(({spec, current}) => {
    const raw = current.value
    const num = spec.toFixed === 0 ? Math.round(raw) : Math.round(raw * Math.pow(10, spec.toFixed)) / Math.pow(10, spec.toFixed)
    return {
      key: spec.key, label: spec.label, accent: spec.fill,
      config: {number: [num], content: spec.content, toFixed: spec.toFixed, animationCurve: 'easeOutCubic' as const, style: {fontSize: 28, fill: spec.fill}},
    }
  }),
)
const accessibleTitle = computed(() => t('矿山关键生产安全指标翻牌组', 'Mine key metrics digital flop group'))
</script>

<template>
  <div class="kpi-flops" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div v-for="c in cards" :key="c.key" class="kpi-cell" :style="{'--accent': c.accent}">
        <DvDigitalFlop :config="c.config" class="kpi-flop" />
        <span class="kpi-label">{{ c.label }}</span>
      </div>
      <template #fallback>
        <div v-for="c in cards" :key="c.key" class="kpi-cell" :style="{'--accent': c.accent}">
          <span class="kpi-flop kpi-flop-static" :style="{color: c.accent}">{{ c.config.number[0] }}</span>
          <span class="kpi-label">{{ c.label }}</span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.kpi-flops {display: flex; flex-wrap: wrap; gap: 10px; width: 100%; height: 100%; box-sizing: border-box; align-items: stretch;}
.kpi-cell {flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 8px; border: 1px solid color-mix(in srgb, var(--accent) 32%, transparent); border-radius: var(--dc3d-radius); background: var(--dc3d-panel-bg); box-shadow: inset 0 0 12px color-mix(in srgb, var(--accent) 8%, transparent); overflow: hidden;}
.kpi-flop {width: 100%; height: 38px; flex-shrink: 0;}
.kpi-flop-static {font-family: var(--dc3d-mono); font-size: 28px; font-weight: 700; line-height: 42px; text-align: center;}
.kpi-label {font-size: 12px; letter-spacing: 0.5px; color: var(--dc3d-text-dim); text-align: center; white-space: nowrap;}
@media (max-width: 900px) {.kpi-cell {flex-basis: calc(33.333% - 10px);}}
@media (max-width: 560px) {.kpi-cell {flex-basis: calc(50% - 10px);} .kpi-flop, .kpi-flop-static {height: 36px; line-height: 36px; font-size: 22px;}}
</style>
