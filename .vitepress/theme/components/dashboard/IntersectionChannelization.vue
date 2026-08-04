<script setup lang="ts">
/** 焦点路口渠化俯视(纯 SVG):十字路口 + 进出口车道 + 信号相位环形倒计时。 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'
const {t} = useI18n()
const phase = useDomainSeries({baseline: 0, unit: '', cycleMode: 'additive', cycle: (s) => Math.floor(s / 8) % 4, cycleAmp: 0}, {seed: 2, window: 2, intervalMs: 1000})
const curPhase = computed(() => Math.round(phase.current.value) % 4)
const PHASE_COLOR = ['#16c784', '#ffb020', '#16c784', '#ffb020']
const PHASE_LABEL = [t('南北通行', 'N-S Go'), t('南北左转', 'N-S Left'), t('东西通行', 'E-W Go'), t('东西左转', 'E-W Left')]
const at = computed(() => t('焦点路口渠化俯视图', 'Intersection channelization'))
const lanes = [
  {x: 200, y: 40, w: 100, h: 20},
  {x: 200, y: 260, w: 100, h: 20},
  {x: 40, y: 150, w: 20, h: 100},
  {x: 440, y: 150, w: 20, h: 100},
]
</script>
<template>
  <div class="ichan" role="img" :aria-label="at">
    <svg viewBox="0 0 500 320" class="ichan-svg" preserveAspectRatio="xMidYMid meet">
      <rect x="170" y="120" width="160" height="80" fill="rgba(43,155,255,0.06)" stroke="rgba(0,229,255,0.2)" />
      <rect v-for="(l, i) in lanes" :key="'l'+i" :x="l.x" :y="l.y" :width="l.w" :height="l.h" fill="rgba(100,130,170,0.15)" stroke="rgba(0,229,255,0.12)" />
      <path d="M210 120 L210 100 M290 120 L290 100" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-dasharray="4 4" />
      <circle cx="250" cy="160" r="34" fill="none" :stroke="PHASE_COLOR[curPhase]" :stroke-width="4" opacity="0.9" />
      <text x="250" y="158" text-anchor="middle" :fill="PHASE_COLOR[curPhase]" font-size="11" font-family="monospace">{{ PHASE_LABEL[curPhase] }}</text>
      <text x="250" y="174" text-anchor="middle" fill="#6b8cae" font-size="9">PHASE {{ curPhase + 1 }}/4</text>
    </svg>
  </div>
</template>
<style scoped>
.ichan { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.ichan-svg { width: 100%; height: 100%; max-height: 100%; }
</style>
