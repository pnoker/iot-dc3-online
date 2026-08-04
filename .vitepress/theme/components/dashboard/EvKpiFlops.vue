<script setup lang="ts">
/**
 * 充电网络顶部数字翻牌 KPI 组:DvDigitalFlop ×6。
 * 在线率 / 桩位利用率 / 实时充电功率(MW) / 今日订单 / 平均周转 / 台区负载率。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const CYAN = '#00e5ff'
const GREEN = '#00e676'
const AMBER = '#ffb020'
const PURPLE = '#b980ff'
const BLUE = '#2b9bff'

// 在线率:网络级,稳定高位(90-98%)
const online = useDomainSeries(
  {baseline: 94.2, unit: '%', cycle: (s) => Math.sin(s / 140), cycleAmp: 0.03, noiseAmp: 0.4},
  {seed: 71, window: 2},
).current
// 桩位利用率:充电桩日均利用率偏低(10-40%)
const util = useDomainSeries(
  {baseline: 36.8, unit: '%', cycle: (s) => Math.sin(s / 110 + 1.1), cycleAmp: 0.06, noiseAmp: 0.5},
  {seed: 72, window: 2},
).current
// 实时充电功率(全网 MW)
const power = useDomainSeries(
  {baseline: 3.24, unit: 'MW', cycle: (s) => Math.sin(s / 95 + 2.2), cycleAmp: 0.14, noiseAmp: 0.05},
  {seed: 73, window: 2},
).current
// 今日订单数:累计单调增
const orders = useDomainSeries(
  {baseline: 1284, unit: 'order', trend: (time) => time * 1.8, cycle: (s) => Math.sin(s / 200), cycleAmp: 0.01, noiseAmp: 2},
  {seed: 74, window: 2},
).current
// 平均周转时长 min(单次充电+占位)
const turnover = useDomainSeries(
  {baseline: 42, unit: 'min', cycle: (s) => Math.sin(s / 130 + 3.3), cycleAmp: 0.08, noiseAmp: 0.6},
  {seed: 75, window: 2},
).current
// 台区配变负载率(主导热模型告警)
const txLoad = useDomainSeries(
  {baseline: 78, unit: '%', cycle: (s) => Math.sin(s / 100 + 4.4), cycleAmp: 0.05, noiseAmp: 0.6},
  {seed: 76, window: 2},
).current

const clampPct = (v: number) => Math.max(0, Math.min(100, v))

const cards = computed(() => [
  {key: 'online', label: t('充电桩在线率', 'Charger Online'), config: {number: [clampPct(online.value)], content: '{nt} %', toFixed: 1, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: GREEN}}, accent: GREEN},
  {key: 'util', label: t('桩位利用率', 'Utilization'), config: {number: [clampPct(util.value)], content: '{nt} %', toFixed: 1, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: CYAN}}, accent: CYAN},
  {key: 'power', label: t('实时充电功率', 'Live Power'), config: {number: [Math.max(0, power.value)], content: '{nt} MW', toFixed: 2, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: PURPLE}}, accent: PURPLE},
  {key: 'orders', label: t('今日订单', "Today's Orders"), config: {number: [Math.max(0, Math.round(orders.value))], content: '{nt}', toFixed: 0, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: AMBER}}, accent: AMBER},
  {key: 'turnover', label: t('平均周转时长', 'Avg Turnover'), config: {number: [Math.max(0, Math.round(turnover.value))], content: '{nt} min', toFixed: 0, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: BLUE}}, accent: BLUE},
  {key: 'txload', label: t('台区负载率', 'Transformer Load'), config: {number: [clampPct(txLoad.value)], content: '{nt} %', toFixed: 1, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: GREEN}}, accent: GREEN},
])

const accessibleTitle = computed(() => t('充电网络核心指标数字翻牌组', 'EV charging key metrics digital flop group'))
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
