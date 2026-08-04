<script setup lang="ts">
/**
 * 冷库冷媒量球组:DvWaterLevelPond ×2 竖排(冷藏系统 / 冷冻系统 冷媒充注量%)。
 * 缓慢漂移(baseline 68-82 + 小 cycleAmp),clamp [0,100]。
 * 整数值不变时返回同一 config 引用,避免水位球重建导致波浪闪烁。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const CHILLED: [string, string] = ['#00e5ff', '#2b9bff']
const FROZEN: [string, string] = ['#2b9bff', '#7c4dff']

const chilled = useDomainSeries(
  {baseline: 81, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 95), cycleAmp: 0.05, noiseAmp: 0.3},
  {intervalMs: 6000, window: 20, seed: 411},
)
const frozen = useDomainSeries(
  {baseline: 69, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 88 + 1.8), cycleAmp: 0.06, noiseAmp: 0.3},
  {intervalMs: 6000, window: 20, seed: 412},
)

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const META = [
  {key: 'chilled', label: () => t('冷藏制冷', 'Chilled Unit'), src: chilled, colors: CHILLED},
  {key: 'frozen', label: () => t('冷冻制冷', 'Frozen Unit'), src: frozen, colors: FROZEN},
]

const tanks = META.map((m) => {
  let last = -1
  let cfg: any = null
  const config = computed(() => {
    const v = clamp(m.src.current.value)
    if (v !== last) {
      last = v
      cfg = {data: [v], shape: 'round', colors: m.colors, formatter: '{value}%', waveHeight: 10, waveNum: 2, digitalFlopStyle: {fontSize: 11, fill: '#d4ecff'}, digitalFlopToFixed: 0}
    }
    return cfg
  })
  return {key: m.key, label: computed(m.label), value: computed(() => clamp(m.src.current.value)), config}
})

const accessibleTitle = computed(() => t('冷藏与冷冻系统冷媒充注量', 'Chilled and frozen refrigerant charge level'))
</script>

<template>
  <div class="ponds" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div
        v-for="tk in tanks"
        :key="tk.key"
        class="pond"
      >
        <div class="pond__ball">
          <DvWaterLevelPond :config="tk.config.value" style="width: 100%; height: 100%" />
        </div>
        <div class="pond__label">{{ tk.label.value }}</div>
      </div>

      <template #fallback>
        <div
          v-for="tk in tanks"
          :key="tk.key"
          class="pond"
        >
          <div class="pond__ball pond__ball--fb">
            <span class="pond__pct">{{ tk.value.value }}%</span>
          </div>
          <div class="pond__label">{{ tk.label.value }}</div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.ponds {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  gap: 8px;
  align-content: stretch;
  box-sizing: border-box;
}
.pond {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
  gap: 10px;
}
.pond__ball {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}
.pond__ball--fb {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid var(--dc3d-neon-cyan, #00e5ff);
  box-shadow: inset 0 0 18px rgba(0, 229, 255, 0.25), 0 0 10px rgba(0, 229, 255, 0.2);
  background: radial-gradient(circle at 50% 120%, rgba(43, 155, 255, 0.35), rgba(8, 22, 45, 0.6));
}
.pond__pct {
  font-size: 15px;
  font-weight: 700;
  color: var(--dc3d-text, #d4ecff);
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.4);
}
.pond__label {
  font-size: 11px;
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
