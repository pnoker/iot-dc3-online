<script setup lang="ts">
/**
 * 通防系统达成率百分比条:DvPercentPond ×3 竖排。
 * 通风合格率 / 人员定位在线率 / 瓦斯传感器在线率。
 * useDomainSeries 五因子实时驱动,clamp [0,100] 业务区间。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const pct = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const ventRate = useDomainSeries(
  {baseline: 96, unit: '%', cycle: (s) => Math.sin(s / 150), cycleAmp: 0.02, noiseAmp: 0.4},
  {seed: 81, window: 2},
).current
const uwbRate = useDomainSeries(
  {baseline: 99, unit: '%', cycle: (s) => Math.sin(s / 170 + 1.2), cycleAmp: 0.01, noiseAmp: 0.2},
  {seed: 82, window: 2},
).current
const gasSensorRate = useDomainSeries(
  {baseline: 97, unit: '%', cycle: (s) => Math.sin(s / 140 + 2.4), cycleAmp: 0.02, noiseAmp: 0.4},
  {seed: 83, window: 2},
).current

interface Pond {key: string; label: string; value: number; colors: string[]}
const ponds = computed<Pond[]>(() => [
  {key: 'vent', label: t('通风合格率', 'Vent. Compliance'), value: pct(ventRate.value), colors: ['#00e5ff', '#2b9bff']},
  {key: 'uwb', label: t('人员定位在线', 'UWB Online'), value: pct(uwbRate.value), colors: ['#00ffc6', '#00e5ff']},
  {key: 'gas', label: t('瓦斯传感器在线', 'Gas Sensor Online'), value: pct(gasSensorRate.value), colors: ['#7a5cff', '#2b9bff']},
])

const accessibleTitle = computed(() => t('通防系统与传感器在线率', 'Ventilation compliance and sensor online rates'))
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
.ponds {display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0; gap: 14px; box-sizing: border-box; justify-content: center;}
.pond {display: flex; flex-direction: column; align-items: center; gap: 8px;}
.pond :deep(.dv-percent-pond) {width: 100%; height: clamp(38px, 5vh, 52px);}
.pond-label {font-size: 12px; letter-spacing: 0.5px; color: var(--dc3d-text-dim); text-align: center;}
.pond-bar {width: 100%; height: 14px; border-radius: 7px; background: rgba(255,255,255,0.08); overflow: hidden;}
.pond-fill {display: block; height: 100%; background: linear-gradient(90deg, #00e5ff, #2b9bff); box-shadow: 0 0 8px rgba(0,229,255,0.5);}
</style>
