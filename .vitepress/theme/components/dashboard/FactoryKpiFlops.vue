<script setup lang="ts">
/**
 * 工厂顶部数字翻牌 KPI 组:DvDigitalFlop ×6 横排。
 * 每路 useDomainSeries 独立驱动(缓周期 + 微噪声),computed config 依赖 current 值变自动重渲。
 * DataV 组件 client-only,<ClientOnly> 包裹 + fallback(SSR 隔离 + 降级)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 霓虹色循环:青 / 绿 / 琥珀 / 紫。
const CYAN = '#00e5ff'
const GREEN = '#00e676'
const AMBER = '#ffb020'
const PURPLE = '#b980ff'

interface KpiSpec {
  key: string
  label: string
  content: string // DigitalFlop 模板,{nt} 为数值占位
  fill: string
  toFixed?: number
  baseline: number
  unit: string
  cycle: (t: number) => number
  cycleAmp: number
  noiseAmp: number
  trend?: (t: number) => number
  seed: number
}

// 6 路合理 baseline:产量缓增 / WIP / 订单 / 能耗 / CO₂减排 / 在线设备。
const KPIS: KpiSpec[] = [
  {
    key: 'output',
    label: t('今日累计产量', "Today's Output"),
    content: '{nt} 件',
    fill: CYAN,
    baseline: 8000,
    unit: '件',
    // 累计量:缓增 trend(约 +6/s)+ 轻微周期波动,单调向上更真实。
    trend: (time) => time * 6,
    cycle: (time) => Math.sin(time / 90),
    cycleAmp: 0.01,
    noiseAmp: 4,
    seed: 101,
  },
  {
    key: 'wip',
    label: t('在制品 WIP', 'WIP'),
    content: '{nt} 件',
    fill: GREEN,
    baseline: 320,
    unit: '件',
    cycle: (time) => Math.sin(time / 70 + 1.3),
    cycleAmp: 0.06,
    noiseAmp: 1.6,
    seed: 202,
  },
  {
    key: 'orders',
    label: t('当班订单', 'Shift Orders'),
    content: '{nt} 单',
    fill: AMBER,
    baseline: 156,
    unit: '单',
    cycle: (time) => Math.sin(time / 110 + 0.6),
    cycleAmp: 0.05,
    noiseAmp: 0.8,
    seed: 303,
  },
  {
    key: 'energy',
    label: t('能耗', 'Energy'),
    content: '{nt} kWh',
    fill: PURPLE,
    baseline: 1240,
    unit: 'kWh',
    cycle: (time) => Math.sin(time / 80 + 2.1),
    cycleAmp: 0.05,
    noiseAmp: 5,
    seed: 404,
  },
  {
    key: 'co2',
    label: t('CO₂ 减排', 'CO₂ Saved'),
    content: '{nt} kg',
    fill: CYAN,
    baseline: 680,
    unit: 'kg',
    cycle: (time) => Math.sin(time / 100 + 0.9),
    cycleAmp: 0.04,
    noiseAmp: 3,
    seed: 505,
  },
  {
    key: 'online',
    label: t('在线设备', 'Online Devices'),
    content: '{nt} 台',
    fill: GREEN,
    baseline: 48,
    unit: '台',
    // 设备在线数几乎恒定,极小波动。
    cycle: (time) => Math.sin(time / 150 + 1.7),
    cycleAmp: 0.02,
    noiseAmp: 0.4,
    seed: 606,
  },
]

// 每路只取 current(window:2 省内存),乘性缓周期 + 微噪声。
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

// 翻牌 config 依赖 current,值变自动重渲。整数四舍五入(件/单/台/kWh/kg 均为整数量)。
const cards = computed(() =>
  flops.map(({spec, current}) => ({
    key: spec.key,
    label: spec.label,
    config: {
      number: [Math.round(current.value)],
      content: spec.content,
      toFixed: 0,
      animationCurve: 'easeOutCubic' as const,
      style: {fontSize: 30, fill: spec.fill},
    },
    accent: spec.fill,
  })),
)

const accessibleTitle = computed(() =>
  t('工厂关键指标数字翻牌组', 'Factory key metrics digital flop group'),
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
      <!-- SSR/降级 fallback:无 DataV 时用静态数值 -->
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
/* 窄屏:3 列 → 2 列 */
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
