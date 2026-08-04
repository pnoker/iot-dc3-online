<script setup lang="ts">
/**
 * 站点在线 + 优良天 + 断面水质达标(DataV 子面板)。
 * 上排:DvPercentPond ×2(站点在线率 / 优良天比例)。
 * 下排:DvWaterLevelPond ×2(重点监测断面水质达标率,水位球直观表达)。
 * 百分比类小 cycleAmp,clamp [0,100];水位球 config 整数值不变时复用引用防闪烁。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const pct = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

// 两个 PercentPond。
const online = useDomainSeries(
  {baseline: 97.8, unit: '%', cycle: (s) => Math.sin(s / 150), cycleAmp: 0.005, noiseAmp: 0.1},
  {seed: 61, window: 2},
).current
const goodDays = useDomainSeries(
  {baseline: 86.4, unit: '%', cycle: (s) => Math.sin(s / 170 + 1.2), cycleAmp: 0.01, noiseAmp: 0.18},
  {seed: 62, window: 2},
).current

interface Pond {key: string; label: () => string; src: ReturnType<typeof useDomainSeries>['current']}
const PONDS: Pond[] = [
  {key: 'wei', label: () => t('渭河断面达标', 'Wei Section'), src: useDomainSeries({baseline: 88, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 95), cycleAmp: 0.05, noiseAmp: 0.5}, {intervalMs: 6000, window: 20, seed: 63}).current},
  {key: 'ba', label: () => t('灞河断面达标', 'Ba Section'), src: useDomainSeries({baseline: 72, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 88 + 1.8), cycleAmp: 0.07, noiseAmp: 0.6}, {intervalMs: 6000, window: 20, seed: 64}).current},
]
const NEON: [string, string] = ['#00e5ff', '#2b9bff']

// 水位球:整数值不变复用 config 引用,防波浪动画重建闪烁。
const tanks = PONDS.map((m) => {
  let last = -1
  let cfg: any = null
  const config = computed(() => {
    const v = pct(m.src.value)
    if (v !== last) {
      last = v
      cfg = {data: [v], shape: 'round', colors: NEON, formatter: '{value}%', waveHeight: 10, waveNum: 2, digitalFlopStyle: {fontSize: 11, fill: '#d4ecff'}, digitalFlopToFixed: 0}
    }
    return cfg
  })
  return {key: m.key, label: computed(m.label), value: computed(() => pct(m.src.value)), config}
})

const ponds = computed(() => [
  {key: 'online', label: t('站点在线率', 'Online'), value: pct(online.value), colors: ['#00e5ff', '#2b9bff']},
  {key: 'good', label: t('优良天比例', 'Good Days'), value: pct(goodDays.value), colors: ['#00ffc6', '#00e5ff']},
])

const accessibleTitle = computed(() => t('站点在线率优良天比例与断面水质达标率', 'Station online rate, good-day ratio and section compliance'))
</script>

<template>
  <div class="esv" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div class="esv-ponds">
        <div v-for="p in ponds" :key="p.key" class="esv-pond">
          <DvPercentPond :config="{value: p.value, colors: p.colors, textColor: '#d4ecff', borderRadius: 6, formatter: '{value}%'}" />
          <span class="esv-pond-label">{{ p.label }}</span>
        </div>
      </div>

      <div class="esv-water">
        <h4 class="esv-sub">{{ t('重点断面水质达标率', 'Key Section Water Compliance') }}</h4>
        <div class="esv-water-body">
          <div v-for="tk in tanks" :key="tk.key" class="esv-tk">
            <div class="esv-ball">
              <DvWaterLevelPond :config="tk.config.value" style="width:100%;height:100%" />
            </div>
            <span class="esv-tk-label">{{ tk.label.value }}</span>
          </div>
        </div>
      </div>

      <template #fallback>
        <div class="esv-fallback">
          <div v-for="p in ponds" :key="p.key" class="esv-fb-item">
            <span class="esv-fb-label">{{ p.label }}</span>
            <span class="esv-fb-val">{{ p.value }}%</span>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.esv {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 8px;
  box-sizing: border-box;
}
.esv-ponds {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  flex: 0 0 auto;
}
.esv-pond {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.esv-pond :deep(.dv-percent-pond) {
  width: 100%;
  height: clamp(40px, 5vh, 56px);
}
.esv-pond-label {
  font-size: 12px;
  letter-spacing: 0.5px;
  color: var(--dc3d-text-dim);
  text-align: center;
}
.esv-water {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.esv-sub {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--dc3d-text);
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.2);
  flex-shrink: 0;
}
.esv-water-body {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  align-items: center;
}
.esv-tk {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.esv-ball {
  width: clamp(48px, 7vh, 64px);
  height: clamp(48px, 7vh, 64px);
}
.esv-tk-label {
  font-size: 11px;
  color: var(--dc3d-text-dim);
  text-align: center;
  white-space: nowrap;
}
.esv-fallback {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  align-content: center;
}
.esv-fb-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px;
  border: 1px solid var(--dc3d-panel-border);
  border-radius: var(--dc3d-radius);
}
.esv-fb-label {
  font-size: 11px;
  color: var(--dc3d-text-dim);
}
.esv-fb-val {
  font-size: 22px;
  font-weight: 700;
  font-family: var(--dc3d-mono, monospace);
  color: #00e5ff;
}
</style>
