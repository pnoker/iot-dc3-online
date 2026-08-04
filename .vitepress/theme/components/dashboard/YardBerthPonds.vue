<script setup lang="ts">
/**
 * 堆场与泊位达成率百分比条:DvPercentPond ×3 竖排。
 * 堆场利用率 / 泊位计划达成率 / 闸口通过达成率。
 * useDomainSeries 五因子实时驱动,clamp [0,100] 业务区间。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const pct = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const yardUtil = useDomainSeries(
  {baseline: 78, unit: '%', cycle: (s) => Math.sin(s / 160), cycleAmp: 0.03, noiseAmp: 0.4},
  {seed: 711, window: 2},
).current
const berthPlan = useDomainSeries(
  {baseline: 91, unit: '%', cycle: (s) => Math.sin(s / 180 + 1.2), cycleAmp: 0.025, noiseAmp: 0.5},
  {seed: 712, window: 2},
).current
const gateRate = useDomainSeries(
  {baseline: 86, unit: '%', cycle: (s) => Math.sin(s / 140 + 2.4), cycleAmp: 0.035, noiseAmp: 0.6},
  {seed: 713, window: 2},
).current

interface Pond {key: string; label: string; value: number; colors: string[]}
const ponds = computed<Pond[]>(() => [
  {key: 'yard', label: t('堆场利用率', 'Yard Utilization'), value: pct(yardUtil.value), colors: ['#00e5ff', '#2b9bff']},
  {key: 'berth', label: t('泊位计划达成', 'Berth Plan Achieve'), value: pct(berthPlan.value), colors: ['#00ffc6', '#00e5ff']},
  {key: 'gate', label: t('闸口通过达成', 'Gate Throughput'), value: pct(gateRate.value), colors: ['#7a5cff', '#2b9bff']},
])

const accessibleTitle = computed(() => t('堆场利用率与泊位计划达成率', 'Yard utilization and berth plan achievement'))
</script>

<template>
  <div class="ponds" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div v-for="p in ponds" :key="p.key" class="pond">
        <DvPercentPond
          :config="{value: p.value, colors: p.colors, textColor: '#d4ecff', borderRadius: 6, formatter: '{value}%'}"
        />
        <span class="pond-label">{{ p.label }}</span>
      </div>
      <template #fallback>
        <div v-for="p in ponds" :key="p.key" class="pond">
          <div class="pond-bar"><span class="pond-fill" :style="{width: p.value + '%'}" /></div>
          <span class="pond-label">{{ p.label }} · {{ p.value }}%</span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.ponds {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 14px;
  box-sizing: border-box;
  justify-content: center;
}
.pond {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.pond :deep(.dv-percent-pond) {
  width: 100%;
  height: clamp(38px, 5vh, 52px);
}
.pond-label {
  font-size: 12px;
  letter-spacing: 0.5px;
  color: var(--dc3d-text-dim);
  text-align: center;
}
.pond-bar {
  width: 100%;
  height: 14px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.pond-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #00e5ff, #2b9bff);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
}
</style>
