<script setup lang="ts">
/**
 * 潮汐窗口:DvWaterLevelPond 潮位 + 乘潮通航窗口状态。
 * 潮位用半日潮正弦近似(12.4h 周期),映射到 0-100%(相对潮差)。
 * 潮位 ≥75% 视为高潮窗口(乘潮通航开放),否则窗口关闭。
 * ⚙️ WaterLevelPond 整数值不变则 config 返回同一引用,防波浪动画重置闪屏。
 */
import {computed, ref} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 潮位:0-100,慢正弦(模拟半日潮)
const tideSrc = useDomainSeries(
  {baseline: 55, unit: '%', cycle: (s) => Math.sin(s / 200), cycleAmp: 0.42, noiseAmp: 1.2},
  {seed: 701, window: 2, intervalMs: 2000},
)
const tide = computed(() => Math.max(0, Math.min(100, Math.round(tideSrc.current.value))))

const windowOpen = computed(() => tide.value >= 75)
const windowState = computed(() =>
  windowOpen.value
    ? {zh: '乘潮窗口开放', en: 'Tidal window OPEN', color: '#00e676'}
    : {zh: '窗口关闭', en: 'Window closed', color: '#ffb020'},
)
function stateText() {
  return t(windowState.value.zh, windowState.value.en)
}

// WaterLevelPond 防闪:整数不变返回同一引用
let lastTide = -1
let tideCfg: any = null
const tideConfig = computed(() => {
  const v = tide.value
  if (v !== lastTide) {
    lastTide = v
    tideCfg = {
      data: [v],
      shape: 'round',
      colors: ['#00e5ff', '#2b9bff'],
      formatter: '{value}%',
      waveHeight: 12,
      waveNum: 2,
      digitalFlopStyle: {fontSize: 14, fill: '#d4ecff'},
      digitalFlopToFixed: 0,
    }
  }
  return tideCfg
})

// 下一窗口倒计时(简化:到下一波峰的剩余)
const countdown = computed(() => {
  const remain = 75 - tide.value
  return remain > 0 ? Math.max(1, Math.round(remain * 0.6)) : 0
})

const accessibleTitle = computed(() => t('潮位与乘潮通航窗口', 'Tide level and tidal navigation window'))
</script>

<template>
  <div class="tide" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div class="tide-pond">
        <DvWaterLevelPond :config="tideConfig" style="width: 100%; height: 100%" />
      </div>
      <template #fallback>
        <div class="tide-pond tide-pond--fb"><span>{{ tide }}%</span></div>
      </template>
    </ClientOnly>
    <div class="tide-info">
      <div class="tide-state" :style="{color: windowState.color}">● {{ stateText() }}</div>
      <div v-if="!windowOpen" class="tide-cd">
        {{ t('距下次开窗约', 'Next window in ~') }} <b>{{ countdown }}</b> {{ t('分钟', 'min') }}
      </div>
      <div class="tide-hint">{{ t('半日潮 · 12.4h 周期', 'Semidiurnal tide · 12.4h cycle') }}</div>
    </div>
  </div>
</template>

<style scoped>
.tide { display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0; box-sizing: border-box; gap: 6px; }
.tide-pond { flex: 1; min-height: 0; }
.tide-pond--fb { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid #00e5ff; color: #d4ecff; font-family: var(--dc3d-mono); font-weight: 700; }
.tide-info { flex: 0 0 auto; display: flex; flex-direction: column; gap: 2px; padding: 0 6px 2px; }
.tide-state { font-size: 13px; font-weight: 700; letter-spacing: 0.5px; }
.tide-cd { font-size: 11px; color: var(--dc3d-text-dim); }
.tide-cd b { color: #ffb020; font-family: var(--dc3d-mono); }
.tide-hint { font-size: 10px; color: var(--dc3d-text-dim); opacity: 0.8; }
</style>
