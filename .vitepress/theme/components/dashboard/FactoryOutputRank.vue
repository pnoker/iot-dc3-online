<script setup lang="ts">
/**
 * 班组产量滚动排行榜:DvScrollRankingBoard(自带排名 + 进度条 + 扫光)。
 * 8 路班组各一条乘性慢周期 + 微噪声的产量漂移,每 tick 重排。
 * 与工位 OEE 排行(效率维度)互补 = 产量维度。
 * 根用 <ClientOnly> 包 DataV 组件(SSR 隔离 + fallback)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Team {
  zh: string
  en: string
  baseline: number // 各班组产量中心值(件),缓慢漂移
  phase: number // 周期错相,避免同步漂移显得假
  seed: number
}

// 8 班组:基准分散在 800–1400 件,phase 错开。
const TEAMS: Team[] = [
  {zh: '一班组', en: 'Team 1', baseline: 1380, phase: 0.0, seed: 2101},
  {zh: '二班组', en: 'Team 2', baseline: 1240, phase: 0.7, seed: 2102},
  {zh: '三班组', en: 'Team 3', baseline: 1180, phase: 1.4, seed: 2103},
  {zh: '四班组', en: 'Team 4', baseline: 1090, phase: 2.1, seed: 2104},
  {zh: '五班组', en: 'Team 5', baseline: 1010, phase: 2.8, seed: 2105},
  {zh: '六班组', en: 'Team 6', baseline: 950, phase: 3.5, seed: 2106},
  {zh: '七班组', en: 'Team 7', baseline: 880, phase: 4.2, seed: 2107},
  {zh: '八班组', en: 'Team 8', baseline: 820, phase: 4.9, seed: 2108},
]

// 每班组一路乘性慢周期(±4%)+ 微噪声,只取 current(SSR 安全,定时器内置于 onMounted)。
const teams = TEAMS.map((team) => ({
  ref: team,
  output: useDomainSeries(
    {
      baseline: team.baseline,
      unit: '件',
      cycle: (time: number) => Math.sin(time / 140 + team.phase),
      cycleAmp: 0.04,
      noiseAmp: 6,
    },
    {seed: team.seed, window: 2},
  ).current,
}))

const config = computed(() => ({
  data: teams.map((it) => ({
    name: t(it.ref.zh, it.ref.en),
    value: Math.max(0, Math.round(it.output.value)),
  })),
  rowNum: 6,
  unit: t('件', 'pcs'),
  sort: true,
  valueFormatter: ({value}: {value: number}) => value.toLocaleString(),
}))

const accessibleTitle = computed(() => t('班组产量排行榜', 'Team output ranking'))
</script>

<template>
  <div class="output-rank" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollRankingBoard :config="config" class="output-rank__board" />
      <template #fallback>
        <ul class="output-rank__fallback">
          <li v-for="item in config.data" :key="item.name">
            <span class="fb-name">{{ item.name }}</span>
            <span class="fb-value">{{ item.value.toLocaleString() }} {{ config.unit }}</span>
          </li>
        </ul>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.output-rank {
  position: relative;
  width: 100%;
  height: 100%;
}
.output-rank__board {
  width: 100%;
  height: 100%;
  /* DvScrollRankingBoard 默认文字色偏暗,统一到大屏文字色系 */
  color: var(--dc3d-text);
}
/* SSR/降级 fallback:无 DataV 时的静态排行 */
.output-rank__fallback {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.output-rank__fallback li {
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