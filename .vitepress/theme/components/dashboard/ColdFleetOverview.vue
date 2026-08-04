<script setup lang="ts">
/**
 * 温控合规概览:大号综合温控合规指数 + 三因子进度条
 * (冷藏合规 / 冷冻合规 / 恒温合规)。复用 OeeRing/Overview 范式:几何平均。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const NEON = {chilled: '#00e5ff', frozen: '#2b9bff', constant: '#00e676'}

// 三温区合规率,乘性慢周期,稳定 90-99.9% 区间。
const chilled = useDomainSeries({baseline: 97.5, unit: '%', cycle: (s) => Math.sin(s / 140), cycleAmp: 0.012, noiseAmp: 0.4}, {seed: 701, window: 2}).current
const frozen = useDomainSeries({baseline: 98.8, unit: '%', cycle: (s) => Math.sin(s / 155 + 1.3), cycleAmp: 0.008, noiseAmp: 0.3}, {seed: 702, window: 2}).current
const constant = useDomainSeries({baseline: 96.2, unit: '%', cycle: (s) => Math.sin(s / 170 + 2.6), cycleAmp: 0.014, noiseAmp: 0.4}, {seed: 703, window: 2}).current

const clampPct = (v: number) => Math.max(60, Math.min(99.9, v))
const ch = computed(() => clampPct(chilled.value))
const fr = computed(() => clampPct(frozen.value))
const cn = computed(() => clampPct(constant.value))
// 综合温控合规指数 = 三温区几何平均
const index = computed(() => Math.cbrt((ch.value * fr.value * cn.value) / 10000) * 100)

const factors = computed(() => [
  {key: 'chilled', name: t('冷藏合规', 'Chilled'), value: ch.value, color: NEON.chilled},
  {key: 'frozen', name: t('冷冻合规', 'Frozen'), value: fr.value, color: NEON.frozen},
  {key: 'constant', name: t('恒温合规', 'Constant'), value: cn.value, color: NEON.constant},
])
const accessibleTitle = computed(() => t(`温控合规指数 ${index.value.toFixed(1)}`, `Thermal Compliance Index ${index.value.toFixed(1)}`))
</script>

<template>
  <div class="overview" role="group" :aria-label="accessibleTitle">
    <div class="overview__big">
      <span class="overview__num">{{ index.toFixed(1) }}</span>
      <span class="overview__pct">%</span>
      <span class="overview__tag">{{ t('合规', 'CCI') }}</span>
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
  width: 52px;
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
