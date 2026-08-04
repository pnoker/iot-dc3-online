<script setup lang="ts">
/**
 * 排污企业排放负荷滚动排行:DvScrollRankingBoard(自带排名+进度条+扫光)。
 * 8 家重点企业按 COD 排放负荷(kg/h)排序,各路乘性慢周期 + 微噪声。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface Ent {
  code: string
  baseline: number // COD 排放负荷 kg/h
  phase: number
  seed: number
}
// 排放负荷分散 3.2-26 kg/h(大工业高、达标企业低)。
const ENTS: Ent[] = [
  {code: t('华源焦化', 'Huayuan Coke'), baseline: 25.6, phase: 0.0, seed: 2101},
  {code: t('钢铁烧结', 'Steel Sinter'), baseline: 22.1, phase: 0.7, seed: 2102},
  {code: t('临港玻璃', 'Port Glass'), baseline: 18.4, phase: 1.4, seed: 2103},
  {code: t('联合水泥', 'United Cement'), baseline: 14.8, phase: 2.1, seed: 2104},
  {code: t('东方化工', 'Orient Chem'), baseline: 11.2, phase: 2.8, seed: 2105},
  {code: t('蓝天药业', 'BlueSky Pharm'), baseline: 8.6, phase: 3.5, seed: 2106},
  {code: t('第二热电厂', 'Power Plant 2'), baseline: 5.4, phase: 4.2, seed: 2107},
  {code: t('第三热电厂', 'Power Plant 3'), baseline: 3.2, phase: 4.9, seed: 2108},
]

const ents = ENTS.map((d) => ({
  ref: d,
  val: useDomainSeries(
    {baseline: d.baseline, unit: 'kg/h', cycle: (time) => Math.sin(time / 140 + d.phase), cycleAmp: 0.05, noiseAmp: 0.25},
    {seed: d.seed, window: 2},
  ).current,
}))

const config = computed(() => ({
  data: ents.map((it) => ({
    name: it.ref.code,
    value: +Math.max(0, it.val.value).toFixed(1),
  })),
  rowNum: 6,
  unit: t('kg/h', 'kg/h'),
  sort: true,
  valueFormatter: ({value}: {value: number}) => value.toFixed(1),
}))

const accessibleTitle = computed(() => t('排污企业排放负荷排行榜', 'Polluter emission load ranking'))
</script>

<template>
  <div class="poll-rank" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollRankingBoard :config="config" class="poll-rank__board" />
      <template #fallback>
        <ul class="poll-rank__fallback">
          <li v-for="item in config.data" :key="item.name">
            <span class="fb-name">{{ item.name }}</span>
            <span class="fb-value">{{ item.value }} kg/h</span>
          </li>
        </ul>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.poll-rank {
  position: relative;
  width: 100%;
  height: 100%;
}
.poll-rank__board {
  width: 100%;
  height: 100%;
  color: var(--dc3d-text);
}
.poll-rank__fallback {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.poll-rank__fallback li {
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
