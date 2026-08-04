<script setup lang="ts">
/**
 * 生态环境综合指数概览:大号综合环境健康指数 + 三因子进度条。
 * 大气优良率(空气)/ 水质达标率(地表水 GB3838)/ 污染源达标(CEMS 排放)。
 * 复用 OeeRing / WaterOverview 范式:复合指数(高为优)+ 三分解进度条。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const NEON = {air: '#00e676', water: '#00e5ff', source: '#b388ff'}

// 三因子:大气优良率(优+良天数占比)、水质达标率(Ⅲ类及以上比例)、污染源达标率。
// 用乘性慢周期,稳定高位区间。
const airGood = useDomainSeries(
  {baseline: 86, unit: '%', cycle: (s) => Math.sin(s / 140), cycleAmp: 0.03, noiseAmp: 0.5},
  {seed: 71, window: 2},
).current
const waterRate = useDomainSeries(
  {baseline: 91, unit: '%', cycle: (s) => Math.sin(s / 155 + 1.3), cycleAmp: 0.02, noiseAmp: 0.4},
  {seed: 83, window: 2},
).current
const sourceRate = useDomainSeries(
  {baseline: 94.6, unit: '%', cycle: (s) => Math.sin(s / 170 + 2.6), cycleAmp: 0.012, noiseAmp: 0.3},
  {seed: 97, window: 2},
).current

const clampPct = (v: number) => Math.max(60, Math.min(99.9, v))
const air = computed(() => clampPct(airGood.value))
const water = computed(() => clampPct(waterRate.value))
const source = computed(() => clampPct(sourceRate.value))
// 综合环境健康指数 = 三因子几何平均(权重均衡)。
const health = computed(() => Math.cbrt((air.value * water.value * source.value) / 10000) * 100)

const factors = computed(() => [
  {key: 'air', name: t('大气优良率', 'Air Good'), value: air.value, color: NEON.air},
  {key: 'water', name: t('水质达标率', 'Water'), value: water.value, color: NEON.water},
  {key: 'source', name: t('污染源达标', 'Source'), value: source.value, color: NEON.source},
])
const accessibleTitle = computed(() =>
  t(`生态环境健康指数 ${health.value.toFixed(1)}`, `Eco Health Index ${health.value.toFixed(1)}`),
)
</script>

<template>
  <div class="overview" role="group" :aria-label="accessibleTitle">
    <div class="overview__big">
      <span class="overview__num">{{ health.toFixed(1) }}</span>
      <span class="overview__pct">%</span>
      <span class="overview__tag">{{ t('健康', 'HEALTH') }}</span>
    </div>
    <ul class="overview__factors">
      <li v-for="f in factors" :key="f.key" class="overview__factor">
        <span class="overview__fname">{{ f.name }}</span>
        <span class="overview__track">
          <span
            class="overview__fill"
            :style="{width: f.value + '%', background: f.color, boxShadow: '0 0 8px ' + (f.color)}"
          />
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
  color: #00e676;
  text-shadow: 0 0 18px rgba(0, 230, 118, 0.7);
  line-height: 1;
}
.overview__pct {
  font-size: 18px;
  color: #00e676;
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
