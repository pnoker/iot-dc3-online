<script setup lang="ts">
/**
 * 充电站配套储能 SOC 水位组:DvWaterLevelPond ×3 竖排。
 * 高铁枢纽 / 滨江超充 / 科技园 三站配储,SOC 由 useDomainSeries 缓变,clamp [0,100]。
 * config 仅在整数值变化时换新对象(防波浪动画重置闪屏)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const NEON: [string, string] = ['#00e5ff', '#2b9bff']

const hsr = useDomainSeries(
  {baseline: 64, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90), cycleAmp: 0.08, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 31},
)
const riverside = useDomainSeries(
  {baseline: 72, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 80 + 1.6), cycleAmp: 0.06, noiseAmp: 0.3},
  {intervalMs: 6000, window: 20, seed: 32},
)
const techpark = useDomainSeries(
  {baseline: 58, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 75 + 3.1), cycleAmp: 0.09, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 33},
)

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const META = [
  {key: 'hsr', label: () => t('高铁枢纽储能', 'HSR BESS'), src: hsr},
  {key: 'riverside', label: () => t('滨江超充储能', 'Riverside BESS'), src: riverside},
  {key: 'techpark', label: () => t('科技园储能', 'Tech-Park BESS'), src: techpark},
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

const accessibleTitle = computed(() => t('充电站配套储能 SOC 实时液位', 'Station battery SOC real-time levels'))
</script>

<template>
  <div class="evs" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div v-for="tk in tanks" :key="tk.key" class="evs-tank">
        <div class="evs-pond">
          <DvWaterLevelPond :config="tk.config.value" style="width: 100%; height: 100%" />
        </div>
        <div class="evs-meta">
          <span class="evs-name">{{ tk.label.value }}</span>
          <span class="evs-state">{{ t('放电就绪', 'Discharge-ready') }}</span>
        </div>
      </div>
      <template #fallback>
        <div v-for="tk in tanks" :key="tk.key" class="evs-tank">
          <div class="evs-pond evs-pond--fb"><span class="evs-pct">{{ tk.value.value }}%</span></div>
          <div class="evs-meta">
            <span class="evs-name">{{ tk.label.value }}</span>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.evs {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
  align-content: stretch;
  box-sizing: border-box;
}
.evs-tank {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.evs-pond {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}
.evs-pond--fb {
  display: flex; align-items: center; justify-content: center; border-radius: 50%;
  border: 2px solid var(--dc3d-neon-cyan, #00e5ff);
  box-shadow: inset 0 0 18px rgba(0, 229, 255, 0.25), 0 0 10px rgba(0, 229, 255, 0.2);
  background: radial-gradient(circle at 50% 120%, rgba(43, 155, 255, 0.35), rgba(8, 22, 45, 0.6));
}
.evs-pct { font-size: 14px; font-weight: 700; color: var(--dc3d-text, #d4ecff); }
.evs-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.evs-name { font-size: 12px; letter-spacing: 0.5px; color: var(--dc3d-text, #d4ecff); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.evs-state { font-size: 10.5px; color: #00e676; }
</style>
