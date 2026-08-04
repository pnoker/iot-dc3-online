<script setup lang="ts">
/**
 * 水肥罐 / 灌溉储水罐 水位球组:DvWaterLevelPond ×4 竖排。
 * 主水肥罐 A / 主水肥罐 B / 灌溉储水罐 / 回水收集罐 —— 灌溉流体储罐天然适配水位球。
 * 每罐 useDomainSeries 缓变(baseline 45-80 + 小 cycleAmp),clamp [0,100] 绝不溢出。
 * ⚠ 整数值不变则 config 返回同一引用(WaterLevelPond 不重建、波浪动画不闪)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 霓虹青蓝波纹(暗底大屏统一配色)
const NEON: [string, string] = ['#00e5ff', '#2b9bff']

// 四罐:缓慢漂移,更新频率 6s(流体罐缓变)
const tankA = useDomainSeries(
  {baseline: 72, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90), cycleAmp: 0.06, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 411},
)
const tankB = useDomainSeries(
  {baseline: 58, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90 + 1.6), cycleAmp: 0.08, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 412},
)
const storage = useDomainSeries(
  {baseline: 80, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 100 + 3.1), cycleAmp: 0.05, noiseAmp: 0.3},
  {intervalMs: 6000, window: 20, seed: 413},
)
const ret = useDomainSeries(
  {baseline: 41, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 80 + 4.7), cycleAmp: 0.1, noiseAmp: 0.5},
  {intervalMs: 6000, window: 20, seed: 414},
)
const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const META = [
  {key: 'tankA', label: () => t('主水肥罐 A', 'Fertig. Tank A'), src: tankA},
  {key: 'tankB', label: () => t('主水肥罐 B', 'Fertig. Tank B'), src: tankB},
  {key: 'storage', label: () => t('灌溉储水罐', 'Irrig. Storage'), src: storage},
  {key: 'return', label: () => t('回水收集罐', 'Return Tank'), src: ret},
]

// 每罐独立 computed config:整数值不变则返回同一引用(水位球不重建、动画不闪)
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

const accessibleTitle = computed(() => t('水肥罐与灌溉储水罐实时水位', 'Real-time fertigation & irrigation tank levels'))
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
  width: 52px;
  height: 52px;
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
  font-size: 15px;
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
