<script setup lang="ts">
/**
 * DMA 漏损率滚动排行榜:DvScrollRankingBoard(自带排名+进度条+扫光)。
 * 8 个 DMA 分区按 NRW% 漏损率排序,各路乘性慢周期 + 微噪声。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Dma {
  code: string
  baseline: number // 该 DMA 漏损率%
  phase: number
  seed: number
}
// 漏损率分散 10-32%(老旧 DMA 高、新管网低)。
const DMAS: Dma[] = [
  {code: 'DMA-04', baseline: 30.5, phase: 0.0, seed: 2101},
  {code: 'DMA-08', baseline: 27.8, phase: 0.7, seed: 2102},
  {code: 'DMA-03', baseline: 22.4, phase: 1.4, seed: 2103},
  {code: 'DMA-06', baseline: 18.6, phase: 2.1, seed: 2104},
  {code: 'DMA-02', baseline: 15.2, phase: 2.8, seed: 2105},
  {code: 'DMA-05', baseline: 12.4, phase: 3.5, seed: 2106},
  {code: 'DMA-01', baseline: 9.8, phase: 4.2, seed: 2107},
  {code: 'DMA-07', baseline: 7.6, phase: 4.9, seed: 2108},
]

const dmas = DMAS.map((d) => ({
  ref: d,
  val: useDomainSeries(
    {baseline: d.baseline, unit: '%', cycle: (time) => Math.sin(time / 140 + d.phase), cycleAmp: 0.04, noiseAmp: 0.2},
    {seed: d.seed, window: 2},
  ).current,
}))

const config = computed(() => ({
  data: dmas.map((it) => ({
    name: it.ref.code,
    value: +Math.max(0, it.val.value).toFixed(1),
  })),
  rowNum: 6,
  unit: '%',
  sort: true,
  valueFormatter: ({value}: {value: number}) => value.toFixed(1) + '%',
}))

const accessibleTitle = computed(() => t('DMA 分区漏损率排行榜', 'DMA leakage rate ranking'))
</script>

<template>
  <div class="dma-rank" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollRankingBoard :config="config" class="dma-rank__board" />
      <template #fallback>
        <ul class="dma-rank__fallback">
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
.dma-rank {
  position: relative;
  width: 100%;
  height: 100%;
}
.dma-rank__board {
  width: 100%;
  height: 100%;
  color: var(--dc3d-text);
}
.dma-rank__fallback {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dma-rank__fallback li {
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
