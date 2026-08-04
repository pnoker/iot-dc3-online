<script setup lang="ts">
/**
 * 制冷效率与温控达标(DataV 子面板)。
 * 上半:DvPercentPond ×2(制冷 COP 效率 / 温控达标率)。
 * 下半:DvCapsuleChart(各温区温控达标率)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const pct = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

// 制冷 COP 效率(映射 0-100,基准 86)+ 温控达标率(基准 97)
const cop = useDomainSeries(
  {baseline: 86, unit: '%', cycle: (s) => Math.sin(s / 140), cycleAmp: 0.03, noiseAmp: 0.4},
  {seed: 511, window: 2},
).current
const comply = useDomainSeries(
  {baseline: 97, unit: '%', cycle: (s) => Math.sin(s / 160 + 1.2), cycleAmp: 0.012, noiseAmp: 0.3},
  {seed: 512, window: 2},
).current

interface Z {code: string; baseline: number; phase: number; seed: number}
const ZONES: Z[] = [
  {code: t('冷藏', 'Chilled'), baseline: 97.8, phase: 0, seed: 521},
  {code: t('冷冻', 'Frozen'), baseline: 98.9, phase: 0.7, seed: 522},
  {code: t('恒温', 'Constant'), baseline: 96.4, phase: 1.4, seed: 523},
  {code: t('缓冲', 'Buffer'), baseline: 95.1, phase: 2.1, seed: 524},
  {code: t('月台', 'Dock'), baseline: 93.6, phase: 2.8, seed: 525},
]
const zones = ZONES.map((d) => ({
  code: d.code,
  val: useDomainSeries(
    {baseline: d.baseline, unit: '%', cycle: (s) => Math.sin(s / 150 + d.phase), cycleAmp: 0.012, noiseAmp: 0.2},
    {seed: d.seed, window: 2},
  ).current,
}))

interface PondCfg {key: string; label: string; value: number; colors: string[]}
const ponds = computed<PondCfg[]>(() => [
  {key: 'cop', label: t('制冷 COP', 'Cooling COP'), value: pct(cop.value), colors: ['#00e5ff', '#2b9bff']},
  {key: 'comply', label: t('温控达标', 'Compliance'), value: pct(comply.value), colors: ['#00ffc6', '#00e5ff']},
])

const capsuleConfig = computed(() => ({
  data: zones.map((z) => ({name: z.code, value: pct(z.val.value)})),
  colors: ['#00e5ff', '#2b9bff', '#00ffc6', '#7a5cff', '#ff5cf0'],
  unit: '%',
  showValue: true,
}))

const accessibleTitle = computed(() => t('制冷效率温控达标率与各温区达标胶囊', 'Cooling efficiency compliance rate and per-zone capsule'))
</script>

<template>
  <div class="eff" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div class="eff-ponds">
        <div v-for="p in ponds" :key="p.key" class="eff-pond">
          <DvPercentPond
            :config="{value: p.value, colors: p.colors, textColor: '#d4ecff', borderRadius: 6, formatter: '{value}%'}"
          />
          <span class="eff-pond-label">{{ p.label }}</span>
        </div>
      </div>

      <div class="eff-capsule">
        <h4 class="eff-sub">{{ t('各温区温控达标率', 'Compliance by zone') }}</h4>
        <div class="eff-capsule-body">
          <DvCapsuleChart :config="capsuleConfig" />
        </div>
      </div>

      <template #fallback>
        <div class="eff-fallback">{{ accessibleTitle }}</div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.eff {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 8px;
  box-sizing: border-box;
}
.eff-ponds {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  flex: 0 0 auto;
}
.eff-pond {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.eff-pond :deep(.dv-percent-pond) {
  width: 100%;
  height: clamp(48px, 7vh, 72px);
}
.eff-pond-label {
  font-size: 11px;
  letter-spacing: 0.5px;
  color: var(--dc3d-text-dim);
  text-align: center;
}
.eff-capsule {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.eff-sub {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--dc3d-text);
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.2);
  flex-shrink: 0;
}
.eff-capsule-body {
  flex: 1 1 auto;
  min-height: 0;
}
.eff-capsule-body :deep(.dv-capsule-chart) {
  width: 100%;
  height: 100%;
}
.eff-fallback {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--dc3d-text-dim);
}
</style>
