<script setup lang="ts">
/**
 * 各馈线支路实时功率胶囊图:DvCapsuleChart。
 * 6 条馈线(工业配电出线),各乘性慢周期 + 微噪声漂移。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Feeder {zh: string; en: string; baseline: number; phase: number; seed: number}
const FEEDERS: Feeder[] = [
  {zh: '馈线 F1 车间甲', en: 'F1 Workshop-A', baseline: 180, phase: 0.0, seed: 301},
  {zh: '馈线 F2 车间乙', en: 'F2 Workshop-B', baseline: 150, phase: 0.8, seed: 302},
  {zh: '馈线 F3 办公楼', en: 'F3 Office', baseline: 92, phase: 1.6, seed: 303},
  {zh: '馈线 F4 充电桩', en: 'F4 EV Charger', baseline: 120, phase: 2.4, seed: 304},
  {zh: '馈线 F5 仓库', en: 'F5 Warehouse', baseline: 64, phase: 3.2, seed: 305},
  {zh: '馈线 F6 公用', en: 'F6 Utility', baseline: 48, phase: 4.0, seed: 306},
]

const feeders = FEEDERS.map((f) => ({
  ref: f,
  kw: useDomainSeries(
    {baseline: f.baseline, unit: 'kW', cycle: (s) => Math.sin(s / 130 + f.phase), cycleAmp: 0.1, noiseAmp: 2},
    {seed: f.seed, window: 2},
  ).current,
}))

const capsuleConfig = computed(() => ({
  data: feeders.map((f) => ({name: t(f.ref.zh, f.ref.en), value: Math.max(0, Math.round(f.kw.value))})),
  colors: ['#00e5ff', '#2b9bff', '#00ffc6', '#7a5cff', '#ff5cf0', '#ffb020'],
  unit: 'kW',
  showValue: true,
}))

const accessibleTitle = computed(() => t('各馈线支路实时功率胶囊图', 'Feeder branch real-time power'))
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
            <span>{{ f.name }}</span><span>{{ f.value }} kW</span>
          </li>
        </ul>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.caps { width: 100%; height: 100%; box-sizing: border-box; }
.caps-body { width: 100%; height: 100%; }
.caps-body :deep(.dv-capsule-chart) { width: 100%; height: 100%; }
.caps-fallback { list-style: none; margin: 0; padding: 0; height: 100%; display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: var(--dc3d-text-dim); }
.caps-fallback li { display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(13,35,69,0.5); border-radius: 3px; }
</style>
