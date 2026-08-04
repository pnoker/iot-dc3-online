<script setup lang="ts">
/**
 * 压力水质合格率组 + 各 DMA 水质达标胶囊图(DataV 子面板)。
 * 上半:DvPercentPond ×2(压力合格率 / 水质达标率)。
 * 下半:DvCapsuleChart(各 DMA 水质达标率)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const pct = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const pressRate = useDomainSeries(
  {baseline: 96, unit: '%', cycle: (s) => Math.sin(s / 140), cycleAmp: 0.012, noiseAmp: 0.15},
  {seed: 91, window: 2},
).current
const qualRate = useDomainSeries(
  {baseline: 99, unit: '%', cycle: (s) => Math.sin(s / 160 + 1.2), cycleAmp: 0.004, noiseAmp: 0.1},
  {seed: 92, window: 2},
).current

interface Dma {code: string; baseline: number; phase: number; seed: number}
const DMAS: Dma[] = [
  {code: 'DMA-01', baseline: 99.6, phase: 0, seed: 81},
  {code: 'DMA-02', baseline: 99.1, phase: 0.7, seed: 82},
  {code: 'DMA-03', baseline: 98.2, phase: 1.4, seed: 83},
  {code: 'DMA-04', baseline: 96.8, phase: 2.1, seed: 84},
  {code: 'DMA-05', baseline: 99.4, phase: 2.8, seed: 85},
]
const dmas = DMAS.map((d) => ({
  code: d.code,
  val: useDomainSeries(
    {baseline: d.baseline, unit: '%', cycle: (s) => Math.sin(s / 150 + d.phase), cycleAmp: 0.004, noiseAmp: 0.12},
    {seed: d.seed, window: 2},
  ).current,
}))

interface PondCfg {key: string; label: string; value: number; colors: string[]}
const ponds = computed<PondCfg[]>(() => [
  {key: 'press', label: t('压力合格率', 'Pressure'), value: pct(pressRate.value), colors: ['#00e5ff', '#2b9bff']},
  {key: 'qual', label: t('水质达标率', 'Quality'), value: pct(qualRate.value), colors: ['#00ffc6', '#00e5ff']},
])

const capsuleConfig = computed(() => ({
  data: dmas.map((d) => ({name: d.code, value: pct(d.val.value)})),
  colors: ['#00e5ff', '#2b9bff', '#00ffc6', '#7a5cff', '#ff5cf0'],
  unit: '%',
  showValue: true,
}))

const accessibleTitle = computed(() =>
  t('压力合格率水质达标率与各分区水质', 'Pressure and quality compliance rates by DMA'),
)
</script>

<template>
  <div class="wqr" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div class="wqr-ponds">
        <div v-for="p in ponds" :key="p.key" class="wqr-pond">
          <DvPercentPond
            :config="{value: p.value, colors: p.colors, textColor: '#d4ecff', borderRadius: 6, formatter: '{value}%'}"
          />
          <span class="wqr-pond-label">{{ p.label }}</span>
        </div>
      </div>

      <div class="wqr-capsule">
        <h4 class="wqr-sub">{{ t('各 DMA 水质达标率', 'Quality compliance by DMA') }}</h4>
        <div class="wqr-capsule-body">
          <DvCapsuleChart :config="capsuleConfig" />
        </div>
      </div>

      <template #fallback>
        <div class="wqr-fallback">{{ accessibleTitle }}</div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.wqr {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 10px;
  box-sizing: border-box;
}
.wqr-ponds {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  flex: 0 0 auto;
}
.wqr-pond {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.wqr-pond :deep(.dv-percent-pond) {
  width: 100%;
  height: clamp(56px, 8vh, 84px);
}
.wqr-pond-label {
  font-size: 12px;
  letter-spacing: 0.5px;
  color: var(--dc3d-text-dim);
  text-align: center;
}
.wqr-capsule {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wqr-sub {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--dc3d-text);
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.2);
  flex-shrink: 0;
}
.wqr-capsule-body {
  flex: 1 1 auto;
  min-height: 0;
}
.wqr-capsule-body :deep(.dv-capsule-chart) {
  width: 100%;
  height: 100%;
}
.wqr-fallback {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--dc3d-text-dim);
}
</style>
