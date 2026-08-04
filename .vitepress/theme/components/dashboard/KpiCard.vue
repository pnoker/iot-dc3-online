<script setup lang="ts">
import {ref, watch, computed, onMounted} from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    unit?: string
    delta?: number
    trend?: number[]
    severity?: 'normal' | 'info' | 'warning' | 'critical'
    decimals?: number
  }>(),
  {severity: 'normal'},
)

const display = ref(props.value)
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = matchMedia('(prefers-reduced-motion: reduce)').matches
})
watch(
  () => props.value,
  (to, from) => {
    if (reducedMotion.value || from === undefined) {
      display.value = to
      return
    }
    const start = performance.now()
    const dur = 300
    const a = from ?? to
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      display.value = a + (to - a) * (1 - Math.pow(1 - p, 3))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  },
)

const fmt = computed(() => {
  const d = props.decimals ?? (Math.abs(props.value) >= 100 ? 0 : 1)
  return display.value.toLocaleString(undefined, {minimumFractionDigits: d, maximumFractionDigits: d})
})
const sparkPath = computed(() => {
  const pts = props.trend ?? []
  if (pts.length < 2) return ''
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const range = max - min || 1
  return pts.map((v, i) => `${(i / (pts.length - 1)) * 100},${14 - ((v - min) / range) * 12}`).join(' ')
})
const sevColor = computed(() => {
  const m: Record<string, string> = {
    normal: 'var(--dc3d-neon-green)',
    info: 'var(--dc3d-neon-cyan)',
    warning: 'var(--dc3d-neon-amber)',
    critical: 'var(--dc3d-neon-red)',
  }
  return m[props.severity]
})
const deltaUp = computed(() => (props.delta ?? 0) >= 0)
</script>

<template>
  <div class="dc3d-panel kpi" :style="{'--sev': sevColor}">
    <i class="dc3d-corner tl" />
    <i class="dc3d-corner br" />
    <span class="kpi-bar" />
    <div class="kpi-label">{{ label }}</div>
    <div class="kpi-value" :style="{color: sevColor}">
      <span class="kpi-num">{{ fmt }}</span>
      <span v-if="unit" class="kpi-unit">{{ unit }}</span>
      <span v-if="delta !== undefined" class="kpi-delta" :class="{up: deltaUp, dn: !deltaUp}">
        {{ deltaUp ? '▲' : '▼' }} {{ Math.abs(delta).toFixed(1) }}%
      </span>
    </div>
    <svg v-if="trend && trend.length > 1" class="kpi-spark" viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient :id="`g${label.length}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="sevColor" stop-opacity="0.5" />
          <stop offset="100%" :stop-color="sevColor" stop-opacity="0" />
        </linearGradient>
      </defs>
      <polyline :points="sparkPath" fill="none" :stroke="sevColor" stroke-width="1.5" stroke-linejoin="round" />
    </svg>
  </div>
</template>

<style scoped>
.kpi {
  padding: 12px 14px 10px;
  background: var(--dc3d-panel-bg-2);
  overflow: hidden;
}
.kpi-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--sev);
  box-shadow: 0 0 10px var(--sev);
}
.kpi-label {
  color: var(--dc3d-text-dim);
  font-size: 12px;
  letter-spacing: 0.5px;
}
.kpi-value {
  font-size: clamp(22px, 2.4vw, 30px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 2px;
  text-shadow: 0 0 12px currentColor;
}
.kpi-num {
  color: var(--sev);
}
.kpi-unit {
  font-size: 12px;
  font-weight: 600;
  color: var(--dc3d-text-dim);
  text-shadow: none;
}
.kpi-delta {
  font-size: 11px;
  font-weight: 600;
  margin-left: auto;
  text-shadow: none;
}
.kpi-delta.up {
  color: var(--dc3d-neon-green);
}
.kpi-delta.dn {
  color: var(--dc3d-neon-red);
}
.kpi-spark {
  width: 100%;
  height: 18px;
  margin-top: 4px;
  opacity: 0.9;
}
</style>
