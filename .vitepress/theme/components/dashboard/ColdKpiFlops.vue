<script setup lang="ts">
/**
 * 冷链顶部数字翻牌 KPI 组:DvDigitalFlop ×6 横排。
 * 温控合规率% / 断链累计时长 min / 在途车次 / 库容利用率% / 货损率‰ / 能耗 kWh·t⁻¹·24h⁻¹。
 * 每路 useDomainSeries 独立驱动;百分比类用小 cycleAmp,clamp 业务区间绝不 overflow。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const CYAN = '#00e5ff'
const GREEN = '#00e676'
const AMBER = '#ffb020'
const PURPLE = '#b980ff'
const RED = '#ff6b6b'
const BLUE = '#2b9bff'

interface KpiSpec {
  key: string
  label: string
  content: string
  fill: string
  baseline: number
  unit: string
  cycle: (t: number) => number
  cycleAmp: number
  noiseAmp: number
  trend?: (t: number) => number
  seed: number
  round: boolean
  clampPct?: boolean
}

const KPIS: KpiSpec[] = [
  {
    key: 'comply',
    label: t('温控合规率', 'Compliance'),
    content: '{nt} %',
    fill: CYAN,
    baseline: 96.8,
    unit: '%',
    cycle: (time) => Math.sin(time / 95),
    cycleAmp: 0.012,
    noiseAmp: 0.14,
    seed: 1101,
    round: false,
    clampPct: true,
  },
  {
    key: 'break',
    label: t('断链时长', 'Break Time'),
    content: '{nt} min',
    fill: RED,
    baseline: 14.2,
    unit: 'min',
    cycle: (time) => Math.sin(time / 80 + 1.3),
    cycleAmp: 0.06,
    noiseAmp: 0.5,
    trend: (time) => time * 0.04,
    seed: 1202,
    round: true,
  },
  {
    key: 'trips',
    label: t('在途车次', 'Active Trips'),
    content: '{nt}',
    fill: BLUE,
    baseline: 142,
    unit: '',
    cycle: (time) => Math.sin(time / 120 + 0.6),
    cycleAmp: 0.04,
    noiseAmp: 1.2,
    seed: 1303,
    round: true,
  },
  {
    key: 'storage',
    label: t('库容利用率', 'Storage Use'),
    content: '{nt} %',
    fill: AMBER,
    baseline: 78.4,
    unit: '%',
    cycle: (time) => Math.sin(time / 140 + 2.1),
    cycleAmp: 0.04,
    noiseAmp: 0.4,
    seed: 1404,
    round: false,
    clampPct: true,
  },
  {
    key: 'loss',
    label: t('货损率', 'Cargo Loss'),
    content: '{nt} ‰',
    fill: PURPLE,
    baseline: 3.6,
    unit: '‰',
    cycle: (time) => Math.sin(time / 100 + 0.9),
    cycleAmp: 0.05,
    noiseAmp: 0.06,
    seed: 1505,
    round: false,
  },
  {
    key: 'energy',
    label: t('能耗 kWh/t', 'Energy kWh/t'),
    content: '{nt}',
    fill: GREEN,
    baseline: 18.6,
    unit: 'kWh/t',
    cycle: (time) => Math.sin(time / 150 + 1.7),
    cycleAmp: 0.04,
    noiseAmp: 0.18,
    seed: 1606,
    round: false,
  },
]

const flops = KPIS.map((k) => ({
  spec: k,
  current: useDomainSeries(
    {
      baseline: k.baseline,
      unit: k.unit,
      cycle: k.cycle,
      cycleAmp: k.cycleAmp,
      noiseAmp: k.noiseAmp,
      trend: k.trend,
    },
    {seed: k.seed, window: 2},
  ).current,
}))

const cards = computed(() =>
  flops.map(({spec, current}) => {
    const raw = current.value
    const v = spec.clampPct ? Math.max(0, Math.min(100, raw)) : Math.max(0, raw)
    const num = spec.round ? Math.round(v) : +v.toFixed(1)
    return {
      key: spec.key,
      label: spec.label,
      config: {
        number: [num],
        content: spec.content,
        toFixed: spec.round ? 0 : 1,
        animationCurve: 'easeOutCubic' as const,
        style: {fontSize: 30, fill: spec.fill},
      },
      accent: spec.fill,
    }
  }),
)

const accessibleTitle = computed(() =>
  t('冷链核心指标数字翻牌组', 'Cold-chain key metrics digital flop group'),
)
</script>

<template>
  <div class="kpi-flops" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div
        v-for="c in cards"
        :key="c.key"
        class="kpi-cell"
        :style="{ '--accent': c.accent }"
      >
        <DvDigitalFlop :config="c.config" class="kpi-flop" />
        <span class="kpi-label">{{ c.label }}</span>
      </div>
      <template #fallback>
        <div
          v-for="c in cards"
          :key="c.key"
          class="kpi-cell"
          :style="{ '--accent': c.accent }"
        >
          <span class="kpi-flop kpi-flop-static" :style="{ color: c.accent }">
            {{ c.config.number[0] }}
          </span>
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
  padding: 8px 8px;
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
  .kpi-cell {
    flex-basis: calc(33.333% - 10px);
  }
}
@media (max-width: 560px) {
  .kpi-cell {
    flex-basis: calc(50% - 10px);
  }
  .kpi-flop,
  .kpi-flop-static {
    height: 36px;
    line-height: 36px;
    font-size: 24px;
  }
}
</style>
