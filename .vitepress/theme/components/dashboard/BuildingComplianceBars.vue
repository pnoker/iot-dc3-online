<script setup lang="ts">
/**
 * 楼宇达标率 + 各楼层利用率(DataV 子面板)。
 * 上半:DvPercentPond ×3(室温达标率 / CO₂达标率 / 空间利用率)。
 * 下半:DvCapsuleChart(各楼层利用率排行)。
 * 数据用 useDomainSeries 五因子实时驱动,百分比钳制 [0,100]。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const pct = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const tempRate = useDomainSeries(
  {baseline: 92, unit: '%', cycle: (s) => Math.sin(s / 140), cycleAmp: 0.03, noiseAmp: 0.5},
  {seed: 71, window: 2},
).current
const co2Rate = useDomainSeries(
  {baseline: 88, unit: '%', cycle: (s) => Math.sin(s / 160 + 1.2), cycleAmp: 0.03, noiseAmp: 0.5},
  {seed: 72, window: 2},
).current
const utilRate = useDomainSeries(
  {baseline: 76, unit: '%', cycle: (s) => Math.sin(s / 180 + 2.4), cycleAmp: 0.04, noiseAmp: 0.6},
  {seed: 73, window: 2},
).current

interface Fl {zh: string; en: string; baseline: number; phase: number; seed: number}
const FLOORS: Fl[] = [
  {zh: '6F 办公', en: '6F Office', baseline: 82, phase: 0, seed: 81},
  {zh: '4F 办公', en: '4F Office', baseline: 78, phase: 0.7, seed: 82},
  {zh: '7F 办公', en: '7F Office', baseline: 74, phase: 1.4, seed: 83},
  {zh: '5F 办公', en: '5F Office', baseline: 70, phase: 2.1, seed: 84},
  {zh: '3F 会议', en: '3F Meeting', baseline: 58, phase: 2.8, seed: 85},
]
const floors = FLOORS.map((w) => ({
  zh: w.zh,
  en: w.en,
  value: useDomainSeries(
    {baseline: w.baseline, unit: '%', cycle: (s) => Math.sin(s / 150 + w.phase), cycleAmp: 0.04, noiseAmp: 0.7},
    {seed: w.seed, window: 2},
  ).current,
}))

interface PondCfg {key: string; label: string; value: number; colors: string[]}

const ponds = computed<PondCfg[]>(() => [
  {key: 'temp', label: t('室温达标率', 'Temp Compliance'), value: pct(tempRate.value), colors: ['#00e5ff', '#2b9bff']},
  {key: 'co2', label: t('CO₂ 达标率', 'Air Compliance'), value: pct(co2Rate.value), colors: ['#00ffc6', '#00e5ff']},
  {key: 'util', label: t('空间利用率', 'Utilization'), value: pct(utilRate.value), colors: ['#7a5cff', '#2b9bff']},
])

const capsuleConfig = computed(() => ({
  data: floors.map((w) => ({name: t(w.zh, w.en), value: pct(w.value.value)})),
  colors: ['#00e5ff', '#2b9bff', '#00ffc6', '#7a5cff', '#ff5cf0'],
  unit: '%',
  showValue: true,
}))

const accessibleTitle = computed(() => t('楼宇达标率与各楼层利用率', 'Compliance rates and per-floor utilization'))
</script>

<template>
  <div class="bcb" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div class="bcb-ponds">
        <div v-for="p in ponds" :key="p.key" class="bcb-pond">
          <DvPercentPond
            :config="{value: p.value, colors: p.colors, textColor: '#d4ecff', borderRadius: 6, formatter: '{value}%'}"
          />
          <span class="bcb-pond-label">{{ p.label }}</span>
        </div>
      </div>
      <div class="bcb-capsule">
        <h4 class="bcb-sub">{{ t('各楼层利用率', 'Utilization by floor') }}</h4>
        <div class="bcb-capsule-body">
          <DvCapsuleChart :config="capsuleConfig" />
        </div>
      </div>
      <template #fallback>
        <div class="bcb-fallback">{{ accessibleTitle }}</div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.bcb {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 10px;
  box-sizing: border-box;
}
.bcb-ponds {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  flex: 0 0 auto;
}
.bcb-pond {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.bcb-pond :deep(.dv-percent-pond) {
  width: 100%;
  height: clamp(48px, 7vh, 72px);
}
.bcb-pond-label {
  font-size: 11px;
  letter-spacing: 0.5px;
  color: var(--dc3d-text-dim);
  text-align: center;
}
.bcb-capsule {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bcb-sub {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--dc3d-text);
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.2);
  flex-shrink: 0;
}
.bcb-capsule-body {
  flex: 1 1 auto;
  min-height: 0;
}
.bcb-capsule-body :deep(.dv-capsule-chart) {
  width: 100%;
  height: 100%;
}
.bcb-fallback {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--dc3d-text-dim);
}
</style>
