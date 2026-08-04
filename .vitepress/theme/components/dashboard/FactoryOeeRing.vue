<script setup lang="ts">
/**
 * OEE 综合效率:大号 OEE 数字 + 三因子进度条(顶部条形面板高度有限,数字+条比环形更清晰)。
 * 3 路 useDomainSeries(乘性慢周期),稳定 90-99%。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const NEON = {avail: '#00e5ff', perf: '#39ff9e', qual: '#b388ff'}

const availability = useDomainSeries({baseline: 92, unit: '%', cycle: (s) => Math.sin(s / 140), cycleAmp: 0.03, noiseAmp: 0.5}, {seed: 71, window: 2}).current
const performance = useDomainSeries({baseline: 95, unit: '%', cycle: (s) => Math.sin(s / 155 + 1.3), cycleAmp: 0.03, noiseAmp: 0.5}, {seed: 83, window: 2}).current
const quality = useDomainSeries({baseline: 98, unit: '%', cycle: (s) => Math.sin(s / 170 + 2.6), cycleAmp: 0.02, noiseAmp: 0.4}, {seed: 97, window: 2}).current

const clampPct = (v: number) => Math.max(80, Math.min(99.9, v))
const avail = computed(() => clampPct(availability.value))
const perf = computed(() => clampPct(performance.value))
const qual = computed(() => clampPct(quality.value))
const oee = computed(() => (avail.value * perf.value * qual.value) / 10000)

const factors = computed(() => [
  {key: 'avail', name: t('可用性', 'Avail.'), value: avail.value, color: NEON.avail},
  {key: 'perf', name: t('性能', 'Perf.'), value: perf.value, color: NEON.perf},
  {key: 'qual', name: t('质量', 'Qual.'), value: qual.value, color: NEON.qual},
])
const accessibleTitle = computed(() => t(`设备综合效率 OEE ${oee.value.toFixed(1)}%`, `OEE ${oee.value.toFixed(1)}%`))
</script>

<template>
  <div class="oee" role="group" :aria-label="accessibleTitle">
    <div class="oee__big">
      <span class="oee__num">{{ oee.toFixed(1) }}</span>
      <span class="oee__pct">%</span>
      <span class="oee__tag">OEE</span>
    </div>
    <ul class="oee__factors">
      <li v-for="f in factors" :key="f.key" class="oee__factor">
        <span class="oee__fname">{{ f.name }}</span>
        <span class="oee__track">
          <span class="oee__fill" :style="{width: f.value + '%', background: f.color, boxShadow: '0 0 8px ' + (f.color)}" />
        </span>
        <span class="oee__fval" :style="{color: f.color}">{{ f.value.toFixed(1) }}%</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.oee {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  height: 100%;
  padding: 0 6px;
}
.oee__big {
  display: flex;
  align-items: baseline;
  gap: 2px;
  position: relative;
  flex-shrink: 0;
}
.oee__num {
  font-size: clamp(34px, 4vw, 52px);
  font-weight: 800;
  font-family: var(--dc3d-mono, monospace);
  color: #00e5ff;
  text-shadow: 0 0 18px rgba(0, 229, 255, 0.7);
  line-height: 1;
}
.oee__pct {
  font-size: 18px;
  color: #00e5ff;
  font-weight: 700;
}
.oee__tag {
  position: absolute;
  bottom: -14px;
  left: 2px;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--dc3d-text-dim);
  font-family: var(--dc3d-mono, monospace);
}
.oee__factors {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.oee__factor {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.oee__fname {
  width: 42px;
  color: var(--dc3d-text-dim);
  flex-shrink: 0;
}
.oee__track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
  min-width: 0;
}
.oee__fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.oee__fval {
  width: 44px;
  text-align: right;
  font-weight: 700;
  font-family: var(--dc3d-mono, monospace);
  flex-shrink: 0;
}
</style>
