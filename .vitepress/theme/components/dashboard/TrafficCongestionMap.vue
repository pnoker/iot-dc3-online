<script setup lang="ts">
/** 路网拥堵热力(纯 SVG):网格状干道按饱和度 V/C 着色(绿→黄→红),路口节点。 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'
const {t} = useI18n()
const vc = useDomainSeries({baseline: 0.82, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 50), cycleAmp: 0.15, noiseAmp: 0.06}, {seed: 1, window: 2, intervalMs: 3000})
function color(v: number) { return v < 0.7 ? '#16c784' : v < 0.9 ? '#ffb020' : '#ff5252' }
const roads = computed(() => {
  const base = vc.current.value
  const pts: any[] = []
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const v = Math.max(0.3, Math.min(1.2, base + (c - r) * 0.08))
    pts.push({x1: 60 + c * 110, y1: 60 + r * 90, x2: 60 + (c + 1) * 110, y2: 60 + r * 90, v})
  }
  for (let c = 0; c < 3; c++) for (let r = 0; r < 4; r++) {
    const v = Math.max(0.3, Math.min(1.2, base + (r + c) * 0.07))
    pts.push({x1: 60 + c * 110 + 55, y1: 60 + r * 90, x2: 60 + c * 110 + 55, y2: 60 + (r + 1) * 90, v})
  }
  return pts
})
const intersections = computed(() => {
  const arr: any[] = []
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const v = Math.max(0.3, Math.min(1.2, vc.current.value + (r * c) * 0.05))
    arr.push({x: 60 + c * 110 + 55, y: 60 + r * 90, v})
  }
  return arr
})
const at = computed(() => t('路网拥堵热力图', 'Road network congestion heatmap'))
</script>
<template>
  <div class="tcmap" role="img" :aria-label="at">
    <svg viewBox="0 0 500 320" class="tcmap-svg" preserveAspectRatio="xMidYMid meet">
      <g opacity="0.4"><rect v-for="i in 9" :key="i" :x="70 + ((i-1)%3)*110" :y="70 + Math.floor((i-1)/3)*90" width="90" height="70" rx="3" fill="rgba(43,155,255,0.04)" stroke="rgba(0,229,255,0.1)" /></g>
      <line v-for="(r, i) in roads" :key="'r'+i" :x1="r.x1" :y1="r.y1" :x2="r.x2" :y2="r.y2" :stroke="color(r.v)" :stroke-width="6" stroke-linecap="round" :opacity="0.85" />
      <circle v-for="(n, i) in intersections" :key="'n'+i" :cx="n.x" :cy="n.y" r="5" :fill="color(n.v)" stroke="#fff" stroke-width="1.5" />
    </svg>
  </div>
</template>
<style scoped>
.tcmap { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.tcmap-svg { width: 100%; height: 100%; max-height: 100%; }
</style>
