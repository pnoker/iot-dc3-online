<script setup lang="ts">
/**
 * 各充电站点实时充电功率胶囊图:DvCapsuleChart。
 * 6 个站点(站级聚合功率),各乘性慢周期 + 微噪声漂移。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface St {zh: string; en: string; baseline: number; phase: number; seed: number}
const STATIONS: St[] = [
  {zh: '高铁枢纽站', en: 'HSR Junction', baseline: 1320, phase: 0.0, seed: 501},
  {zh: 'CBD 中心站', en: 'CBD Hub', baseline: 980, phase: 0.8, seed: 502},
  {zh: '科技园站', en: 'Tech-Park', baseline: 760, phase: 1.6, seed: 503},
  {zh: '滨江超充站', en: 'Riverside Ultra', baseline: 640, phase: 2.4, seed: 504},
  {zh: '东郊物流园', en: 'E-Logistics', baseline: 420, phase: 3.2, seed: 505},
  {zh: '大学城站', en: 'University', baseline: 280, phase: 4.0, seed: 506},
]

const sts = STATIONS.map((s) => ({
  ref: s,
  kw: useDomainSeries(
    {baseline: s.baseline, unit: 'kW', cycle: (tt) => Math.sin(tt / 130 + s.phase), cycleAmp: 0.12, noiseAmp: 8},
    {seed: s.seed, window: 2},
  ).current,
}))

const capsuleConfig = computed(() => ({
  data: sts.map((s) => ({name: t(s.ref.zh, s.ref.en), value: Math.max(0, Math.round(s.kw.value))})),
  colors: ['#00e5ff', '#2b9bff', '#00ffc6', '#7a5cff', '#ff5cf0', '#ffb020'],
  unit: 'kW',
  showValue: true,
}))

const accessibleTitle = computed(() => t('各充电站点实时充电功率胶囊图', 'Station real-time charging power'))
</script>

<template>
  <div class="cap" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div class="cap-body">
        <DvCapsuleChart :config="capsuleConfig" />
      </div>
      <template #fallback>
        <ul class="cap-fallback">
          <li v-for="s in capsuleConfig.data" :key="s.name">
            <span>{{ s.name }}</span><span>{{ s.value }} kW</span>
          </li>
        </ul>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.cap { width: 100%; height: 100%; box-sizing: border-box; }
.cap-body { width: 100%; height: 100%; }
.cap-body :deep(.dv-capsule-chart) { width: 100%; height: 100%; }
.cap-fallback { list-style: none; margin: 0; padding: 0; height: 100%; display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: var(--dc3d-text-dim); }
.cap-fallback li { display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(13,35,69,0.5); border-radius: 3px; }
</style>
