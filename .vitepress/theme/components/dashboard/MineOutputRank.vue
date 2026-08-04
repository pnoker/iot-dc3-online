<script setup lang="ts">
/**
 * 各采区当班产量滚动排行:DvScrollRankingBoard。
 * 8 个采区(1301/1302/.../1308 面)各乘性慢周期漂移,每 tick 重排。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Panel {zh: string; en: string; baseline: number; phase: number; seed: number}
const PANELS: Panel[] = [
  {zh: '1301 采区', en: 'Panel 1301', baseline: 612, phase: 0.0, seed: 611},
  {zh: '1302 采区', en: 'Panel 1302', baseline: 548, phase: 0.8, seed: 612},
  {zh: '1303 采区', en: 'Panel 1303', baseline: 496, phase: 1.6, seed: 613},
  {zh: '1305 采区', en: 'Panel 1305', baseline: 462, phase: 2.4, seed: 614},
  {zh: '1306 采区', en: 'Panel 1306', baseline: 418, phase: 3.2, seed: 615},
  {zh: '1307 采区', en: 'Panel 1307', baseline: 374, phase: 4.0, seed: 616},
  {zh: '1308 采区', en: 'Panel 1308', baseline: 332, phase: 4.8, seed: 617},
  {zh: '1309 采区', en: 'Panel 1309', baseline: 286, phase: 5.6, seed: 618},
]

const panels = PANELS.map((p) => ({
  ref: p,
  out: useDomainSeries(
    {baseline: p.baseline, unit: 't', cycle: (time) => Math.sin(time / 140 + p.phase), cycleAmp: 0.04, noiseAmp: 6},
    {seed: p.seed, window: 2},
  ).current,
}))

const config = computed(() => ({
  data: panels.map((it) => ({
    name: t(it.ref.zh, it.ref.en),
    value: Math.max(0, Math.round(it.out.value)),
  })),
  rowNum: 6,
  unit: 't',
  sort: true,
  valueFormatter: ({value}: {value: number}) => value.toLocaleString(),
}))

const accessibleTitle = computed(() => t('各采区当班产量排行', 'Mining panel shift output ranking'))
</script>

<template>
  <div class="rank" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollRankingBoard :config="config" class="rank__board" />
      <template #fallback>
        <ul class="rank__fallback">
          <li v-for="item in config.data" :key="item.name">
            <span class="fb-name">{{ item.name }}</span>
            <span class="fb-value">{{ item.value.toLocaleString() }} t</span>
          </li>
        </ul>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.rank {position: relative; width: 100%; height: 100%;}
.rank__board {width: 100%; height: 100%; color: var(--dc3d-text);}
.rank__fallback {list-style: none; margin: 0; padding: 0; height: 100%; display: flex; flex-direction: column; gap: 6px;}
.rank__fallback li {display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-radius: 4px; background: rgba(13,35,69,0.5); font-size: 13px;}
.fb-name {color: var(--dc3d-text);}
.fb-value {color: var(--dc3d-neon-cyan); font-family: var(--dc3d-mono, monospace); font-weight: 600;}
</style>
