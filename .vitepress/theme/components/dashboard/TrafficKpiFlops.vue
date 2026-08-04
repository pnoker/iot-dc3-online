<script setup lang="ts">
/**
 * 交通顶部数字翻牌 KPI 组:DvDigitalFlop ×6 横排。
 * TPI(0-10)/平均车速/在网车辆/当班事件/平均饱和度V/C/响应时延。
 * 每路 useDomainSeries 独立驱动,config computed 依赖 current 自动重渲。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const CYAN = '#00e5ff', GREEN = '#00e676', AMBER = '#ffb020', PURPLE = '#b980ff', RED = '#ff5252'

interface Kpi {
  key: string; label: string; content: string; fill: string
  toFixed: number; baseline: number; unit: string
  cycle: (t: number) => number; cycleAmp: number; noiseAmp: number
  trend?: (t: number) => number; seed: number
}
// TPI=5.6(中度拥堵基线,小 cycleAmp 防 overflow);V/C=0.82;车速/事件/在网车/时延各自合理区间。
const KPIS: Kpi[] = [
  {key: 'tpi', label: t('拥堵指数 TPI', 'TPI'), content: '{nt}', fill: AMBER, toFixed: 1, baseline: 5.6, unit: '', cycle: (s) => Math.sin(s / 95), cycleAmp: 0.12, noiseAmp: 0.18, seed: 11},
  {key: 'speed', label: t('平均车速', 'Avg Speed'), content: '{nt} km/h', fill: CYAN, toFixed: 0, baseline: 38, unit: 'km/h', cycle: (s) => Math.sin(s / 80 + 1.1), cycleAmp: 0.08, noiseAmp: 1.4, seed: 22},
  {key: 'fleet', label: t('在网车辆', 'Vehicles Online'), content: '{nt}', fill: GREEN, toFixed: 0, baseline: 18400, unit: '辆', trend: (tt) => tt * 2.5, cycle: (s) => Math.sin(s / 70 + 2.2), cycleAmp: 0.01, noiseAmp: 30, seed: 33},
  {key: 'events', label: t('当班事件', 'Shift Events'), content: '{nt} 起', fill: RED, toFixed: 0, baseline: 26, unit: '起', cycle: (s) => Math.sin(s / 110 + 0.5), cycleAmp: 0.06, noiseAmp: 0.7, seed: 44},
  {key: 'vc', label: t('平均饱和度', 'Avg V/C'), content: '{nt}', fill: PURPLE, toFixed: 2, baseline: 0.82, unit: '', cycle: (s) => Math.sin(s / 90 + 3.0), cycleAmp: 0.06, noiseAmp: 0.012, seed: 55},
  {key: 'resp', label: t('响应时延', 'Response Latency'), content: '{nt} s', fill: CYAN, toFixed: 1, baseline: 4.2, unit: 's', cycle: (s) => Math.sin(s / 100 + 1.7), cycleAmp: 0.1, noiseAmp: 0.2, seed: 66},
]

const flops = KPIS.map((k) => ({
  spec: k,
  current: useDomainSeries({baseline: k.baseline, unit: k.unit, cycle: k.cycle, cycleAmp: k.cycleAmp, noiseAmp: k.noiseAmp, trend: k.trend}, {seed: k.seed, window: 2}).current,
}))

// 翻牌 config:整数量四舍五入;TPI/V/C/时延保留小数(toFixed)。
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
const accessibleTitle = computed(() => t('交通关键指标数字翻牌组', 'Traffic key metrics digital flop group'))
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
