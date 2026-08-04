<script setup lang="ts">
/**
 * 路口饱和度 V/C 滚动排行榜:DvScrollRankingBoard(自带排名+进度条+扫光)。
 * 10 路口各自乘性慢周期 + 微噪声,每 tick 重排。V/C=通行流量/通行能力。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface I {zh: string; en: string; base: number; phase: number; seed: number}
const IS: I[] = [
  {zh: '人民·解放', en: 'Renmin-Jiefang', base: 1.04, phase: 0.0, seed: 401},
  {zh: '解放·中山', en: 'Jiefang-Zhongshan', base: 0.96, phase: 0.7, seed: 402},
  {zh: '人民·中山', en: 'Renmin-Zhongshan', base: 0.91, phase: 1.4, seed: 403},
  {zh: '中山·建国', en: 'Zhongshan-Jianguo', base: 0.88, phase: 2.1, seed: 404},
  {zh: '解放·滨海', en: 'Jiefang-Binhai', base: 0.83, phase: 2.8, seed: 405},
  {zh: '建国·滨海', en: 'Jianguo-Binhai', base: 0.79, phase: 3.5, seed: 406},
  {zh: '外环·人民', en: 'Ring-Renmin', base: 0.74, phase: 4.2, seed: 407},
  {zh: '滨海·沿海', en: 'Binhai-Coast', base: 0.68, phase: 4.9, seed: 408},
  {zh: '科技·创新', en: 'Tech-Innov', base: 0.62, phase: 5.6, seed: 409},
  {zh: '环城·高架', en: 'Belt-Viaduct', base: 0.57, phase: 6.3, seed: 410},
]
const items = IS.map((it) => ({
  name: computed(() => t(it.zh, it.en)),
  vc: useDomainSeries({baseline: it.base, unit: 'V/C', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 130 + it.phase), cycleAmp: 0.06, noiseAmp: 0.02}, {seed: it.seed, window: 2}).current,
}))

const config = computed(() => ({
  data: items.map((it) => ({name: it.name.value, value: Math.max(0, +(it.vc.value).toFixed(2))})),
  rowNum: 7, unit: 'V/C', sort: true, valueFormatter: ({value}: {value: number}) => value.toFixed(2),
}))
const accessibleTitle = computed(() => t('路口饱和度V/C排行榜', 'Intersection saturation V/C ranking'))
</script>

<template>
  <div class="srank" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollRankingBoard :config="config" class="srank__board" />
      <template #fallback>
        <ul class="srank__fb"><li v-for="it in config.data" :key="it.name"><span>{{ it.name }}</span><span>{{ it.value.toFixed(2) }}</span></li></ul>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.srank {position: relative; width: 100%; height: 100%;}
.srank__board {width: 100%; height: 100%; color: var(--dc3d-text);}
.srank__fb {list-style: none; margin: 0; padding: 0; height: 100%; display: flex; flex-direction: column; gap: 6px;}
.srank__fb li {display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-radius: 4px; background: rgba(13, 35, 69, 0.5); font-size: 13px; color: var(--dc3d-text);}
.srank__fb li span:last-child {color: var(--dc3d-neon-cyan); font-family: var(--dc3d-mono, monospace); font-weight: 600;}
</style>
