<script setup lang="ts">
/**
 * 各方向流量胶囊图:DvCapsuleChart。8 进城/出城方向机动车流量(veh/h),各自乘性慢周期漂移。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface D {zh: string; en: string; base: number; phase: number; seed: number}
const DIRS: D[] = [
  {zh: '北→南', en: 'N→S', base: 2850, phase: 0.0, seed: 601},
  {zh: '南→北', en: 'S→N', base: 2620, phase: 0.7, seed: 602},
  {zh: '东→西', en: 'E→W', base: 2380, phase: 1.4, seed: 603},
  {zh: '西→东', en: 'W→E', base: 2210, phase: 2.1, seed: 604},
  {zh: '东北→西南', en: 'NE→SW', base: 1740, phase: 2.8, seed: 605},
  {zh: '西南→东北', en: 'SW→NE', base: 1560, phase: 3.5, seed: 606},
  {zh: '东南→西北', en: 'SE→NW', base: 1320, phase: 4.2, seed: 607},
  {zh: '西北→东南', en: 'NW→SE', base: 1180, phase: 4.9, seed: 608},
]
const dirs = DIRS.map((d) => ({
  name: computed(() => t(d.zh, d.en)),
  v: useDomainSeries({baseline: d.base, unit: 'veh/h', cycle: (s) => Math.sin(s / 140 + d.phase), cycleAmp: 0.06, noiseAmp: 30}, {seed: d.seed, window: 2}).current,
}))

const config = computed(() => ({
  data: dirs.map((it) => ({name: it.name.value, value: Math.max(0, Math.round(it.v.value))})),
  colors: ['#00e5ff', '#2b9bff', '#00ffc6', '#7a5cff', '#ff5cf0'],
  unit: t('veh/h', 'veh/h'), showValue: true,
}))
const accessibleTitle = computed(() => t('各方向流量胶囊图', 'Directional flow capsules'))
</script>

<template>
  <div class="dir" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div class="dir-body"><DvCapsuleChart :config="config" /></div>
      <template #fallback><div class="dir-fb">{{ accessibleTitle }}</div></template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.dir {width: 100%; height: 100%; min-height: 0; display: flex; flex-direction: column;}
.dir-body {flex: 1; min-height: 0;}
.dir-body :deep(.dv-capsule-chart) {width: 100%; height: 100%;}
.dir-fb {flex: 1; display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--dc3d-text-dim);}
</style>
