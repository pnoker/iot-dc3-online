<script setup lang="ts">
/**
 * 工厂达成率百分比条组 + 订单完成度胶囊图(DataV 子面板)。
 * 上半:DvPercentPond ×3(当班目标达成率/设备开机率/计划完成率)。
 * 下半:DvCapsuleChart(各车间订单完成度排行)。
 * 数据用 useDomainSeries 五因子实时驱动,computed config 依赖 current 值变自动重渲。
 * DataV 组件 client-only,<ClientOnly> 包裹 + fallback 防 SSR hydration 抖动。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

/** 百分比钳制在 0–100 业务区间,杜绝 mock 值飙到几百%。 */
const pct = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

// 三路达成率:baseline 稳定在业务区间,小 cycleAmp + 小噪声,缓慢真实漂移。
const targetRate = useDomainSeries(
  {baseline: 78, unit: '%', cycle: (s) => Math.sin(s / 140), cycleAmp: 0.04, noiseAmp: 0.6},
  {seed: 71, window: 2},
).current
const uptimeRate = useDomainSeries(
  {baseline: 88, unit: '%', cycle: (s) => Math.sin(s / 160 + 1.2), cycleAmp: 0.03, noiseAmp: 0.5},
  {seed: 72, window: 2},
).current
const planRate = useDomainSeries(
  {baseline: 92, unit: '%', cycle: (s) => Math.sin(s / 180 + 2.4), cycleAmp: 0.025, noiseAmp: 0.4},
  {seed: 73, window: 2},
).current

// 五车间订单完成度:各自基准 + 错相慢周期,避免同步漂移显得假。
interface Ws {
  zh: string
  en: string
  baseline: number
  phase: number
  seed: number
}
const WORKSHOPS: Ws[] = [
  {zh: '冲压车间', en: 'Stamping', baseline: 84, phase: 0, seed: 81},
  {zh: '焊装车间', en: 'Welding', baseline: 76, phase: 0.7, seed: 82},
  {zh: '涂装车间', en: 'Painting', baseline: 68, phase: 1.4, seed: 83},
  {zh: '部装车间', en: 'Sub-assembly', baseline: 90, phase: 2.1, seed: 84},
  {zh: '总装车间', en: 'Final assembly', baseline: 72, phase: 2.8, seed: 85},
]
const workshops = WORKSHOPS.map((w) => ({
  zh: w.zh,
  en: w.en,
  value: useDomainSeries(
    {baseline: w.baseline, unit: '%', cycle: (s) => Math.sin(s / 150 + w.phase), cycleAmp: 0.04, noiseAmp: 0.7},
    {seed: w.seed, window: 2},
  ).current,
}))

interface PondCfg {
  key: string
  label: string
  value: number
  colors: string[]
}

// 三个 PercentPond 配置(依赖 current,值变自动重渲)。
const ponds = computed<PondCfg[]>(() => [
  {key: 'target', label: t('当班目标达成率', 'Shift target rate'), value: pct(targetRate.value), colors: ['#00e5ff', '#2b9bff']},
  {key: 'uptime', label: t('设备开机率', 'Machine uptime'), value: pct(uptimeRate.value), colors: ['#00ffc6', '#00e5ff']},
  {key: 'plan', label: t('计划完成率', 'Plan completion'), value: pct(planRate.value), colors: ['#7a5cff', '#2b9bff']},
])

// 胶囊图配置:各车间订单完成度(0–100%),霓虹配色 + 显示数值。
const capsuleConfig = computed(() => ({
  data: workshops.map((w) => ({name: t(w.zh, w.en), value: pct(w.value.value)})),
  colors: ['#00e5ff', '#2b9bff', '#00ffc6', '#7a5cff', '#ff5cf0'],
  unit: '%',
  showValue: true,
}))

const accessibleTitle = computed(() =>
  t('工厂达成率与各车间订单完成度', 'Factory attainment rates and per-workshop order completion'),
)
</script>

<template>
  <div class="fcb" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <!-- 上半:三路达成率百分比水球 -->
      <div class="fcb-ponds">
        <div v-for="p in ponds" :key="p.key" class="fcb-pond">
          <DvPercentPond
            :config="{value: p.value, colors: p.colors, textColor: '#d4ecff', borderRadius: 6, formatter: '{value}%'}"
          />
          <span class="fcb-pond-label">{{ p.label }}</span>
        </div>
      </div>

      <!-- 下半:各车间订单完成度胶囊排行 -->
      <div class="fcb-capsule">
        <h4 class="fcb-sub">{{ t('各车间订单完成度', 'Order completion by workshop') }}</h4>
        <div class="fcb-capsule-body">
          <DvCapsuleChart :config="capsuleConfig" />
        </div>
      </div>

      <!-- SSR / 降级 fallback -->
      <template #fallback>
        <div class="fcb-fallback">{{ accessibleTitle }}</div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.fcb {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 10px;
  box-sizing: border-box;
}
.fcb-ponds {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  flex: 0 0 auto;
}
.fcb-pond {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
/* DvPercentPond 自身撑满容器,给定高度供其渲染 */
.fcb-pond :deep(.dv-percent-pond) {
  width: 100%;
  height: clamp(64px, 9vh, 96px);
}
.fcb-pond-label {
  font-size: 12px;
  letter-spacing: 0.5px;
  color: var(--dc3d-text-dim);
  text-align: center;
}
.fcb-capsule {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fcb-sub {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--dc3d-text);
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.2);
  flex-shrink: 0;
}
.fcb-capsule-body {
  flex: 1 1 auto;
  min-height: 0;
}
.fcb-capsule-body :deep(.dv-capsule-chart) {
  width: 100%;
  height: 100%;
}
.fcb-fallback {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--dc3d-text-dim);
}
</style>