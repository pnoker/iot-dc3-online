<script setup lang="ts">
/**
 * 灌溉系统达成率百分比条:DvPercentPond ×3 竖排。
 * 灌溉系统在线率 / 水肥利用率(WUE 相对达成) / 基质 EC 达标率。
 * useDomainSeries 五因子实时驱动,clamp [0,100] 业务区间。
 * ⚙️ 整数值不变则 config 返回同一引用(PercentPond 不重建、扫光不闪)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const pct = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

// 三路达成率:baseline 稳定业务区间,小 cycleAmp + 小噪声
const onlineRate = useDomainSeries(
  {baseline: 96, unit: '%', cycle: (s) => Math.sin(s / 150), cycleAmp: 0.02, noiseAmp: 0.4},
  {seed: 71, window: 2},
).current
const wueRate = useDomainSeries(
  {baseline: 84, unit: '%', cycle: (s) => Math.sin(s / 170 + 1.2), cycleAmp: 0.03, noiseAmp: 0.5},
  {seed: 72, window: 2},
).current
const ecRate = useDomainSeries(
  {baseline: 91, unit: '%', cycle: (s) => Math.sin(s / 140 + 2.4), cycleAmp: 0.025, noiseAmp: 0.5},
  {seed: 73, window: 2},
).current

interface Pond {
  key: string
  label: string
  value: number
  colors: string[]
}
const ponds = computed<Pond[]>(() => [
  {key: 'online', label: t('灌溉系统在线率', 'Irrig. Online'), value: pct(onlineRate.value), colors: ['#00e5ff', '#2b9bff']},
  {key: 'wue', label: t('水肥利用率 WUE', 'WUE Achieve'), value: pct(wueRate.value), colors: ['#00ffc6', '#00e5ff']},
  {key: 'ec', label: t('基质 EC 达标率', 'EC Compliance'), value: pct(ecRate.value), colors: ['#7a5cff', '#2b9bff']},
])

const accessibleTitle = computed(() => t('灌溉系统在线率与达成率', 'Irrigation system online & achievement rates'))
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
