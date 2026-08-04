<script setup lang="ts">
/**
 * 绿电与电能质量概览:大号绿电自消纳率 + 功率因数/频率合格率(DvPercentPond ×2)。
 * 3 路 useDomainSeries 乘性慢周期,稳定在业务区间。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const selfConsume = useDomainSeries(
  {baseline: 82, unit: '%', cycle: (s) => Math.sin(s / 150), cycleAmp: 0.04, noiseAmp: 0.6},
  {seed: 71, window: 2},
).current
const pfRate = useDomainSeries(
  {baseline: 99.4, unit: '%', cycle: (s) => Math.sin(s / 170 + 1.2), cycleAmp: 0.004, noiseAmp: 0.05},
  {seed: 83, window: 2},
).current
const freqRate = useDomainSeries(
  {baseline: 99.8, unit: '%', cycle: (s) => Math.sin(s / 190 + 2.4), cycleAmp: 0.002, noiseAmp: 0.04},
  {seed: 97, window: 2},
).current

const clampPct = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v))
const rate = computed(() => clampPct(selfConsume.value))
const pf = computed(() => clampPct(pfRate.value, 95, 100))
const fq = computed(() => clampPct(freqRate.value, 95, 100))

const ponds = computed(() => [
  {key: 'pf', label: t('功率因数合格率', 'PF Compliance'), value: pf.value, colors: ['#00e5ff', '#2b9bff']},
  {key: 'fq', label: t('频率合格率', 'Freq. Compliance'), value: fq.value, colors: ['#00ffc6', '#00e5ff']},
])

const accessibleTitle = computed(() => t('绿电自消纳率与电能质量合格率', 'Green self-consumption and power quality'))
</script>

<template>
  <div class="gr" role="group" :aria-label="accessibleTitle">
    <div class="gr__big">
      <span class="gr__num">{{ rate.toFixed(1) }}</span>
      <span class="gr__pct">%</span>
      <span class="gr__tag">{{ t('自消纳', 'SELF-USE') }}</span>
    </div>
    <div class="gr__ponds">
      <ClientOnly>
        <div v-for="p in ponds" :key="p.key" class="gr__pond">
          <DvPercentPond
            :config="{value: p.value, colors: p.colors, textColor: '#d4ecff', borderRadius: 6, formatter: '{value}%'}"
          />
          <span class="gr__pond-label">{{ p.label }}</span>
        </div>
        <template #fallback>
          <div v-for="p in ponds" :key="p.key" class="gr__pond">
            <span class="gr__fb">{{ p.value.toFixed(1) }}%</span>
            <span class="gr__pond-label">{{ p.label }}</span>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
.gr {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  height: 100%;
  padding: 0 4px;
  box-sizing: border-box;
}
.gr__big {
  display: flex;
  align-items: baseline;
  gap: 2px;
  position: relative;
  flex-shrink: 0;
}
.gr__num {
  font-size: clamp(30px, 3.4vw, 46px);
  font-weight: 800;
  font-family: var(--dc3d-mono, monospace);
  color: #00e676;
  text-shadow: 0 0 18px rgba(0, 230, 118, 0.7);
  line-height: 1;
}
.gr__pct { font-size: 16px; color: #00e676; font-weight: 700; }
.gr__tag {
  position: absolute; bottom: -14px; left: 2px;
  font-size: 10px; letter-spacing: 2px;
  color: var(--dc3d-text-dim); font-family: var(--dc3d-mono, monospace);
}
.gr__ponds {
  flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0;
}
.gr__pond { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.gr__pond :deep(.dv-percent-pond) { width: 100%; height: clamp(30px, 4.4vh, 44px); }
.gr__pond-label { font-size: 11px; letter-spacing: 0.5px; color: var(--dc3d-text-dim); text-align: center; }
.gr__fb { font-family: var(--dc3d-mono); font-size: 18px; font-weight: 700; color: #00e5ff; }
</style>
