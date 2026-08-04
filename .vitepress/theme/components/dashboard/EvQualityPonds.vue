<script setup lang="ts">
/**
 * 充电质量与履约达成率:DvPercentPond ×3 竖排。
 * 功率因数(PF) / 充电完成率(订单满充达成) / 有序充电响应率(OBMS 调度响应)。
 * useDomainSeries 五因子驱动,clamp 业务区间。整数值稳定引用(防扫光闪)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const pct = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

// 功率因数:整流模块 PF,稳定高(0.92-0.98 → 显示为 92-98%)
const pf = useDomainSeries(
  {baseline: 95.6, unit: '%', cycle: (s) => Math.sin(s / 160), cycleAmp: 0.02, noiseAmp: 0.4},
  {seed: 41, window: 2},
).current
// 充电完成率:订单满充达成比例
const complete = useDomainSeries(
  {baseline: 88.4, unit: '%', cycle: (s) => Math.sin(s / 150 + 1.2), cycleAmp: 0.03, noiseAmp: 0.5},
  {seed: 42, window: 2},
).current
// 有序充电响应率:OBMS 调度指令站点响应比例
const obms = useDomainSeries(
  {baseline: 82, unit: '%', cycle: (s) => Math.sin(s / 140 + 2.4), cycleAmp: 0.04, noiseAmp: 0.6},
  {seed: 43, window: 2},
).current

const PONDS = computed(() => [
  {key: 'pf', label: t('整流功率因数', 'Power Factor'), value: pct(pf.value), colors: ['#00e5ff', '#2b9bff']},
  {key: 'complete', label: t('充电完成率', 'Completion'), value: pct(complete.value), colors: ['#00ffc6', '#00e5ff']},
  {key: 'obms', label: t('有序充电响应率', 'OBMS Response'), value: pct(obms.value), colors: ['#7a5cff', '#2b9bff']},
])

const accessibleTitle = computed(() => t('功率因数与充电履约达成率', 'Power factor & charging fulfillment rates'))
</script>

<template>
  <div class="ep" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div v-for="p in PONDS" :key="p.key" class="ep-item">
        <DvPercentPond
          :config="{value: p.value, colors: p.colors, textColor: '#d4ecff', borderRadius: 6, formatter: '{value}%'}"
        />
        <span class="ep-label">{{ p.label }}</span>
      </div>
      <template #fallback>
        <div v-for="p in PONDS" :key="p.key" class="ep-item">
          <div class="ep-bar"><span class="ep-fill" :style="{width: p.value + '%'}" /></div>
          <span class="ep-label">{{ p.label }} · {{ p.value }}%</span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.ep {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 14px;
  box-sizing: border-box;
  justify-content: center;
}
.ep-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.ep-item :deep(.dv-percent-pond) { width: 100%; height: clamp(38px, 5vh, 52px); }
.ep-label { font-size: 12px; letter-spacing: 0.5px; color: var(--dc3d-text-dim); text-align: center; }
.ep-bar { width: 100%; height: 14px; border-radius: 7px; background: rgba(255, 255, 255, 0.08); overflow: hidden; }
.ep-fill { display: block; height: 100%; background: linear-gradient(90deg, #00e5ff, #2b9bff); box-shadow: 0 0 8px rgba(0, 229, 255, 0.5); }
</style>
