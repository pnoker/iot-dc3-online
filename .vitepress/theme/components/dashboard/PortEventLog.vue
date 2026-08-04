<script setup lang="ts">
/**
 * 港口作业事件滚动日志:DvScrollBoard。泊松信号驱动增量 push,保留最近 20 条。
 * 事件池面向港口:岸桥掉档、泊位压船、闸口拥堵、翻箱超限、潮汐窗口关闭、堆场爆箱、RTG 故障。
 */
import {ref, computed, watch} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const {current} = useDomainSeries(
  {baseline: 0, unit: '', events: [{rate: 1 / 7, type: 'spike', size: 1}]},
  {seed: 314, window: 2, intervalMs: 1000},
)

interface Ev {level: 'critical' | 'warning' | 'info'; zh: string; en: string}
const POOL: Ev[] = [
  {level: 'critical', zh: '岸桥 STC 掉档', en: 'STC crane miss'},
  {level: 'warning', zh: '泊位压船', en: 'Berth queue buildup'},
  {level: 'critical', zh: '闸口拥堵超阈值', en: 'Gate congestion over limit'},
  {level: 'warning', zh: '翻箱率超限', en: 'Rehandle rate high'},
  {level: 'info', zh: '潮汐窗口开启', en: 'Tidal window open'},
  {level: 'warning', zh: '潮汐窗口关闭', en: 'Tidal window closed'},
  {level: 'critical', zh: '堆场爆箱', en: 'Yard block overflow'},
  {level: 'warning', zh: 'RTG 故障', en: 'RTG fault'},
  {level: 'info', zh: '船舶靠泊完成', en: 'Vessel berthed'},
  {level: 'info', zh: '船舶离泊', en: 'Vessel departed'},
  {level: 'warning', zh: '集卡排队过长', en: 'Truck queue long'},
  {level: 'info', zh: '夜班作业启动', en: 'Night shift started'},
]
const LEVEL_COLOR = {critical: '#ff5252', warning: '#ffa726', info: '#00e676'}
const LEVEL_TXT = {critical: {zh: '严重', en: 'Critical'}, warning: {zh: '警告', en: 'Warning'}, info: {zh: '提示', en: 'Info'}}

let clock = 8 * 3600 + 12 * 60
let seed = 1
function rnd() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}
function fmtTime(s: number) {
  const h = Math.floor(s / 3600) % 24
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const rows = ref<any[][]>([])
const DEVICES = ['STC-02', 'B1', 'GATE-IN', 'YARD-A3', 'STC-06', 'RTG-04', 'B4', 'STC-08', 'GATE-OUT', 'B3']
function pushEvent() {
  clock += 6 + Math.floor(rnd() * 54)
  const ev = POOL[Math.floor(rnd() * POOL.length)]
  const dev = DEVICES[Math.floor(rnd() * DEVICES.length)]
  const lv = LEVEL_TXT[ev.level][en.value ? 'en' : 'zh']
  rows.value.unshift([
    fmtTime(clock),
    dev,
    en.value ? ev.en : ev.zh,
    `<span style="color:${LEVEL_COLOR[ev.level]};font-weight:600">● ${lv}</span>`,
  ])
  if (rows.value.length > 20) rows.value.pop()
}
for (let i = 0; i < 8; i++) pushEvent()
watch(current, () => pushEvent())

const config = computed(() => ({
  header: [t('时间', 'Time'), t('对象', 'Object'), t('事件', 'Event'), t('级别', 'Level')],
  data: rows.value,
  rowNum: 7,
  headerBGC: 'rgba(0,229,255,0.15)',
  oddRowBGC: 'rgba(13,35,69,0.5)',
  evenRowBGC: 'rgba(8,22,45,0.5)',
  columnWidth: [92, 96],
  align: ['center', 'center', 'left', 'center'],
  waitTime: 2400,
  carousel: 'page',
}))
const accessibleTitle = computed(() => t('港口作业事件滚动日志', 'Port operations event log'))
</script>

<template>
  <div class="event-log" role="log" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollBoard :config="config" style="width:100%;height:100%" />
      <template #fallback>
        <div class="el-fallback">
          <div v-for="(r, i) in rows.slice(0, 7)" :key="i" class="el-row">
            <span>{{ r[0] }}</span><span>{{ r[1] }}</span><span>{{ r[2] }}</span>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.event-log { width: 100%; height: 100%; min-height: 0; }
.el-fallback { color: var(--dc3d-text-dim); font-size: 12px; padding: 8px; }
.el-row { display: flex; gap: 12px; padding: 4px 0; border-bottom: 1px solid var(--dc3d-panel-border); }
</style>
