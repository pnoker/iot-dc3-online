<script setup lang="ts">
/**
 * 站场输量滚动排行榜:DvScrollRankingBoard(自带排名+进度条+扫光)。
 * 8 座分输/门站按日输量(10⁴Nm³/d)排序,各路乘性慢周期 + 微噪声。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface St {
  code: string
  baseline: number // 日输量 10⁴Nm³/d
  phase: number
  seed: number
}
// 大型门站日输量 60-220 10⁴Nm³/d。
const STATIONS: St[] = [
  {code: t('东郊门站', 'East Gate'), baseline: 218, phase: 0.0, seed: 8201},
  {code: t('西郊门站', 'West Gate'), baseline: 186, phase: 0.7, seed: 8202},
  {code: t('CS-2 分输', 'CS-2 Dist.'), baseline: 152, phase: 1.4, seed: 8203},
  {code: t('南湾门站', 'South Bay'), baseline: 128, phase: 2.1, seed: 8204},
  {code: t('北郊门站', 'North Gate'), baseline: 104, phase: 2.8, seed: 8205},
  {code: t('CS-1 分输', 'CS-1 Dist.'), baseline: 88, phase: 3.5, seed: 8206},
  {code: t('工业园门站', 'Industrial'), baseline: 72, phase: 4.2, seed: 8207},
  {code: t('新城门站', 'New Town'), baseline: 56, phase: 4.9, seed: 8208},
]

const stns = STATIONS.map((s) => ({
  ref: s,
  val: useDomainSeries(
    {baseline: s.baseline, unit: '10⁴Nm³/d', cycle: (time) => Math.sin(time / 140 + s.phase), cycleAmp: 0.04, noiseAmp: 1.2},
    {seed: s.seed, window: 2},
  ).current,
}))

const config = computed(() => ({
  data: stns.map((it) => ({
    name: it.ref.code,
    value: +Math.max(0, it.val.value).toFixed(0),
  })),
  rowNum: 6,
  unit: '10⁴Nm³/d',
  sort: true,
  valueFormatter: ({value}: {value: number}) => Math.round(value) + '',
}))

const accessibleTitle = computed(() => t('站场日输量排行榜', 'Station daily throughput ranking'))
</script>

<template>
  <div class="ogrank" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollRankingBoard :config="config" class="ogrank__board" />
      <template #fallback>
        <ul class="ogrank__fallback">
          <li v-for="item in config.data" :key="item.name">
            <span class="fb-name">{{ item.name }}</span>
            <span class="fb-value">{{ item.value }} 10⁴Nm³/d</span>
          </li>
        </ul>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.ogrank {
  position: relative;
  width: 100%;
  height: 100%;
}
.ogrank__board {
  width: 100%;
  height: 100%;
  color: var(--dc3d-text);
}
.ogrank__fallback {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ogrank__fallback li {
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
