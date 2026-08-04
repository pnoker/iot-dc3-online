<script setup lang="ts">
/**
 * 精准农业顶部数字翻牌 KPI 组:DvDigitalFlop ×6 横排。
 * 棚温 / 土壤 VWC / PAR 累积(DLI) / ET₀ / WUE / 系统在线率。
 * 每路 useDomainSeries 独立驱动(缓周期 + 微噪声),computed config 依赖 current 重渲。
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
  toFixed: number
  baseline: number
  unit: string
  cycle: (t: number) => number
  cycleAmp: number
  noiseAmp: number
  trend?: (t: number) => number
  clamp?: [number, number] // 业务区间钳制,百分比类防 overflow
  seed: number
}

// 6 路合理 baseline:棚温 22-26℃ / VWC 28% 适墒 / DLI 累积 / ET₀ 4mm / WUE 12 / 在线率 96%
const KPIS: KpiSpec[] = [
  {
    key: 'temp',
    label: t('冠层温度', 'Canopy Temp'),
    content: '{nt} ℃',
    fill: CYAN,
    toFixed: 1,
    baseline: 24.2,
    unit: '℃',
    cycle: (time) => Math.sin(time / 110),
    cycleAmp: 0.05,
    noiseAmp: 0.18,
    clamp: [16, 34],
    seed: 111,
  },
  {
    key: 'vwc',
    label: t('土壤 VWC', 'Soil VWC'),
    content: '{nt} %',
    fill: GREEN,
    toFixed: 1,
    baseline: 28.6,
    unit: '%',
    cycle: (time) => Math.sin(time / 95 + 1.4),
    cycleAmp: 0.06,
    noiseAmp: 0.3,
    clamp: [8, 42],
    seed: 222,
  },
  {
    key: 'dli',
    label: t('PAR 累积 DLI', 'Cumulative DLI'),
    content: '{nt} mol',
    fill: AMBER,
    toFixed: 1,
    baseline: 4,
    unit: 'mol·m⁻²',
    // 日累积量:随光照缓增(约 +0.05/s),昼升夜止,单调向上更真实
    trend: (time) => time * 0.05,
    cycle: (time) => Math.sin(time / 140 + 0.6),
    cycleAmp: 0.02,
    noiseAmp: 0.08,
    clamp: [0, 25],
    seed: 333,
  },
  {
    key: 'et0',
    label: t('参考蒸散 ET₀', 'Reference ET₀'),
    content: '{nt} mm',
    fill: PURPLE,
    toFixed: 2,
    baseline: 4.2,
    unit: 'mm/d',
    cycle: (time) => Math.sin(time / 130 + 2.1),
    cycleAmp: 0.04,
    noiseAmp: 0.06,
    clamp: [0.5, 9],
    seed: 444,
  },
  {
    key: 'wue',
    label: t('水分利用率 WUE', 'Water Use Eff.'),
    content: '{nt}',
    fill: CYAN,
    toFixed: 1,
    baseline: 12.4,
    unit: 'kg/m³',
    cycle: (time) => Math.sin(time / 160 + 3.3),
    cycleAmp: 0.03,
    noiseAmp: 0.14,
    clamp: [4, 22],
    seed: 555,
  },
  {
    key: 'online',
    label: t('系统在线率', 'System Uptime'),
    content: '{nt} %',
    fill: GREEN,
    toFixed: 1,
    baseline: 96.8,
    unit: '%',
    cycle: (time) => Math.sin(time / 180 + 4.5),
    cycleAmp: 0.01,
    noiseAmp: 0.1,
    clamp: [90, 100],
    seed: 666,
  },
]

const flops = KPIS.map((k) => {
  const {current} = useDomainSeries(
    {
      baseline: k.baseline,
      unit: k.unit,
      cycle: k.cycle,
      cycleAmp: k.cycleAmp,
      noiseAmp: k.noiseAmp,
      trend: k.trend,
    },
    {seed: k.seed, window: 2},
  )
  return {spec: k, current}
})

// 翻牌 config 依赖 current,值变自动重渲。按 toFixed 控制小数位 + 业务区间钳制。
const cards = computed(() =>
  flops.map(({spec, current}) => {
    const raw = current.value
    const v = spec.clamp ? Math.max(spec.clamp[0], Math.min(spec.clamp[1], raw)) : raw
    const num = Number(v.toFixed(spec.toFixed))
    return {
      key: spec.key,
      label: spec.label,
      accent: spec.fill,
      config: {
        number: [num],
        content: spec.content,
        toFixed: spec.toFixed,
        animationCurve: 'easeOutCubic' as const,
        style: {fontSize: 28, fill: spec.fill},
      },
      display: num.toFixed(spec.toFixed),
    }
  }),
)

const accessibleTitle = computed(() =>
  t('精准农业关键指标数字翻牌组', 'Precision-agriculture key metrics digital flop group'),
)
</script>

<template>
  <div class="kpi-flops" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div v-for="c in cards" :key="c.key" class="kpi-cell" :style="{'--accent': c.accent}">
        <DvDigitalFlop :config="c.config" class="kpi-flop" />
        <span class="kpi-label">{{ c.label }}</span>
      </div>
      <!-- SSR/降级 fallback:无 DataV 时用静态数值 -->
      <template #fallback>
        <div v-for="c in cards" :key="c.key" class="kpi-cell" :style="{'--accent': c.accent}">
          <span class="kpi-flop kpi-flop-static" :style="{color: c.accent}">{{ c.display }}</span>
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
  font-size: 28px;
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
    font-size: 22px;
  }
}
</style>
