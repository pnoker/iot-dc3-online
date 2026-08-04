<script setup lang="ts">
/**
 * 水库水位球组:DvWaterLevelPond ×2 竖排(清水池 / 高位水池)。
 * 缓慢漂移(baseline 58-75 + 小 cycleAmp),clamp [0,100]。
 * ⚠ 整数值不变时返回同一 config 引用,避免水位球重建导致波浪动画闪烁。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const NEON: [string, string] = ['#00e5ff', '#2b9bff']

const clearWell = useDomainSeries(
  {baseline: 73, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 95), cycleAmp: 0.07, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 21},
)
const elevatedTank = useDomainSeries(
  {baseline: 58, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 88 + 1.8), cycleAmp: 0.09, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 39},
)

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const META = [
  {key: 'clear', label: () => t('清水池', 'Clear Well'), src: clearWell},
  {key: 'elevated', label: () => t('高位水池', 'Elevated Tank'), src: elevatedTank},
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
  t('清水池与高位水池实时水位', 'Real-time clear-well and elevated-tank levels'),
)
</script>

<template>
  <div class="wn-ponds" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div
        v-for="tk in tanks"
        :key="tk.key"
        class="wn-pond"
      >
        <div class="wn-pond__ball">
          <DvWaterLevelPond :config="tk.config.value" style="width: 100%; height: 100%" />
        </div>
        <div class="wn-pond__label">{{ tk.label.value }}</div>
      </div>

      <template #fallback>
        <div
          v-for="tk in tanks"
          :key="tk.key"
          class="wn-pond"
        >
          <div class="wn-pond__ball wn-pond__ball--fb">
            <span class="wn-pond__pct">{{ tk.value.value }}%</span>
          </div>
          <div class="wn-pond__label">{{ tk.label.value }}</div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.wn-ponds {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  align-content: stretch;
  box-sizing: border-box;
}
.wn-pond {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
  gap: 12px;
}
.wn-pond__ball {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}
.wn-pond__ball--fb {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid var(--dc3d-neon-cyan, #00e5ff);
  box-shadow: inset 0 0 18px rgba(0, 229, 255, 0.25), 0 0 10px rgba(0, 229, 255, 0.2);
  background: radial-gradient(circle at 50% 120%, rgba(43, 155, 255, 0.35), rgba(8, 22, 45, 0.6));
}
.wn-pond__pct {
  font-size: 16px;
  font-weight: 700;
  color: var(--dc3d-text, #d4ecff);
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.4);
}
.wn-pond__label {
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
