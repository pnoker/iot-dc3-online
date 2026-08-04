<script setup lang="ts">
/**
 * 中央水仓水位球组:DvWaterLevelPond ×3 竖排。
 * 主水仓 / 副水仓 / 沉淀池 —— 矿井排水系统天然适配水位球。
 * 各仓 useDomainSeries 缓变(baseline 35-72 + 小 cycleAmp),clamp [0,100] 绝不溢出。
 * 整数值不变则 config 返回同一引用(水位球不重建、波浪动画不闪)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const NEON: [string, string] = ['#00e5ff', '#2b9bff']

// 三仓:缓慢漂移,更新频率 6s(水仓缓变)。主水仓在泵启停间波动。
const main = useDomainSeries(
  {baseline: 58, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90), cycleAmp: 0.12, noiseAmp: 0.6},
  {intervalMs: 6000, window: 20, seed: 711},
)
const aux = useDomainSeries(
  {baseline: 42, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90 + 1.6), cycleAmp: 0.14, noiseAmp: 0.6},
  {intervalMs: 6000, window: 20, seed: 712},
)
const settler = useDomainSeries(
  {baseline: 68, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 100 + 3.1), cycleAmp: 0.08, noiseAmp: 0.5},
  {intervalMs: 6000, window: 20, seed: 713},
)
const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const META = [
  {key: 'main', label: () => t('主水仓', 'Main Sump'), src: main},
  {key: 'aux', label: () => t('副水仓', 'Aux Sump'), src: aux},
  {key: 'settler', label: () => t('沉淀池', 'Settling Pond'), src: settler},
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

const accessibleTitle = computed(() => t('中央水仓主副仓与沉淀池实时水位', 'Main/aux sump and settling pond levels'))
</script>

<template>
  <div class="sumps" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div v-for="tk in tanks" :key="tk.key" class="sump">
        <div class="sump__pond">
          <DvWaterLevelPond :config="tk.config.value" style="width: 100%; height: 100%" />
        </div>
        <div class="sump__label">{{ tk.label.value }}</div>
      </div>
      <template #fallback>
        <div v-for="tk in tanks" :key="tk.key" class="sump">
          <div class="sump__pond sump__pond--fb"><span class="sump__pct">{{ tk.value.value }}%</span></div>
          <div class="sump__label">{{ tk.label.value }}</div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.sumps {width: 100%; height: 100%; display: grid; grid-template-rows: repeat(3, 1fr); gap: 8px; align-content: stretch; box-sizing: border-box;}
.sump {display: flex; flex-direction: row; align-items: center; justify-content: flex-start; min-width: 0; gap: 12px;}
.sump__pond {width: 52px; height: 52px; flex-shrink: 0;}
.sump__pond--fb {display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid #00e5ff; box-shadow: inset 0 0 18px rgba(0,229,255,0.25), 0 0 10px rgba(0,229,255,0.2); background: radial-gradient(circle at 50% 120%, rgba(43,155,255,0.35), rgba(8,22,45,0.6));}
.sump__pct {font-size: 15px; font-weight: 700; color: #d4ecff; text-shadow: 0 0 6px rgba(0,229,255,0.4);}
.sump__label {font-size: 12px; letter-spacing: 0.5px; color: var(--dc3d-text-dim); text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;}
</style>
