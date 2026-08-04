<script setup lang="ts">
/**
 * 单产线工艺流向拓扑(纯 SVG,布局完全可控:节点居中、标签必显、连线流动)。
 * 6 工位:上料→CNC→装配→气密→外观→包装。节点色=设备状态(useDomainSeries 周期驱动),
 * 连线用 stroke-dashoffset 动画表在制品流动。色盲冗余:状态叠字形(▶/⏸/✕)。
 */
import {computed, ref, onMounted} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = !import.meta.env.SSR && matchMedia('(prefers-reduced-motion: reduce)').matches
})

const STEPS = [
  {key: 'load', zh: '上料', en: 'Loading', seed: 100, faultRate: 0},
  {key: 'cnc', zh: 'CNC', en: 'CNC', seed: 113, faultRate: 1 / 180},
  {key: 'asm', zh: '装配', en: 'Assembly', seed: 126, faultRate: 0},
  {key: 'leak', zh: '气密', en: 'Leak', seed: 139, faultRate: 1 / 150},
  {key: 'vis', zh: '外观', en: 'Visual', seed: 152, faultRate: 0},
  {key: 'pack', zh: '包装', en: 'Packing', seed: 165, faultRate: 0},
]

const currents = STEPS.map((s, i) =>
  useDomainSeries(
    {
      baseline: 82,
      unit: '%',
      cycleMode: 'multiplicative',
      cycle: (t: number) => Math.sin((t + i * 25) / 60),
      cycleAmp: 0.1,
      noiseAmp: 3,
      events: s.faultRate > 0 ? [{rate: s.faultRate, type: 'step', size: -40, duration: 20}] : [],
    },
    {intervalMs: 2000, window: 2, seed: s.seed},
  ).current,
)

const STATUS_COLOR = {running: '#16c784', idle: '#6b8cae', down: '#ff5252'}
const STATUS_GLYPH = {running: '▶', idle: '⏸', down: '✕'}
function statusOf(oee: number): 'running' | 'idle' | 'down' {
  return oee >= 68 ? 'running' : oee >= 45 ? 'idle' : 'down'
}

const nodes = computed(() =>
  STEPS.map((s, i) => {
    const oee = Math.max(0, Math.min(100, Math.round(currents[i].value)))
    const status = statusOf(oee)
    return {key: s.key, name: t(s.zh, s.en), oee, status, color: STATUS_COLOR[status], glyph: STATUS_GLYPH[status]}
  }),
)
const accessibleTitle = computed(() => t('单产线工艺流向拓扑', 'Process flow topology'))
</script>

<template>
  <div class="topo" role="img" :aria-label="accessibleTitle">
    <div v-for="(n, i) in nodes" :key="n.key" class="topo-node">
      <!-- 连线(除第一个节点外,画到前一个节点) -->
      <span v-if="i > 0" class="topo-link" :class="{still: reducedMotion}" aria-hidden="true" />
      <span class="topo-circle" :style="{'--c': n.color}">
        <span class="topo-glyph">{{ n.glyph }}</span>
      </span>
      <span class="topo-name">{{ n.name }}</span>
      <span class="topo-oee" :style="{color: n.color}">{{ n.oee }}%</span>
    </div>
  </div>
</template>

<style scoped>
.topo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  box-sizing: border-box;
}
.topo-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
/* 连线:从当前节点圆心向左连到上一节点,流动虚线 */
.topo-link {
  position: absolute;
  top: 22px; /* 对齐圆心 */
  right: 50%;
  width: 100%;
  height: 2px;
  background: repeating-linear-gradient(90deg, var(--dc3d-neon-cyan, #00e5ff) 0 6px, transparent 6px 12px);
  background-size: 12px 2px;
  opacity: 0.6;
  animation: topo-flow 0.8s linear infinite;
}
.topo-link.still {
  animation: none;
}
@keyframes topo-flow {
  to {
    background-position: 12px 0;
  }
}
.topo-circle {
  position: relative;
  z-index: 1;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--c) 70%, #fff), var(--c));
  box-shadow: 0 0 14px var(--c), inset 0 0 8px rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.topo-glyph {
  color: #fff;
  font-size: 14px;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
}
.topo-name {
  font-size: 12px;
  color: var(--dc3d-text, #d4ecff);
  white-space: nowrap;
  margin-top: 2px;
}
.topo-oee {
  font-size: 12px;
  font-weight: 700;
  font-family: var(--dc3d-mono, monospace);
}
</style>
