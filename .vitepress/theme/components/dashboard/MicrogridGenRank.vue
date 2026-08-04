<script setup lang="ts">
/**
 * 各光伏方阵日发电量滚动排行:DvScrollRankingBoard。
 * 8 路方阵各乘性慢周期漂移,每 tick 重排,与馈线功率(支路维度)互补。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Arr {zh: string; en: string; baseline: number; phase: number; seed: number}
const ARRAYS: Arr[] = [
  {zh: 'A 区方阵', en: 'Array A', baseline: 1820, phase: 0.0, seed: 211},
  {zh: 'B 区方阵', en: 'Array B', baseline: 1640, phase: 0.7, seed: 212},
  {zh: 'C 区方阵', en: 'Array C', baseline: 1530, phase: 1.4, seed: 213},
  {zh: 'D 区方阵', en: 'Array D', baseline: 1410, phase: 2.1, seed: 214},
  {zh: 'E 区方阵', en: 'Array E', baseline: 1280, phase: 2.8, seed: 215},
  {zh: 'F 区方阵', en: 'Array F', baseline: 1160, phase: 3.5, seed: 216},
  {zh: 'G 区方阵', en: 'Array G', baseline: 1040, phase: 4.2, seed: 217},
  {zh: 'H 区方阵', en: 'Array H', baseline: 920, phase: 4.9, seed: 218},
]

const arrays = ARRAYS.map((a) => ({
  ref: a,
  gen: useDomainSeries(
    {baseline: a.baseline, unit: 'kWh', cycle: (time) => Math.sin(time / 140 + a.phase), cycleAmp: 0.04, noiseAmp: 8},
    {seed: a.seed, window: 2},
  ).current,
}))

const config = computed(() => ({
  data: arrays.map((it) => ({
    name: t(it.ref.zh, it.ref.en),
    value: Math.max(0, Math.round(it.gen.value)),
  })),
  rowNum: 6,
  unit: 'kWh',
  sort: true,
  valueFormatter: ({value}: {value: number}) => value.toLocaleString(),
}))

const accessibleTitle = computed(() => t('各光伏方阵日发电量排行', 'PV array daily generation ranking'))
</script>

<template>
  <div class="gen-rank" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollRankingBoard :config="config" class="gen-rank__board" />
      <template #fallback>
        <ul class="gen-rank__fallback">
          <li v-for="item in config.data" :key="item.name">
            <span class="fb-name">{{ item.name }}</span>
            <span class="fb-value">{{ item.value.toLocaleString() }} kWh</span>
          </li>
        </ul>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.gen-rank { position: relative; width: 100%; height: 100%; }
.gen-rank__board { width: 100%; height: 100%; color: var(--dc3d-text); }
.gen-rank__fallback { list-style: none; margin: 0; padding: 0; height: 100%; display: flex; flex-direction: column; gap: 6px; }
.gen-rank__fallback li { display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-radius: 4px; background: rgba(13,35,69,0.5); font-size: 13px; }
.fb-name { color: var(--dc3d-text); }
.fb-value { color: var(--dc3d-neon-cyan); font-family: var(--dc3d-mono, monospace); font-weight: 600; }
</style>
