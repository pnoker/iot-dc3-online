<script setup lang="ts">
/**
 * 储罐水位球组:DvWaterLevelPond ×2 竖排(凝析油罐 T-201 / 甘醇罐 T-203)。
 * 两座主力储罐液位缓慢漂移(baseline 60-75 + 小 cycleAmp),clamp [0,100]。
 * 整数值不变时返回同一 config 引用,避免水位球重建导致波浪动画闪烁。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const NEON: [string, string] = ['#00e5ff', '#2b9bff']

const condensate = useDomainSeries(
  {baseline: 72, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 95), cycleAmp: 0.06, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 921},
)
const glycol = useDomainSeries(
  {baseline: 64, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 88 + 1.8), cycleAmp: 0.08, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 939},
)

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const META = [
  {key: 'cond', label: () => t('凝析油罐 T-201', 'T-201 Condensate'), src: condensate},
  {key: 'glyc', label: () => t('甘醇罐 T-203', 'T-203 Glycol'), src: glycol},
]

const tanks = META.map((m) => {
  let last = -1
  let cfg: any = null
  const config = computed(() => {
    const v = clamp(m.src.current.value)
    if (v !== last) {
      last = v
      cfg = {data: [v], shape: 'round', colors: NEON, formatter: '{value}%', waveHeight: 10, waveNum: 2, digitalFlopStyle: {fontSize: 11, fill: '#d4ecff'}, digitalFlopToFixed: 0}
    }
    return cfg
  })
  return {key: m.key, label: computed(m.label), value: computed(() => clamp(m.src.current.value)), config}
})

const accessibleTitle = computed(() =>
  t('凝析油罐与甘醇罐实时液位', 'Real-time condensate and glycol tank levels'),
)
</script>

<template>
  <div class="ogponds" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div
        v-for="tk in tanks"
        :key="tk.key"
        class="ogpond"
      >
        <div class="ogpond__ball">
          <DvWaterLevelPond :config="tk.config.value" style="width: 100%; height: 100%" />
        </div>
        <div class="ogpond__label">{{ tk.label.value }}</div>
      </div>

      <template #fallback>
        <div
          v-for="tk in tanks"
          :key="tk.key"
          class="ogpond"
        >
          <div class="ogpond__ball ogpond__ball--fb">
            <span class="ogpond__pct">{{ tk.value.value }}%</span>
          </div>
          <div class="ogpond__label">{{ tk.label.value }}</div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.ogponds {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  align-content: stretch;
  box-sizing: border-box;
}
.ogpond {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
  gap: 12px;
}
.ogpond__ball {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}
.ogpond__ball--fb {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid var(--dc3d-neon-cyan, #00e5ff);
  box-shadow: inset 0 0 18px rgba(0, 229, 255, 0.25), 0 0 10px rgba(0, 229, 255, 0.2);
  background: radial-gradient(circle at 50% 120%, rgba(43, 155, 255, 0.35), rgba(8, 22, 45, 0.6));
}
.ogpond__pct {
  font-size: 16px;
  font-weight: 700;
  color: var(--dc3d-text, #d4ecff);
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.4);
}
.ogpond__label {
  font-size: 12px;
  letter-spacing: 0.5px;
  color: var(--dc3d-text-dim, #6b8cae);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}
</style>
