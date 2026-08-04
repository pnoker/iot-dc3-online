<script setup lang="ts">
/**
 * 井下人员分布胶囊图:DvCapsuleChart,按区域统计在岗人数。
 * 综采面/掘进头/运输大巷/回风巷/机电硐室/主井底车场 —— 各乘性慢周期漂移。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Area {zh: string; en: string; baseline: number; phase: number; seed: number}
const AREAS: Area[] = [
  {zh: '综采面', en: 'Longwall Face', baseline: 64, phase: 0.0, seed: 501},
  {zh: '掘进头', en: 'Tunneling Head', baseline: 38, phase: 0.9, seed: 502},
  {zh: '运输大巷', en: 'Transport Main', baseline: 32, phase: 1.7, seed: 503},
  {zh: '机电硐室', en: 'Substation', baseline: 18, phase: 2.5, seed: 504},
  {zh: '回风巷', en: 'Return Airway', baseline: 16, phase: 3.3, seed: 505},
  {zh: '井底车场', en: 'Shaft Bottom', baseline: 18, phase: 4.1, seed: 506},
]

const areas = AREAS.map((a) => ({
  ref: a,
  n: useDomainSeries(
    {baseline: a.baseline, unit: '人', cycle: (s) => Math.sin(s / 130 + a.phase), cycleAmp: 0.06, noiseAmp: 1.2},
    {seed: a.seed, window: 2},
  ).current,
}))

const capsuleConfig = computed(() => ({
  data: areas.map((a) => ({name: t(a.ref.zh, a.ref.en), value: Math.max(0, Math.round(a.n.value))})),
  colors: ['#00e676', '#00e5ff', '#2b9bff', '#7a5cff', '#b980ff', '#ffb020'],
  unit: t('人', 'ppl'),
  showValue: true,
}))

const accessibleTitle = computed(() => t('井下各区域人员分布胶囊图', 'Personnel distribution by area'))
</script>

<template>
  <div class="caps" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div class="caps-body">
        <DvCapsuleChart :config="capsuleConfig" />
      </div>
      <template #fallback>
        <ul class="caps-fallback">
          <li v-for="f in capsuleConfig.data" :key="f.name">
            <span>{{ f.name }}</span><span>{{ f.value }} {{ t('人', 'ppl') }}</span>
          </li>
        </ul>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.caps {width: 100%; height: 100%; box-sizing: border-box;}
.caps-body {width: 100%; height: 100%;}
.caps-body :deep(.dv-capsule-chart) {width: 100%; height: 100%;}
.caps-fallback {list-style: none; margin: 0; padding: 0; height: 100%; display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: var(--dc3d-text-dim);}
.caps-fallback li {display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(13,35,69,0.5); border-radius: 3px;}
</style>
