<script setup lang="ts">
/**
 * 车队准点率滚动排行榜:DvScrollRankingBoard(自带排名+进度条+扫光)。
 * 8 个车队按准点率% 排序,各路乘性慢周期 + 微噪声。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Fleet {
  code: string
  baseline: number // 准点率%
  phase: number
  seed: number
}
// 准点率分散 88-99%(老旧车队略低)。
const FLEETS: Fleet[] = [
  {code: t('华北车队', 'North Flt'), baseline: 98.6, phase: 0.0, seed: 3101},
  {code: t('华东车队', 'East Flt'), baseline: 97.2, phase: 0.7, seed: 3102},
  {code: t('华南车队', 'South Flt'), baseline: 96.4, phase: 1.4, seed: 3103},
  {code: t('西南车队', 'SW Flt'), baseline: 94.8, phase: 2.1, seed: 3104},
  {code: t('西北车队', 'NW Flt'), baseline: 93.1, phase: 2.8, seed: 3105},
  {code: t('东北车队', 'NE Flt'), baseline: 91.6, phase: 3.5, seed: 3106},
  {code: t('华中车队', 'Central Flt'), baseline: 90.4, phase: 4.2, seed: 3107},
  {code: t('城中转车队', 'Shuttle Flt'), baseline: 88.9, phase: 4.9, seed: 3108},
]

const fleets = FLEETS.map((d) => ({
  ref: d,
  val: useDomainSeries(
    {baseline: d.baseline, unit: '%', cycle: (time) => Math.sin(time / 140 + d.phase), cycleAmp: 0.012, noiseAmp: 0.18},
    {seed: d.seed, window: 2},
  ).current,
}))

const config = computed(() => ({
  data: fleets.map((it) => ({
    name: it.ref.code,
    value: +Math.max(0, Math.min(100, it.val.value)).toFixed(1),
  })),
  rowNum: 6,
  unit: '%',
  sort: true,
  valueFormatter: ({value}: {value: number}) => value.toFixed(1) + '%',
}))

const accessibleTitle = computed(() => t('车队准点率排行榜', 'Fleet on-time rate ranking'))
</script>

<template>
  <div class="rank" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollRankingBoard :config="config" class="rank__board" />
      <template #fallback>
        <ul class="rank__fallback">
          <li v-for="item in config.data" :key="item.name">
            <span class="fb-name">{{ item.name }}</span>
            <span class="fb-value">{{ item.value }} %</span>
          </li>
        </ul>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.rank {
  position: relative;
  width: 100%;
  height: 100%;
}
.rank__board {
  width: 100%;
  height: 100%;
  color: var(--dc3d-text);
}
.rank__fallback {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rank__fallback li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 4px;
  background: rgba(13, 35, 69, 0.5);
  font-size: 13px;
}
.fb-name {
  color: var(--dc3d-text);
}
.fb-value {
  color: var(--dc3d-neon-cyan);
  font-family: var(--dc3d-mono, monospace);
  font-weight: 600;
}
</style>
