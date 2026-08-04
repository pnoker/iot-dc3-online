<script setup lang="ts">
/** 干线绿波时距图(纯 SVG):横轴时间,纵轴路口桩号,绿波带宽斜带 + 路口通过点。 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'
const {t} = useI18n()
const band = useDomainSeries({baseline: 42, unit: 's', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 60), cycleAmp: 0.12, noiseAmp: 1.5}, {seed: 3, window: 2, intervalMs: 3000})
const intersections = ['I-1', 'I-2', 'I-3', 'I-4', 'I-5']
const bandWidth = computed(() => (band.current.value / 60) * 80)
const at = computed(() => t('干线绿波时距图', 'Green wave time-space diagram'))
</script>
<template>
  <div class="gwts" role="img" :aria-label="at">
    <svg viewBox="0 0 500 280" class="gwts-svg" preserveAspectRatio="xMidYMid meet">
      <g v-for="(it, i) in intersections" :key="'it'+i">
        <line :x1="50" :y1="40 + i * 48" x2="480" :y2="40 + i * 48" stroke="rgba(0,229,255,0.1)" stroke-dasharray="3 6" />
        <text x="20" :y="44 + i * 48" fill="#6b8cae" font-size="11" font-family="monospace">{{ it }}</text>
      </g>
      <polygon :points="'60,40 60,' + (40 + bandWidth) + ' 460,232 460,' + (232 - bandWidth)" fill="rgba(22,199,132,0.18)" stroke="rgba(22,199,132,0.5)" stroke-width="1.5" />
      <circle v-for="(it, i) in intersections" :key="'gp'+i" :cx="60 + i * 100" :cy="40 + i * 48" r="4" fill="#16c784" stroke="#fff" stroke-width="1" />
      <text x="250" y="20" text-anchor="middle" fill="#16c784" font-size="11" font-family="monospace">{{ t('绿波带宽', 'Bandwidth') }}: {{ band.current.value.toFixed(0) }}s</text>
    </svg>
  </div>
</template>
<style scoped>
.gwts { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.gwts-svg { width: 100%; height: 100%; max-height: 100%; }
</style>
