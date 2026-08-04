<script setup lang="ts">
/**
 * 楼宇水系统水箱液位组:DvWaterLevelPond ×4 竖排。
 * 冷冻水膨胀箱 / 冷却塔水盘 / 蓄冷水罐 / 补水箱 —— BA 水系统天然适配水位球。
 * 每个水位百分比由 useDomainSeries 缓变(baseline 55-76 + 小 cycleAmp),clamp [0,100]。
 * config 仅在整数值变化时才换新对象——否则每 tick 换引用会让 WaterLevelPond 重建、波浪动画闪。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const NEON: [string, string] = ['#00e5ff', '#2b9bff']

const expansion = useDomainSeries(
  {baseline: 62, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90), cycleAmp: 0.08, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 11},
)
const tower = useDomainSeries(
  {baseline: 58, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90 + 1.6), cycleAmp: 0.1, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 23},
)
const storage = useDomainSeries(
  {baseline: 74, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 75 + 3.1), cycleAmp: 0.06, noiseAmp: 0.3},
  {intervalMs: 6000, window: 20, seed: 37},
)
const makeup = useDomainSeries(
  {baseline: 68, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 82 + 4.7), cycleAmp: 0.07, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 53},
)

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const TANK_META = [
  {key: 'expansion', label: () => t('冷冻水膨胀箱', 'CHW Expansion'), src: expansion},
  {key: 'tower', label: () => t('冷却塔水盘', 'Cooling Tower'), src: tower},
  {key: 'storage', label: () => t('蓄冷水罐', 'Thermal Storage'), src: storage},
  {key: 'makeup', label: () => t('补水箱', 'Make-up Tank'), src: makeup},
]

const tanks = TANK_META.map((m) => {
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

const accessibleTitle = computed(() => t('水系统水箱实时液位', 'Real-time water tank levels'))
</script>

<template>
  <div class="dc3d-tanks" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div v-for="tk in tanks" :key="tk.key" class="dc3d-tank">
        <div class="dc3d-tank__pond">
          <DvWaterLevelPond :config="tk.config.value" style="width: 100%; height: 100%" />
        </div>
        <div class="dc3d-tank__label">{{ tk.label.value }}</div>
      </div>
      <template #fallback>
        <div v-for="tk in tanks" :key="tk.key" class="dc3d-tank">
          <div class="dc3d-tank__pond dc3d-tank__pond--fb">
            <span class="dc3d-tank__pct">{{ tk.value.value }}%</span>
          </div>
          <div class="dc3d-tank__label">{{ tk.label.value }}</div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.dc3d-tanks {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  gap: 8px;
  align-content: stretch;
  box-sizing: border-box;
}
.dc3d-tank {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
  gap: 12px;
}
.dc3d-tank__pond {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}
.dc3d-tank__pond--fb {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid var(--dc3d-neon-cyan, #00e5ff);
  box-shadow: inset 0 0 18px rgba(0, 229, 255, 0.25), 0 0 10px rgba(0, 229, 255, 0.2);
  background: radial-gradient(circle at 50% 120%, rgba(43, 155, 255, 0.35), rgba(8, 22, 45, 0.6));
}
.dc3d-tank__pct {
  font-size: 14px;
  font-weight: 700;
  color: var(--dc3d-text, #d4ecff);
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.4);
}
.dc3d-tank__label {
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
