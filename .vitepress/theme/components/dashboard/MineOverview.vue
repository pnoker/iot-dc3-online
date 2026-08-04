<script setup lang="ts">
/**
 * 瓦斯安全态势:大号 CH₄ %vol 数字 + 法定安全等级 + 三因子条
 * (井下人数 / 通风合格率 / 设备开机率)。
 * 等级按《煤矿安全规程》瓦斯体积比阈值:<0.5 安全 / 0.5-1.0 关注 /
 * 1.0-1.5 报警(断电准备) / ≥1.5 危险(断电撤人)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const NEON = {ppl: '#00e676', vent: '#00e5ff', avail: '#2b9bff'}

// 工作面回风隅角瓦斯(全矿最高代表测点),偶发阶跃式上行(落煤瓦斯涌出)
const gasSrc = useDomainSeries(
  {baseline: 0.62, unit: '%vol', cycle: (s) => Math.sin(s / 90), cycleAmp: 0.18, noiseAmp: 0.03, events: [{rate: 1 / 60, type: 'step', size: 0.32, duration: 20}]},
  {seed: 11, window: 2},
).current
const pplSrc = useDomainSeries({baseline: 186, unit: '人', cycle: (s) => Math.sin(s / 70 + 1.1), cycleAmp: 0.04, noiseAmp: 2.4}, {seed: 22, window: 2}).current
const ventSrc = useDomainSeries({baseline: 96, unit: '%', cycle: (s) => Math.sin(s / 130 + 0.8), cycleAmp: 0.02, noiseAmp: 0.6}, {seed: 77, window: 2}).current
const availSrc = useDomainSeries({baseline: 88.5, unit: '%', cycle: (s) => Math.sin(s / 140 + 3.0), cycleAmp: 0.03, noiseAmp: 0.5}, {seed: 55, window: 2}).current

const gas = computed(() => Math.max(0, gasSrc.value))
function level(v: number) {
  if (v < 0.5) return {zh: '安全', en: 'Safe', color: '#16c784'}
  if (v < 1.0) return {zh: '关注', en: 'Watch', color: '#ffb020'}
  if (v < 1.5) return {zh: '报警', en: 'Alarm', color: '#ff6b35'}
  return {zh: '危险', en: 'Danger', color: '#ff5252'}
}
const lv = computed(() => level(gas.value))
const factors = computed(() => [
  {key: 'ppl', name: t('井下人数', 'Staff'), value: Math.max(0, pplSrc.value).toFixed(0), pct: Math.max(0, Math.min(100, (pplSrc.value / 280) * 100)), unit: t('人', 'ppl'), color: NEON.ppl},
  {key: 'vent', name: t('通风合格', 'Vent.'), value: Math.max(0, Math.min(100, ventSrc.value)).toFixed(0), pct: Math.max(0, Math.min(100, ventSrc.value)), unit: '%', color: NEON.vent},
  {key: 'avail', name: t('开机率', 'Avail.'), value: Math.max(0, Math.min(100, availSrc.value)).toFixed(1), pct: Math.max(0, Math.min(100, availSrc.value)), unit: '%', color: NEON.avail},
])
const accessibleTitle = computed(() => t('瓦斯浓度安全态势', 'Gas concentration safety posture'))
</script>

<template>
  <div class="overview" role="group" :aria-label="accessibleTitle">
    <div class="ov-big">
      <span class="ov-num" :style="{color: lv.color, textShadow: '0 0 18px ' + (lv.color) + 'aa'}">{{ gas.toFixed(2) }}</span>
      <span class="ov-unit">%vol</span>
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
.ov-big {display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;}
.ov-num {font-size: clamp(28px, 3.2vw, 42px); font-weight: 800; font-family: var(--dc3d-mono, monospace); line-height: 1;}
.ov-unit {font-size: 11px; color: var(--dc3d-text-dim); letter-spacing: 1px;}
.ov-tag {font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 2px 8px; border: 1px solid; border-radius: 10px; white-space: nowrap; margin-top: 2px;}
.ov-factors {flex: 1; list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; min-width: 0;}
.ov-factor {display: flex; align-items: center; gap: 8px; font-size: 12px;}
.ov-fname {width: 48px; color: var(--dc3d-text-dim); flex-shrink: 0;}
.ov-track {flex: 1; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden; min-width: 0;}
.ov-fill {display: block; height: 100%; border-radius: 3px; transition: width 0.5s ease;}
.ov-fval {width: 56px; text-align: right; font-weight: 700; font-family: var(--dc3d-mono, monospace); flex-shrink: 0;}
.ov-fval small {font-size: 9px; opacity: 0.7; margin-left: 2px;}
</style>
