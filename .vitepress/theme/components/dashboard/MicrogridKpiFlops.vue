<script setup lang="ts">
/**
 * 微电网顶部数字翻牌 KPI 组:DvDigitalFlop ×6。
 * 光伏出力 / SOC / 净并网(售电为负) / 负荷 / 绿电占比 / 减碳。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const CYAN = '#00e5ff'
const GREEN = '#00e676'
const AMBER = '#ffb020'
const PURPLE = '#b980ff'

// 光伏出力:正午基准,日内由 shape 在拓扑/平衡图体现;KPI 取瞬时缓变。
const pv = useDomainSeries(
  {baseline: 520, unit: 'kW', cycle: (s) => Math.sin(s / 120), cycleAmp: 0.14, noiseAmp: 14},
  {seed: 11, window: 2},
).current
// SOC:缓变,小幅度防溢出
const soc = useDomainSeries(
  {baseline: 68, unit: '%', cycle: (s) => Math.sin(s / 150 + 1), cycleAmp: 0.08, noiseAmp: 0.6},
  {seed: 22, window: 2},
).current
// 净并网功率:负=售电(上网),正=购电。基线售电 -60kW。
const net = useDomainSeries(
  {baseline: -60, unit: 'kW', cycle: (s) => Math.sin(s / 95 + 2), cycleAmp: 0.7, noiseAmp: 8},
  {seed: 33, window: 2},
).current
// 负荷
const load = useDomainSeries(
  {baseline: 620, unit: 'kW', cycle: (s) => Math.sin(s / 80 + 0.5), cycleAmp: 0.06, noiseAmp: 10},
  {seed: 44, window: 2},
).current
// 绿电占比:光伏自消纳 / 总用电,百分比区间
const green = useDomainSeries(
  {baseline: 76, unit: '%', cycle: (s) => Math.sin(s / 160 + 2.4), cycleAmp: 0.04, noiseAmp: 0.8},
  {seed: 55, window: 2},
).current
// 减碳:累计量,单调缓增
const co2 = useDomainSeries(
  {
    baseline: 2180,
    unit: 'kg',
    trend: (time) => time * 0.5,
    cycle: (s) => Math.sin(s / 200),
    cycleAmp: 0.01,
    noiseAmp: 3,
  },
  {seed: 66, window: 2},
).current

const clampPct = (v: number) => Math.max(0, Math.min(100, v))

const cards = computed(() => [
  {
    key: 'pv',
    label: t('光伏出力', 'PV Output'),
    config: {number: [Math.max(0, Math.round(pv.value))], content: '{nt} kW', toFixed: 0, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: CYAN}},
    accent: CYAN,
  },
  {
    key: 'soc',
    label: t('储能 SOC', 'Battery SOC'),
    config: {number: [Math.round(clampPct(soc.value))], content: '{nt} %', toFixed: 0, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: GREEN}},
    accent: GREEN,
  },
  {
    key: 'net',
    label: t('净并网', 'Net Grid'),
    config: {number: [Math.round(net.value)], content: '{nt} kW', toFixed: 0, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: AMBER}},
    accent: AMBER,
  },
  {
    key: 'load',
    label: t('负荷', 'Load'),
    config: {number: [Math.max(0, Math.round(load.value))], content: '{nt} kW', toFixed: 0, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: PURPLE}},
    accent: PURPLE,
  },
  {
    key: 'green',
    label: t('绿电占比', 'Green Rate'),
    config: {number: [clampPct(green.value)], content: '{nt} %', toFixed: 1, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: GREEN}},
    accent: GREEN,
  },
  {
    key: 'co2',
    label: t('CO₂ 减排', 'CO₂ Saved'),
    config: {number: [Math.max(0, Math.round(co2.value))], content: '{nt} kg', toFixed: 0, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: CYAN}},
    accent: CYAN,
  },
])

const accessibleTitle = computed(() => t('微电网核心指标数字翻牌组', 'Microgrid key metrics digital flop group'))
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
.kpi-flops {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  align-items: stretch;
}
.kpi-cell {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  border: 1px solid color-mix(in srgb, var(--accent) 32%, transparent);
  border-radius: var(--dc3d-radius);
  background: var(--dc3d-panel-bg);
  box-shadow: inset 0 0 12px color-mix(in srgb, var(--accent) 8%, transparent);
  overflow: hidden;
}
.kpi-flop {
  width: 100%;
  height: 38px;
  flex-shrink: 0;
}
.kpi-flop-static {
  font-family: var(--dc3d-mono);
  font-size: 30px;
  font-weight: 700;
  line-height: 42px;
  text-align: center;
}
.kpi-label {
  font-size: 12px;
  letter-spacing: 0.5px;
  color: var(--dc3d-text-dim);
  text-align: center;
  white-space: nowrap;
}
@media (max-width: 900px) {
  .kpi-cell { flex-basis: calc(33.333% - 10px); }
}
@media (max-width: 560px) {
  .kpi-cell { flex-basis: calc(50% - 10px); }
  .kpi-flop, .kpi-flop-static { height: 36px; line-height: 36px; font-size: 24px; }
}
</style>
