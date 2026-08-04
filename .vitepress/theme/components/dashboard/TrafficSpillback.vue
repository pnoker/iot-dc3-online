<script setup lang="ts">
/**
 * 关键路口排队溢出度水位球组:DvWaterLevelPond ×4。
 * 溢出度 = 排队长度/路段长度(%)。缓变(intervalMs 6s),config 仅整数值变才换新引用防闪。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const NEON: [string, string] = ['#00e5ff', '#2b9bff']

const raw = useDomainSeries({baseline: 88, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90), cycleAmp: 0.06, noiseAmp: 0.4}, {intervalMs: 6000, window: 20, seed: 11}).current
const fin = useDomainSeries({baseline: 62, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90 + 1.6), cycleAmp: 0.08, noiseAmp: 0.4}, {intervalMs: 6000, window: 20, seed: 23}).current
const mid = useDomainSeries({baseline: 74, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 75 + 3.1), cycleAmp: 0.07, noiseAmp: 0.3}, {intervalMs: 6000, window: 20, seed: 37}).current
const coast = useDomainSeries({baseline: 45, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 82 + 4.7), cycleAmp: 0.09, noiseAmp: 0.4}, {intervalMs: 6000, window: 20, seed: 53}).current

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))
const META = [
  {key: 'renmin', label: () => t('人民路口', 'Renmin'), src: raw},
  {key: 'jiefang', label: () => t('解放路口', 'Jiefang'), src: fin},
  {key: 'zhongshan', label: () => t('中 山口', 'Zhongshan'), src: mid},
  {key: 'binhai', label: () => t('滨海路口', 'Binhai'), src: coast},
]

const tanks = META.map((m) => {
  let last = -1, cfg: any = null
  const config = computed(() => {
    const v = clamp(m.src.value)
    if (v !== last) {last = v; cfg = {data: [v], shape: 'round', colors: NEON, formatter: '{value}%', waveHeight: 10, waveNum: 2, digitalFlopStyle: {fontSize: 11, fill: '#d4ecff'}, digitalFlopToFixed: 0}}
    return cfg
  })
  return {key: m.key, label: computed(m.label), value: computed(() => clamp(m.src.value)), config}
})

const accessibleTitle = computed(() => t('关键路口排队溢出度', 'Critical intersection queue spillback'))
</script>

<template>
  <div class="spill" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div v-for="tk in tanks" :key="tk.key" class="spill-row">
        <div class="spill-pond"><DvWaterLevelPond :config="tk.config.value" style="width:100%;height:100%" /></div>
        <div class="spill-label">{{ tk.label.value }}</div>
      </div>
      <template #fallback>
        <div v-for="tk in tanks" :key="tk.key" class="spill-row">
          <div class="spill-pond spill-pond--fb"><span class="spill-pct">{{ tk.value.value }}%</span></div>
          <div class="spill-label">{{ tk.label.value }}</div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.spill {width: 100%; height: 100%; display: grid; grid-template-rows: repeat(4, 1fr); gap: 8px; align-content: stretch; box-sizing: border-box;}
.spill-row {display: flex; flex-direction: row; align-items: center; gap: 12px; min-width: 0;}
.spill-pond {width: 52px; height: 52px; flex-shrink: 0;}
.spill-pond--fb {display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid var(--dc3d-neon-cyan, #00e5ff); box-shadow: inset 0 0 18px rgba(0,229,255,0.25); background: radial-gradient(circle at 50% 120%, rgba(43,155,255,0.35), rgba(8,22,45,0.6));}
.spill-pct {font-size: 15px; font-weight: 700; color: var(--dc3d-text, #d4ecff);}
.spill-label {font-size: 12px; letter-spacing: 0.5px; color: var(--dc3d-text-dim, #6b8cae); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;}
</style>
