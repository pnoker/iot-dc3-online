<script setup lang="ts">
/**
 * 压力/气质合格率组 + 各站压力偏差率胶囊图(DataV 子面板)。
 * 上半:DvPercentPond ×2(压力合格率 / 气质达标率)。
 * 下半:DvCapsuleChart(各站压力偏差率 %,越小越好)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const pct = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const pressRate = useDomainSeries(
  {baseline: 97, unit: '%', cycle: (s) => Math.sin(s / 140), cycleAmp: 0.012, noiseAmp: 0.15},
  {seed: 991, window: 2},
).current
const qualRate = useDomainSeries(
  {baseline: 99, unit: '%', cycle: (s) => Math.sin(s / 160 + 1.2), cycleAmp: 0.003, noiseAmp: 0.1},
  {seed: 992, window: 2},
).current

interface St {code: string; baseline: number; phase: number; seed: number}
// 各站压力偏差率 % (调度目标 ≤±3%)。这里取绝对值展示(0-6%)。
const STATIONS: St[] = [
  {code: t('首站', 'CS-1'), baseline: 1.8, phase: 0, seed: 81},
  {code: t('CS-2', 'CS-2'), baseline: 2.6, phase: 0.7, seed: 82},
  {code: t('SV-1', 'SV-1'), baseline: 3.4, phase: 1.4, seed: 83},
  {code: t('SV-2', 'SV-2'), baseline: 2.2, phase: 2.1, seed: 84},
  {code: t('门站A', 'GateA'), baseline: 4.1, phase: 2.8, seed: 85},
]
const stations = STATIONS.map((s) => ({
  code: s.code,
  val: useDomainSeries(
    {baseline: s.baseline, unit: '%', cycle: (st) => Math.sin(st / 150 + s.phase), cycleAmp: 0.2, noiseAmp: 0.15},
    {seed: s.seed, window: 2},
  ).current,
}))

interface PondCfg {key: string; label: string; value: number; colors: string[]}
const ponds = computed<PondCfg[]>(() => [
  {key: 'press', label: t('压力合格率', 'Pressure'), value: pct(pressRate.value), colors: ['#00e5ff', '#2b9bff']},
  {key: 'qual', label: t('气质达标率', 'Quality'), value: pct(qualRate.value), colors: ['#00ffc6', '#00e5ff']},
])

const capsuleConfig = computed(() => ({
  data: stations.map((s) => ({name: s.code, value: +Math.max(0, Math.abs(s.val.value)).toFixed(1)})),
  colors: ['#00e676', '#00e5ff', '#ffb020', '#2b9bff', '#ff5252'],
  unit: '%',
  showValue: true,
}))

const accessibleTitle = computed(() =>
  t('压力合格率气质达标率与各站压力偏差率', 'Pressure and quality compliance rates with station pressure deviation'),
)
</script>

<template>
  <div class="ogpp" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div class="ogpp-ponds">
        <div v-for="p in ponds" :key="p.key" class="ogpp-pond">
          <DvPercentPond
            :config="{value: p.value, colors: p.colors, textColor: '#d4ecff', borderRadius: 6, formatter: '{value}%'}"
          />
          <span class="ogpp-pond-label">{{ p.label }}</span>
        </div>
      </div>

      <div class="ogpp-capsule">
        <h4 class="ogpp-sub">{{ t('各站压力偏差率', 'Station pressure deviation') }}</h4>
        <div class="ogpp-capsule-body">
          <DvCapsuleChart :config="capsuleConfig" />
        </div>
      </div>

      <template #fallback>
        <div class="ogpp-fallback">{{ accessibleTitle }}</div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.ogpp {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 10px;
  box-sizing: border-box;
}
.ogpp-ponds {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  flex: 0 0 auto;
}
.ogpp-pond {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.ogpp-pond :deep(.dv-percent-pond) {
  width: 100%;
  height: clamp(56px, 8vh, 84px);
}
.ogpp-pond-label {
  font-size: 12px;
  letter-spacing: 0.5px;
  color: var(--dc3d-text-dim);
  text-align: center;
}
.ogpp-capsule {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ogpp-sub {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--dc3d-text);
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.2);
  flex-shrink: 0;
}
.ogpp-capsule-body {
  flex: 1 1 auto;
  min-height: 0;
}
.ogpp-capsule-body :deep(.dv-capsule-chart) {
  width: 100%;
  height: 100%;
}
.ogpp-fallback {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--dc3d-text-dim);
}
</style>
