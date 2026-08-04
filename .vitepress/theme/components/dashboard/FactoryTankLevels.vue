<script setup lang="ts">
/**
 * 工厂储罐/仓位水位球组:DvWaterLevelPond ×4 横排。
 * 原料仓 / 成品库 / 压缩空气 / 冷却水 —— 工厂储罐类指标天然适配水位球。
 * 每个水位百分比由 useDomainSeries 缓变(baseline 45-75 + 小 cycleAmp),
 * clamp 到 [0,100] 业务区间,绝不飙到几百%。config 依赖 current 自动重渲。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 霓虹青蓝波纹(暗底大屏统一配色)
const NEON: [string, string] = ['#00e5ff', '#2b9bff']

// 四个储罐:缓慢漂移。⚠ 水位球更新频率拉大到 6s(储罐本就缓变),
// 且 config 仅在整数值变化时才换新对象——否则每 tick 换 config 引用会让 DvWaterLevelPond
// 整个重建、波浪动画反复重置,视觉上"一闪一闪"(阶段2踩坑)。
const raw = useDomainSeries(
  {baseline: 68, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90), cycleAmp: 0.08, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 11},
)
const finished = useDomainSeries(
  {baseline: 52, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 90 + 1.6), cycleAmp: 0.1, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 23},
)
const air = useDomainSeries(
  {baseline: 74, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 75 + 3.1), cycleAmp: 0.06, noiseAmp: 0.3},
  {intervalMs: 6000, window: 20, seed: 37},
)
const cooling = useDomainSeries(
  {baseline: 61, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 82 + 4.7), cycleAmp: 0.07, noiseAmp: 0.4},
  {intervalMs: 6000, window: 20, seed: 53},
)

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

const TANK_META = [
  {key: 'raw', label: () => t('原料仓', 'Raw Silo'), src: raw},
  {key: 'finished', label: () => t('成品库', 'Finished Goods'), src: finished},
  {key: 'air', label: () => t('压缩空气', 'Compressed Air'), src: air},
  {key: 'cooling', label: () => t('冷却水', 'Cooling Water'), src: cooling},
]

// 每罐一个独立 computed config:整数值不变则返回同一引用(WaterLevelPond 不重建、动画不闪)
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

const accessibleTitle = computed(() =>
  t('储罐与仓位实时水位', 'Real-time tank & bin levels'),
)
</script>

<template>
  <div class="dc3d-tanks" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div
        v-for="tk in tanks"
        :key="tk.key"
        class="dc3d-tank"
      >
        <div class="dc3d-tank__pond">
          <DvWaterLevelPond :config="tk.config.value" style="width: 100%; height: 100%" />
        </div>
        <div class="dc3d-tank__label">{{ tk.label.value }}</div>
      </div>

      <!-- SSR / 降级 fallback:纯 DOM 环形进度,无 DataV 依赖 -->
      <template #fallback>
        <div
          v-for="tk in tanks"
          :key="tk.key"
          class="dc3d-tank"
        >
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
/* 竖排:每行一个储罐,球在左 + 标签在右,窄面板更省宽 */
.dc3d-tank {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
  gap: 12px;
}
.dc3d-tank__pond {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}
/* fallback:霓虹描边圆 + 百分比,无外部依赖 */
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
  font-size: 16px;
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