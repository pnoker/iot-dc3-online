<script setup lang="ts">
/**
 * 楼宇 IEQ(室内环境质量)综合指数:大号指数 + 三因子进度条。
 * IEQ = 室温达标 ×0.4 + 空气(CO₂)达标 ×0.35 + 空间利用率 ×0.25。
 * 3 路 useDomainSeries(乘性慢周期),稳定在业务区间。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const NEON = {temp: '#00e5ff', air: '#39ff9e', occ: '#b388ff'}

const tempRate = useDomainSeries({baseline: 92, unit: '%', cycle: (s) => Math.sin(s / 140), cycleAmp: 0.03, noiseAmp: 0.5}, {seed: 71, window: 2}).current
const airRate = useDomainSeries({baseline: 88, unit: '%', cycle: (s) => Math.sin(s / 155 + 1.3), cycleAmp: 0.03, noiseAmp: 0.5}, {seed: 83, window: 2}).current
const occRate = useDomainSeries({baseline: 76, unit: '%', cycle: (s) => Math.sin(s / 170 + 2.6), cycleAmp: 0.04, noiseAmp: 0.6}, {seed: 97, window: 2}).current

const clampPct = (v: number) => Math.max(0, Math.min(99.9, v))
const temp = computed(() => clampPct(tempRate.value))
const air = computed(() => clampPct(airRate.value))
const occ = computed(() => clampPct(occRate.value))
const ieq = computed(() => temp.value * 0.4 + air.value * 0.35 + occ.value * 0.25)

const factors = computed(() => [
  {key: 'temp', name: t('室温达标', 'Temp'), value: temp.value, color: NEON.temp},
  {key: 'air', name: t('空气达标', 'Air'), value: air.value, color: NEON.air},
  {key: 'occ', name: t('空间利用', 'Occ.'), value: occ.value, color: NEON.occ},
])
const accessibleTitle = computed(() => t(`室内环境综合指数 ${ieq.value.toFixed(1)}`, `IEQ index ${ieq.value.toFixed(1)}`))
</script>

<template>
  <div class="ieq" role="group" :aria-label="accessibleTitle">
    <div class="ieq__big">
      <span class="ieq__num">{{ ieq.toFixed(1) }}</span>
      <span class="ieq__tag">IEQ</span>
    </div>
    <ul class="ieq__factors">
      <li v-for="f in factors" :key="f.key" class="ieq__factor">
        <span class="ieq__fname">{{ f.name }}</span>
        <span class="ieq__track">
          <span class="ieq__fill" :style="{width: f.value + '%', background: f.color, boxShadow: '0 0 8px ' + (f.color)}" />
        </span>
        <span class="ieq__fval" :style="{color: f.color}">{{ f.value.toFixed(1) }}%</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ieq {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  height: 100%;
  padding: 0 6px;
}
.ieq__big {
  display: flex;
  align-items: baseline;
  gap: 2px;
  position: relative;
  flex-shrink: 0;
}
.ieq__num {
  font-size: clamp(34px, 4vw, 52px);
  font-weight: 800;
  font-family: var(--dc3d-mono, monospace);
  color: #00e5ff;
  text-shadow: 0 0 18px rgba(0, 229, 255, 0.7);
  line-height: 1;
}
.ieq__tag {
  position: absolute;
  bottom: -14px;
  left: 2px;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--dc3d-text-dim);
  font-family: var(--dc3d-mono, monospace);
}
.ieq__factors {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.ieq__factor {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.ieq__fname {
  width: 48px;
  color: var(--dc3d-text-dim);
  flex-shrink: 0;
}
.ieq__track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
  min-width: 0;
}
.ieq__fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.ieq__fval {
  width: 44px;
  text-align: right;
  font-weight: 700;
  font-family: var(--dc3d-mono, monospace);
  flex-shrink: 0;
}
</style>
