<script setup lang="ts">
/**
 * 管网综合健康概览:大号管网完整性指数 + 三因子进度条。
 * 三因子:管输完整性(基于内检测/阴极保护)、压力稳定(压力偏差率越小越高)、气质达标。
 * 复用 WaterOverview 范式:几何平均复合指数(高为优)+ 三分解进度条。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const NEON = {integrity: '#00e5ff', pressure: '#39ff9e', quality: '#b388ff'}

// 三因子乘性慢周期,稳定 88-99% 区间。
const integrity = useDomainSeries({baseline: 94, unit: '%', cycle: (s) => Math.sin(s / 150), cycleAmp: 0.02, noiseAmp: 0.4}, {seed: 711, window: 2}).current
const pressureStab = useDomainSeries({baseline: 97, unit: '%', cycle: (s) => Math.sin(s / 130 + 1.3), cycleAmp: 0.012, noiseAmp: 0.3}, {seed: 823, window: 2}).current
const qualRate = useDomainSeries({baseline: 99, unit: '%', cycle: (s) => Math.sin(s / 170 + 2.6), cycleAmp: 0.003, noiseAmp: 0.2}, {seed: 937, window: 2}).current

const clampPct = (v: number) => Math.max(60, Math.min(99.9, v))
const integ = computed(() => clampPct(integrity.value))
const press = computed(() => clampPct(pressureStab.value))
const qual = computed(() => clampPct(qualRate.value))
// 管网完整性指数 = 三因子几何平均
const health = computed(() => Math.cbrt((integ.value * press.value * qual.value) / 10000) * 100)

const factors = computed(() => [
  {key: 'integ', name: t('管输完整性', 'Integrity'), value: integ.value, color: NEON.integrity},
  {key: 'press', name: t('压力稳定', 'Pressure'), value: press.value, color: NEON.pressure},
  {key: 'qual', name: t('气质达标', 'Quality'), value: qual.value, color: NEON.quality},
])
const accessibleTitle = computed(() => t(`管网完整性指数 ${health.value.toFixed(1)}`, `Pipeline Integrity Index ${health.value.toFixed(1)}`))
</script>

<template>
  <div class="overview" role="group" :aria-label="accessibleTitle">
    <div class="overview__big">
      <span class="overview__num">{{ health.toFixed(1) }}</span>
      <span class="overview__pct">%</span>
      <span class="overview__tag">{{ t('完整性', 'PII') }}</span>
    </div>
    <ul class="overview__factors">
      <li v-for="f in factors" :key="f.key" class="overview__factor">
        <span class="overview__fname">{{ f.name }}</span>
        <span class="overview__track">
          <span class="overview__fill" :style="{width: f.value + '%', background: f.color, boxShadow: '0 0 8px ' + (f.color)}" />
        </span>
        <span class="overview__fval" :style="{color: f.color}">{{ f.value.toFixed(1) }}%</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.overview {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  height: 100%;
  padding: 0 6px;
}
.overview__big {
  display: flex;
  align-items: baseline;
  gap: 2px;
  position: relative;
  flex-shrink: 0;
}
.overview__num {
  font-size: clamp(34px, 4vw, 52px);
  font-weight: 800;
  font-family: var(--dc3d-mono, monospace);
  color: #00e5ff;
  text-shadow: 0 0 18px rgba(0, 229, 255, 0.7);
  line-height: 1;
}
.overview__pct {
  font-size: 18px;
  color: #00e5ff;
  font-weight: 700;
}
.overview__tag {
  position: absolute;
  bottom: -14px;
  left: 2px;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--dc3d-text-dim);
  font-family: var(--dc3d-mono, monospace);
}
.overview__factors {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.overview__factor {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.overview__fname {
  width: 64px;
  color: var(--dc3d-text-dim);
  flex-shrink: 0;
}
.overview__track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
  min-width: 0;
}
.overview__fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.overview__fval {
  width: 44px;
  text-align: right;
  font-weight: 700;
  font-family: var(--dc3d-mono, monospace);
  flex-shrink: 0;
}
</style>
