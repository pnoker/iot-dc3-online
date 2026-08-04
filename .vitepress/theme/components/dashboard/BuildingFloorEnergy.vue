<script setup lang="ts">
/**
 * 各楼层能耗滚动排行榜:DvScrollRankingBoard(自带排名 + 进度条 + 扫光)。
 * 8 楼层各一路乘性慢周期 + 微噪声的能耗漂移,每 tick 重排。
 * <ClientOnly> 包 DataV 组件(SSR 隔离 + fallback)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Floor {
  zh: string
  en: string
  baseline: number
  seed: number
}

// 8 楼层:设备层/商业层能耗高,办公层中等,大堂低
const FLOORS: Floor[] = [
  {zh: '8F 设备层', en: '8F Plant', baseline: 2480, seed: 301},
  {zh: '2F 商业', en: '2F Retail', baseline: 2150, seed: 304},
  {zh: '6F 办公', en: '6F Office', baseline: 1920, seed: 302},
  {zh: '7F 办公', en: '7F Office', baseline: 1860, seed: 305},
  {zh: '4F 办公', en: '4F Office', baseline: 1810, seed: 303},
  {zh: '5F 办公', en: '5F Office', baseline: 1770, seed: 306},
  {zh: '3F 会议', en: '3F Meeting', baseline: 1340, seed: 307},
  {zh: '1F 大堂', en: '1F Lobby', baseline: 980, seed: 308},
]

const floors = FLOORS.map((f) => ({
  ref: f,
  val: useDomainSeries(
    {baseline: f.baseline, unit: 'kWh', cycle: (time: number) => Math.sin(time / 140 + f.seed), cycleAmp: 0.04, noiseAmp: 8},
    {seed: f.seed, window: 2},
  ).current,
}))

const config = computed(() => ({
  data: floors.map((it) => ({name: t(it.ref.zh, it.ref.en), value: Math.max(0, Math.round(it.val.value))})),
  rowNum: 7,
  unit: 'kWh',
  sort: true,
  valueFormatter: ({value}: {value: number}) => value.toLocaleString(),
}))

const accessibleTitle = computed(() => t('各楼层能耗排行榜', 'Floor energy ranking'))
</script>

<template>
  <div class="floor-energy" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollRankingBoard :config="config" class="floor-energy__board" />
      <template #fallback>
        <ul class="floor-energy__fallback">
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
.floor-energy {
  position: relative;
  width: 100%;
  height: 100%;
}
.floor-energy__board {
  width: 100%;
  height: 100%;
  color: var(--dc3d-text);
}
.floor-energy__fallback {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.floor-energy__fallback li {
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
