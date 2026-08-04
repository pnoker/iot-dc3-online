<script setup lang="ts">
/**
 * 环保顶部数字翻牌 KPI 组:DvDigitalFlop ×6 横排。
 * AQI(0-500 空气质量指数)/ PM2.5(μg/m³)/ 水质指数 WQI / CEMS 达标率 / 站点在线率 / 优良天(累计)。
 * 每路 useDomainSeries 独立驱动;百分比类用小 cycleAmp,clamp 业务区间绝不 overflow。
 * AQI 按 GB 3095 等级着色(优绿/良黄绿/轻度橙/中度红)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const GREEN = '#00e676'
const LIME = '#a8e063'
const AMBER = '#ffa726'
const ORANGE = '#ff7043'
const RED = '#ff6b6b'
const CYAN = '#00e5ff'
const PURPLE = '#b980ff'
const BLUE = '#2b9bff'

// AQI 等级配色(GB 3095):≤50 优、51-100 良、101-150 轻度、151-200 中度、>200 重度。
function aqiColor(v: number): string {
  if (v <= 50) return GREEN
  if (v <= 100) return LIME
  if (v <= 150) return AMBER
  if (v <= 200) return ORANGE
  return RED
}

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
  dynamic?: 'aqi'
}

// 6 路合理 baseline(AQI 良-轻度区间、PM2.5 接近二级限、WQI Ⅲ类左右、达标率高位、优良天累计)。
const KPIS: KpiSpec[] = [
  {
    key: 'aqi',
    label: t('空气质量 AQI', 'Air Quality AQI'),
    content: '{nt}',
    fill: AMBER,
    baseline: 92,
    unit: '',
    cycle: (time) => Math.sin(time / 95),
    cycleAmp: 0.18,
    noiseAmp: 2.4,
    seed: 101,
    round: true,
    dynamic: 'aqi',
  },
  {
    key: 'pm25',
    label: t('PM2.5', 'PM2.5'),
    content: '{nt} μg/m³',
    fill: CYAN,
    baseline: 46,
    unit: 'μg/m³',
    cycle: (time) => Math.sin(time / 80 + 1.3),
    cycleAmp: 0.14,
    noiseAmp: 1.1,
    seed: 202,
    round: false,
  },
  {
    key: 'wqi',
    label: t('水质指数 WQI', 'Water Quality WQI'),
    content: '{nt}',
    fill: GREEN,
    baseline: 76.4,
    unit: '',
    cycle: (time) => Math.sin(time / 130 + 2.1),
    cycleAmp: 0.05,
    noiseAmp: 0.6,
    seed: 303,
    round: false,
  },
  {
    key: 'cems',
    label: t('CEMS 达标率', 'CEMS Compliance'),
    content: '{nt} %',
    fill: PURPLE,
    baseline: 94.6,
    unit: '%',
    cycle: (time) => Math.sin(time / 140 + 0.6),
    cycleAmp: 0.012,
    noiseAmp: 0.16,
    seed: 404,
    round: false,
    clampPct: true,
  },
  {
    key: 'online',
    label: t('站点在线率', 'Station Online'),
    content: '{nt} %',
    fill: BLUE,
    baseline: 97.8,
    unit: '%',
    cycle: (time) => Math.sin(time / 160 + 2.8),
    cycleAmp: 0.005,
    noiseAmp: 0.1,
    seed: 505,
    round: false,
    clampPct: true,
  },
  {
    key: 'goodDays',
    label: t('优良天(累计)', 'Good Days (YTD)'),
    content: '{nt} 天',
    fill: LIME,
    baseline: 214,
    unit: '天',
    // 累计量:日内缓慢递增(每日约 +0.9 天的等效累计节奏模拟)。
    trend: (time) => time * 0.05,
    cycle: (time) => Math.sin(time / 200 + 0.9),
    cycleAmp: 0.004,
    noiseAmp: 0.04,
    seed: 606,
    round: true,
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
    const v =
      spec.clampPct || spec.dynamic === 'aqi'
        ? spec.dynamic === 'aqi'
          ? Math.max(0, Math.min(300, raw))
          : Math.max(0, Math.min(100, raw))
        : Math.max(0, raw)
    const num = spec.round ? Math.round(v) : +v.toFixed(1)
    // AQI 翻牌按当前值动态换色(等级感)。
    const fill = spec.dynamic === 'aqi' ? aqiColor(v) : spec.fill
    return {
      key: spec.key,
      label: spec.label,
      config: {
        number: [num],
        content: spec.content,
        toFixed: spec.round ? 0 : 1,
        animationCurve: 'easeOutCubic' as const,
        style: {fontSize: 30, fill},
      },
      accent: fill,
    }
  }),
)

const accessibleTitle = computed(() =>
  t('环保核心指标数字翻牌组', 'Environmental key metrics digital flop group'),
)
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
          <span class="kpi-flop kpi-flop-static" :style="{color: c.accent}">
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
