<script setup lang="ts">
/**
 * 各棚胁迫指数胶囊图:DvCapsuleChart(自带胶囊条 + 数值 + 排序扫光)。
 * 6 座大棚胁迫指数(0-100,值越低越好):由冠层温度偏离 + VPD + VWC 偏离合成。
 * 与顶部作物健康度(合成量)互补 —— 本图为各棚横向对比,定位胁迫最高的棚。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Gh {
  zh: string
  en: string
  baseline: number // 胁迫基线(0-100,越低越好)
  phase: number
  seed: number
}
// 6 座大棚:胁迫基线分散在 14–38,错相慢漂移
const GHS: Gh[] = [
  {zh: '番茄 1 号棚', en: 'Tomato GH-1', baseline: 18, phase: 0.0, seed: 911},
  {zh: '番茄 2 号棚', en: 'Tomato GH-2', baseline: 24, phase: 0.7, seed: 912},
  {zh: '黄瓜 1 号棚', en: 'Cucumber GH-1', baseline: 31, phase: 1.4, seed: 913},
  {zh: '彩椒 1 号棚', en: 'Pepper GH-1', baseline: 22, phase: 2.1, seed: 914},
  {zh: '生菜 1 号棚', en: 'Lettuce GH-1', baseline: 15, phase: 2.8, seed: 915},
  {zh: '草莓 1 号棚', en: 'Strawberry GH-1', baseline: 36, phase: 3.5, seed: 916},
]

const items = GHS.map((g) => ({
  ref: g,
  value: useDomainSeries(
    {baseline: g.baseline, unit: '', cycle: (tm) => Math.sin(tm / 150 + g.phase), cycleAmp: 0.15, noiseAmp: 1.0},
    {seed: g.seed, window: 2},
  ).current,
}))

const clamp = (v: number) => Math.max(2, Math.min(70, Math.round(v)))

const config = computed(() => ({
  data: items.map((it) => ({name: t(it.ref.zh, it.ref.en), value: clamp(it.value.value)})),
  colors: ['#00e676', '#2ec86e', '#ffb020', '#ff8a3d', '#ff5252', '#e53935'],
  unit: '',
  showValue: true,
}))

const accessibleTitle = computed(() => t('各大棚胁迫指数对比', 'Per-greenhouse stress index comparison'))
</script>

<template>
  <div class="capsule" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvCapsuleChart :config="config" style="width:100%;height:100%" />
      <template #fallback>
        <ul class="capsule__fallback">
          <li v-for="it in config.data" :key="it.name">
            <span class="fb-name">{{ it.name }}</span>
            <span class="fb-value">{{ it.value }}</span>
          </li>
        </ul>
      </template>
    </ClientOnly>
    <span class="capsule__note">{{ t('值越低越好', 'lower is better') }}</span>
  </div>
</template>

<style scoped>
.capsule {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}
.capsule :deep(.dv-capsule-chart) {
  width: 100%;
  height: 100%;
  color: var(--dc3d-text);
}
.capsule__note {
  position: absolute;
  right: 4px;
  top: 0;
  font-size: 10px;
  color: var(--dc3d-text-dim);
  font-family: var(--dc3d-mono, monospace);
}
.capsule__fallback {
  list-style: none;
  margin: 0;
  padding: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.capsule__fallback li {
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
