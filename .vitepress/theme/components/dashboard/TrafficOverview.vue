<script setup lang="ts">
/**
 * TPI 概览:大号 TPI 数字 + 拥堵等级 + 三因子条(车速/饱和度/绿波覆盖率)。
 * TPI 0-10 五档:<2 畅通 / 2-4 基本畅通 / 4-6 轻度 / 6-8 中度 / ≥8 严重。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const NEON = {speed: '#00e5ff', vc: '#b980ff', wave: '#00e676'}

const tpiSrc = useDomainSeries({baseline: 5.6, unit: '', cycle: (s) => Math.sin(s / 95), cycleAmp: 0.12, noiseAmp: 0.18}, {seed: 11, window: 2}).current
const speedSrc = useDomainSeries({baseline: 38, unit: 'km/h', cycle: (s) => Math.sin(s / 80 + 1.1), cycleAmp: 0.08, noiseAmp: 1.4}, {seed: 22, window: 2}).current
const vcSrc = useDomainSeries({baseline: 0.82, unit: '', cycle: (s) => Math.sin(s / 90 + 3), cycleAmp: 0.06, noiseAmp: 0.012}, {seed: 55, window: 2}).current
const waveSrc = useDomainSeries({baseline: 76, unit: '%', cycle: (s) => Math.sin(s / 140 + 0.8), cycleAmp: 0.05, noiseAmp: 0.8}, {seed: 77, window: 2}).current

const tpi = computed(() => Math.max(0, Math.min(10, tpiSrc.value)))
function level(v: number) {
  if (v < 2) return {zh: '畅通', en: 'Free', color: '#16c784'}
  if (v < 4) return {zh: '基本畅通', en: 'Smooth', color: '#00e676'}
  if (v < 6) return {zh: '轻度拥堵', en: 'Light', color: '#ffb020'}
  if (v < 8) return {zh: '中度拥堵', en: 'Moderate', color: '#ff6b35'}
  return {zh: '严重拥堵', en: 'Severe', color: '#ff5252'}
}
const lv = computed(() => level(tpi.value))
const factors = computed(() => [
  {key: 'speed', name: t('平均车速', 'Speed'), value: Math.max(0, Math.min(60, speedSrc.value)).toFixed(0), pct: Math.max(0, Math.min(100, (speedSrc.value / 60) * 100)), unit: 'km/h', color: NEON.speed},
  {key: 'vc', name: t('饱和度', 'V/C'), value: vcSrc.value.toFixed(2), pct: Math.max(0, Math.min(100, vcSrc.value * 100)), unit: 'V/C', color: NEON.vc},
  {key: 'wave', name: t('绿波覆盖', 'Green Wave'), value: Math.max(0, Math.min(100, waveSrc.value)).toFixed(0), pct: Math.max(0, Math.min(100, waveSrc.value)), unit: '%', color: NEON.wave},
])
const accessibleTitle = computed(() => t(`路网拥堵指数 TPI ${tpi.value.toFixed(1)}`, `TPI ${tpi.value.toFixed(1)}`))
</script>

<template>
  <div class="overview" role="group" :aria-label="accessibleTitle">
    <div class="ov-big">
      <span class="ov-num" :style="{color: lv.color, textShadow: '0 0 18px ' + (lv.color) + 'aa'}">{{ tpi.toFixed(1) }}</span>
      <span class="ov-tag" :style="{color: lv.color, borderColor: lv.color}">{{ t(lv.zh, lv.en) }}</span>
    </div>
    <ul class="ov-factors">
      <li v-for="f in factors" :key="f.key" class="ov-factor">
        <span class="ov-fname">{{ f.name }}</span>
        <span class="ov-track"><span class="ov-fill" :style="{width: f.pct + '%', background: f.color, boxShadow: '0 0 8px ' + (f.color)}"/></span>
        <span class="ov-fval" :style="{color: f.color}">{{ f.value }}<small>{{ f.unit }}</small></span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.overview {display: flex; align-items: center; gap: 18px; width: 100%; height: 100%; padding: 0 4px;}
.ov-big {display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0;}
.ov-num {font-size: clamp(32px, 3.6vw, 48px); font-weight: 800; font-family: var(--dc3d-mono, monospace); line-height: 1;}
.ov-tag {font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 2px 8px; border: 1px solid; border-radius: 10px; white-space: nowrap;}
.ov-factors {flex: 1; list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; min-width: 0;}
.ov-factor {display: flex; align-items: center; gap: 8px; font-size: 12px;}
.ov-fname {width: 48px; color: var(--dc3d-text-dim); flex-shrink: 0;}
.ov-track {flex: 1; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden; min-width: 0;}
.ov-fill {display: block; height: 100%; border-radius: 3px; transition: width 0.5s ease;}
.ov-fval {width: 56px; text-align: right; font-weight: 700; font-family: var(--dc3d-mono, monospace); flex-shrink: 0;}
.ov-fval small {font-size: 9px; opacity: 0.7; margin-left: 2px;}
</style>
