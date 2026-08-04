<script setup lang="ts">
/**
 * 岸桥 STS moves/h 效率滚动排行:DvScrollRankingBoard。
 * 8 台岸桥各乘性慢周期漂移,每 tick 重排。<22 moves/h 视为低效(掉档)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Crane {id: string; baseline: number; phase: number; seed: number}
const CRANES: Crane[] = [
  {id: 'STC-01', baseline: 29.2, phase: 0.0, seed: 601},
  {id: 'STC-02', baseline: 27.4, phase: 0.9, seed: 602},
  {id: 'STC-03', baseline: 24.1, phase: 1.8, seed: 603},
  {id: 'STC-04', baseline: 30.6, phase: 2.7, seed: 604},
  {id: 'STC-05', baseline: 26.8, phase: 3.6, seed: 605},
  {id: 'STC-06', baseline: 21.4, phase: 4.5, seed: 606},
  {id: 'STC-07', baseline: 28.7, phase: 5.4, seed: 607},
  {id: 'STC-08', baseline: 25.5, phase: 6.3, seed: 608},
]

const cranes = CRANES.map((c) => ({
  ref: c,
  moves: useDomainSeries(
    {baseline: c.baseline, unit: 'moves/h', cycle: (s) => Math.sin(s / 110 + c.phase), cycleAmp: 0.12, noiseAmp: 0.5},
    {seed: c.seed, window: 2},
  ).current,
}))

const config = computed(() => ({
  data: cranes.map((it) => ({
    name: it.ref.id,
    value: Math.max(0, +it.moves.value.toFixed(1)),
  })),
  rowNum: 6,
  unit: 'moves/h',
  sort: true,
  valueFormatter: ({value}: {value: number}) => value.toFixed(1),
}))

const accessibleTitle = computed(() => t('各岸桥 moves/h 效率排行', 'STS crane moves per hour ranking'))
</script>

<template>
  <div class="rank" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <div class="rank-body">
        <DvScrollRankingBoard :config="config" />
      </div>
      <template #fallback>
        <ul class="rank-fallback">
          <li v-for="item in config.data" :key="item.name">
            <span class="fb-name">{{ item.name }}</span>
            <span class="fb-value">{{ item.value.toFixed(1) }} moves/h</span>
          </li>
        </ul>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.rank { position: relative; width: 100%; height: 100%; }
.rank-body { width: 100%; height: 100%; color: var(--dc3d-text); }
.rank-body :deep(.dv-scroll-ranking-board) { width: 100%; height: 100%; }
.rank-fallback { list-style: none; margin: 0; padding: 0; height: 100%; display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: var(--dc3d-text-dim); }
.rank-fallback li { display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(13,35,69,0.5); border-radius: 3px; }
.fb-name { color: var(--dc3d-text); font-family: var(--dc3d-mono, monospace); }
.fb-value { color: var(--dc3d-neon-cyan); font-family: var(--dc3d-mono, monospace); font-weight: 600; }
</style>
