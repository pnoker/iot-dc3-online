<script setup lang="ts">
/**
 * 信号控制健康度:DvPercentPond ×3(信号在线率/绿波覆盖率/联网控制率)。
 * 三路达成率 baseline 稳定业务区间,小 cycleAmp + 小噪声,缓慢真实漂移。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const pct = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const online = useDomainSeries({baseline: 96, unit: '%', cycle: (s) => Math.sin(s / 150), cycleAmp: 0.015, noiseAmp: 0.3}, {seed: 51, window: 2}).current
const waveCov = useDomainSeries({baseline: 76, unit: '%', cycle: (s) => Math.sin(s / 140 + 0.8), cycleAmp: 0.05, noiseAmp: 0.8}, {seed: 52, window: 2}).current
const networked = useDomainSeries({baseline: 88, unit: '%', cycle: (s) => Math.sin(s / 170 + 1.6), cycleAmp: 0.03, noiseAmp: 0.5}, {seed: 53, window: 2}).current

const ponds = computed(() => [
  {key: 'online', label: t('信号在线率', 'Signal Online'), value: pct(online.value), colors: ['#00e5ff', '#2b9bff']},
  {key: 'wave', label: t('绿波覆盖率', 'Green-Wave Cover'), value: pct(waveCov.value), colors: ['#00ffc6', '#00e5ff']},
  {key: 'net', label: t('联网控制率', 'Networked Control'), value: pct(networked.value), colors: ['#7a5cff', '#2b9bff']},
])
const accessibleTitle = computed(() => t('信号在线率与绿波覆盖率', 'Signal online rate and green-wave coverage'))
</script>

<template>
  <div class="sig" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div class="sig-ponds">
        <div v-for="p in ponds" :key="p.key" class="sig-pond">
          <DvPercentPond :config="{value: p.value, colors: p.colors, textColor: '#d4ecff', borderRadius: 6, formatter: '{value}%'}" />
          <span class="sig-label">{{ p.label }}</span>
        </div>
      </div>
      <template #fallback>
        <div class="sig-fb">{{ accessibleTitle }}</div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.sig {display: flex; width: 100%; height: 100%; min-height: 0; box-sizing: border-box;}
.sig-ponds {display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; align-items: center;}
.sig-pond {display: flex; flex-direction: column; align-items: center; gap: 6px;}
.sig-pond :deep(.dv-percent-pond) {width: 100%; height: clamp(64px, 12vh, 110px);}
.sig-label {font-size: 12px; letter-spacing: 0.5px; color: var(--dc3d-text-dim); text-align: center;}
.sig-fb {flex: 1; display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--dc3d-text-dim);}
</style>
