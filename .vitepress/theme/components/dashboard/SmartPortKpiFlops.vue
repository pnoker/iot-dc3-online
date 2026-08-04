<script setup lang="ts">
/**
 * 智慧港口顶部数字翻牌 KPI 组:DvDigitalFlop ×6。
 * 岸桥 moves/h / 泊位占用% / 翻箱率% / 闸口 TEU/h / 在泊时间 h / 吞吐 TEU/d。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const CYAN = '#00e5ff'
const GREEN = '#00e676'
const AMBER = '#ffb020'
const PURPLE = '#b980ff'

// 岸桥 moves/h(STS 单机效率,业内 25-30 为高效)
const moves = useDomainSeries(
  {baseline: 27.5, unit: 'moves/h', cycle: (s) => Math.sin(s / 110), cycleAmp: 0.08, noiseAmp: 0.6},
  {seed: 11, window: 2},
).current
// 泊位占用率%(百分比业务区间,小 cycleAmp 防 overflow)
const berthOcc = useDomainSeries(
  {baseline: 84, unit: '%', cycle: (s) => Math.sin(s / 150 + 1), cycleAmp: 0.04, noiseAmp: 0.5},
  {seed: 22, window: 2},
).current
// 翻箱率 rehandle%(低为优,3-4% 区间)
const rehandle = useDomainSeries(
  {baseline: 3.4, unit: '%', cycle: (s) => Math.sin(s / 170 + 2), cycleAmp: 0.06, noiseAmp: 0.08},
  {seed: 33, window: 2},
).current
// 闸口 TEU/h(每小时通过箱量)
const gateTeu = useDomainSeries(
  {baseline: 146, unit: 'TEU/h', cycle: (s) => Math.sin(s / 95 + 0.5), cycleAmp: 0.12, noiseAmp: 4},
  {seed: 44, window: 2},
).current
// 在泊时间 h(单船平均,18-20h)
const berthTime = useDomainSeries(
  {baseline: 18.6, unit: 'h', cycle: (s) => Math.sin(s / 130 + 2.4), cycleAmp: 0.05, noiseAmp: 0.3},
  {seed: 55, window: 2},
).current
// 吞吐 TEU/d(累计,单调缓增)
const teu = useDomainSeries(
  {
    baseline: 8240,
    unit: 'TEU',
    trend: (time) => time * 1.6,
    cycle: (s) => Math.sin(s / 200),
    cycleAmp: 0.008,
    noiseAmp: 6,
  },
  {seed: 66, window: 2},
).current

const clampPct = (v: number) => Math.max(0, Math.min(100, v))

const cards = computed(() => [
  {
    key: 'moves',
    label: t('岸桥 moves/h', 'STS Moves/h'),
    config: {number: [Math.max(0, +moves.value.toFixed(1))], content: '{nt}', toFixed: 1, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: CYAN}},
    accent: CYAN,
  },
  {
    key: 'berth',
    label: t('泊位占用', 'Berth Occupancy'),
    config: {number: [Math.round(clampPct(berthOcc.value))], content: '{nt} %', toFixed: 0, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: GREEN}},
    accent: GREEN,
  },
  {
    key: 'rehandle',
    label: t('翻箱率', 'Rehandle Rate'),
    config: {number: [+rehandle.value.toFixed(2)], content: '{nt} %', toFixed: 2, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: AMBER}},
    accent: AMBER,
  },
  {
    key: 'gate',
    label: t('闸口 TEU/h', 'Gate TEU/h'),
    config: {number: [Math.max(0, Math.round(gateTeu.value))], content: '{nt}', toFixed: 0, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: PURPLE}},
    accent: PURPLE,
  },
  {
    key: 'time',
    label: t('在泊时间', 'Berth Time'),
    config: {number: [Math.max(0, +berthTime.value.toFixed(1))], content: '{nt} h', toFixed: 1, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: CYAN}},
    accent: CYAN,
  },
  {
    key: 'teu',
    label: t('吞吐 TEU/d', 'Throughput TEU/d'),
    config: {number: [Math.max(0, Math.round(teu.value))], content: '{nt}', toFixed: 0, animationCurve: 'easeOutCubic' as const, style: {fontSize: 30, fill: GREEN}},
    accent: GREEN,
  },
])

const accessibleTitle = computed(() => t('智慧港口核心指标数字翻牌组', 'Smart port key metrics digital flop group'))
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
