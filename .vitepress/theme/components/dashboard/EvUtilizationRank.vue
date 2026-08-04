<script setup lang="ts">
/**
 * 各充电站点桩位利用率滚动排行:DvScrollRankingBoard。
 * 10 站点各乘性慢周期 + 微噪声漂移,每 tick 重排(利用率时变)。
 * 利用率 = 在充桩数 / 总桩数 × 时间因子,业务区间 5-90%。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface St {zh: string; en: string; baseline: number; phase: number; seed: number}
const STATIONS: St[] = [
  {zh: '高铁枢纽站', en: 'HSR Junction', baseline: 82, phase: 0.0, seed: 211},
  {zh: 'CBD 中心站', en: 'CBD Hub', baseline: 74, phase: 0.7, seed: 212},
  {zh: '科技园站', en: 'Tech-Park', baseline: 68, phase: 1.4, seed: 213},
  {zh: '滨江超充站', en: 'Riverside Ultra', baseline: 61, phase: 2.1, seed: 214},
  {zh: '东郊物流园', en: 'E-Logistics', baseline: 54, phase: 2.8, seed: 215},
  {zh: '大学城站', en: 'University', baseline: 42, phase: 3.5, seed: 216},
  {zh: '西南商场站', en: 'SW Mall', baseline: 33, phase: 4.2, seed: 217},
  {zh: '北区医院站', en: 'N-Hospital', baseline: 24, phase: 4.9, seed: 218},
  {zh: '南站枢纽', en: 'South Station', baseline: 12, phase: 5.6, seed: 219},
  {zh: '老城南门', en: 'Old-Town S.', baseline: 8, phase: 6.3, seed: 220},
]

const sts = STATIONS.map((s) => ({
  ref: s,
  util: useDomainSeries(
    {baseline: s.baseline, unit: '%', cycle: (tt) => Math.sin(tt / 140 + s.phase), cycleAmp: 0.06, noiseAmp: 0.8},
    {seed: s.seed, window: 2},
  ).current,
}))

const config = computed(() => ({
  data: sts.map((it) => ({
    name: t(it.ref.zh, it.ref.en),
    value: Math.max(0, Math.min(100, Math.round(it.util.value))),
  })),
  rowNum: 6,
  unit: '%',
  sort: true,
  valueFormatter: ({value}: {value: number}) => value + '%',
}))

const accessibleTitle = computed(() => t('各充电站点桩位利用率排行', 'Charging station utilization ranking'))
</script>

<template>
  <div class="urank" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollRankingBoard :config="config" class="urank__board" />
      <template #fallback>
        <ul class="urank__fallback">
          <li v-for="item in config.data" :key="item.name">
            <span class="fb-name">{{ item.name }}</span>
            <span class="fb-value">{{ item.value }}%</span>
          </li>
        </ul>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.urank { position: relative; width: 100%; height: 100%; }
.urank__board { width: 100%; height: 100%; color: var(--dc3d-text); }
.urank__fallback { list-style: none; margin: 0; padding: 0; height: 100%; display: flex; flex-direction: column; gap: 6px; }
.urank__fallback li { display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-radius: 4px; background: rgba(13,35,69,0.5); font-size: 13px; }
.fb-name { color: var(--dc3d-text); }
.fb-value { color: var(--dc3d-neon-cyan, #00e5ff); font-family: var(--dc3d-mono, monospace); font-weight: 600; }
</style>
