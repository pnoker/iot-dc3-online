<script setup lang="ts">
/**
 * 楼宇顶部数字翻牌 KPI 组:DvDigitalFlop ×6 横排。
 * EUI / 今日总能耗 / 在线人数 / 平均 CO₂ / 室温达标率 / 安防闭环率。
 * 每路 useDomainSeries 独立驱动(缓周期 + 微噪声),computed config 依赖 current 自动重渲。
 * DataV 组件 client-only,<ClientOnly> 包裹 + fallback(SSR 隔离 + 降级)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const CYAN = '#00e5ff'
const GREEN = '#00e676'
const AMBER = '#ffb020'
const PURPLE = '#b980ff'

interface KpiSpec {
  key: string
  label: string
  content: string
  fill: string
  toFixed: number
  baseline: number
  unit: string
  cycle: (t: number) => number
  cycleAmp: number
  noiseAmp: number
  trend?: (t: number) => number
  seed: number
}

// 6 路 BA 核心 baseline:EUI(办公楼 70-150)/ 总能耗(累计)/ 在线人数 / CO₂(舒适 400-800ppm)/ 室温达标率 / 安防闭环率。
const KPIS: KpiSpec[] = [
  {
    key: 'eui',
    label: t('EUI 能耗强度', 'EUI Intensity'),
    content: '{nt}',
    fill: CYAN,
    toFixed: 1,
    baseline: 98.6, // kWh/m²·a 办公楼典型
    unit: 'kWh/m²·a',
    cycle: (time) => Math.sin(time / 120),
    cycleAmp: 0.004,
    noiseAmp: 0.05,
    seed: 101,
  },
  {
    key: 'energy',
    label: t('今日总能耗', "Today's Energy"),
    content: '{nt} kWh',
    fill: PURPLE,
    toFixed: 0,
    baseline: 12400,
    unit: 'kWh',
    trend: (time) => time * 9, // 累计量缓增
    cycle: (time) => Math.sin(time / 90 + 2.1),
    cycleAmp: 0.01,
    noiseAmp: 6,
    seed: 404,
  },
  {
    key: 'occupancy',
    label: t('在线人数', 'Occupancy'),
    content: '{nt} 人',
    fill: GREEN,
    toFixed: 0,
    baseline: 326,
    unit: '人',
    cycle: (time) => Math.sin(time / 70 + 1.3),
    cycleAmp: 0.05,
    noiseAmp: 1.6,
    seed: 202,
  },
  {
    key: 'co2',
    label: t('平均 CO₂', 'Avg CO₂'),
    content: '{nt} ppm',
    fill: AMBER,
    toFixed: 0,
    baseline: 580,
    unit: 'ppm',
    cycle: (time) => Math.sin(time / 110 + 0.6),
    cycleAmp: 0.04,
    noiseAmp: 6,
    seed: 303,
  },
  {
    key: 'compliance',
    label: t('室温达标率', 'Temp Compliance'),
    content: '{nt} %',
    fill: CYAN,
    toFixed: 0,
    baseline: 92,
    unit: '%',
    cycle: (time) => Math.sin(time / 140 + 0.9),
    cycleAmp: 0.03,
    noiseAmp: 0.5,
    seed: 505,
  },
  {
    key: 'security',
    label: t('安防闭环率', 'Security Closure'),
    content: '{nt} %',
    fill: GREEN,
    toFixed: 1,
    baseline: 99.2,
    unit: '%',
    cycle: (time) => Math.sin(time / 150 + 1.7),
    cycleAmp: 0.004,
    noiseAmp: 0.06,
    seed: 606,
  },
]

const flops = KPIS.map((k) => ({
  spec: k,
  current: useDomainSeries(
    {baseline: k.baseline, unit: k.unit, cycle: k.cycle, cycleAmp: k.cycleAmp, noiseAmp: k.noiseAmp, trend: k.trend},
    {seed: k.seed, window: 2},
  ).current,
}))

const cards = computed(() =>
  flops.map(({spec, current}) => {
    const raw = current.value
    const val = spec.toFixed === 0 ? Math.round(raw) : +raw.toFixed(spec.toFixed)
    return {
      key: spec.key,
      label: spec.label,
      config: {
        number: [val],
        content: spec.content,
        toFixed: spec.toFixed,
        animationCurve: 'easeOutCubic' as const,
        style: {fontSize: 30, fill: spec.fill},
      },
      accent: spec.fill,
    }
  }),
)

const accessibleTitle = computed(() => t('楼宇关键指标数字翻牌组', 'Building key metrics digital flop group'))
</script>

<template>
  <div class="kpi-flops" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div
        v-for="c in cards"
        :key="c.key"
        class="kpi-cell"
        :style="{'--accent': c.accent}"
      >
        <DvDigitalFlop :config="c.config" class="kpi-flop" />
        <span class="kpi-label">{{ c.label }}</span>
      </div>
      <template #fallback>
        <div
          v-for="c in cards"
          :key="c.key"
          class="kpi-cell"
          :style="{'--accent': c.accent}"
        >
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
  font-family: var(--dc3d-mono, monospace);
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
