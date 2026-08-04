<script setup lang="ts">
/**
 * 超标告警滚动日志:DvScrollBoard,泊松事件驱动增量 push,保留最近 20 条。
 * 事件池:PM2.5/SO₂/NO₂/O₃ 超标、CEMS 排放超标、水质劣Ⅴ、噪声/扬尘超标、预警解除。
 */
import {ref, computed, watch} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const {current} = useDomainSeries(
  {baseline: 0, unit: '', events: [{rate: 1 / 5, type: 'spike', size: 1}]},
  {seed: 314, window: 2, intervalMs: 1000},
)

interface Ev {level: 'critical' | 'warning' | 'info'; zh: string; en: string; factor: string}
const POOL: Ev[] = [
  {level: 'critical', zh: 'PM2.5 超标', en: 'PM2.5 Exceeded', factor: 'PM2.5'},
  {level: 'critical', zh: 'CEMS 排放超标', en: 'CEMS Over-limit', factor: 'SO₂'},
  {level: 'critical', zh: '水质劣Ⅴ类', en: 'Water Worse-than-V', factor: 'COD'},
  {level: 'warning', zh: 'O₃ 超标', en: 'O₃ Exceeded', factor: 'O₃'},
  {level: 'warning', zh: 'SO₂ 超标', en: 'SO₂ Exceeded', factor: 'SO₂'},
  {level: 'warning', zh: 'NO₂ 超标', en: 'NO₂ Exceeded', factor: 'NO₂'},
  {level: 'warning', zh: '扬尘超标', en: 'Dust Over-limit', factor: 'PM10'},
  {level: 'info', zh: '噪声超标', en: 'Noise Over-limit', factor: 'dB'},
  {level: 'info', zh: '预警解除', en: 'Alert Cleared', factor: '--'},
]
const LEVEL_COLOR = {critical: '#ff5252', warning: '#ffa726', info: '#00e676'}
const LEVEL_TXT = {critical: {zh: '严重', en: 'Critical'}, warning: {zh: '警告', en: 'Warning'}, info: {zh: '提示', en: 'Info'}}

const STATIONS = ['国控·城区', '国控·工业园', '省控·化工区', '微型·东南', '华源焦化', '钢铁烧结']

let clock = 8 * 3600 + 12 * 60
let seed = 7
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
function pushEvent() {
  clock += 4 + Math.floor(rnd() * 36)
  const ev = POOL[Math.floor(rnd() * POOL.length)]
  const st = STATIONS[Math.floor(rnd() * STATIONS.length)]
  const lv = LEVEL_TXT[ev.level][en.value ? 'en' : 'zh']
  rows.value.unshift([
    fmtTime(clock),
    en.value ? st : st,
    en.value ? ev.en : ev.zh,
    `<span style="color:${LEVEL_COLOR[ev.level]};font-weight:600">● ${lv}</span>`,
  ])
  if (rows.value.length > 20) rows.value.pop()
}
for (let i = 0; i < 8; i++) pushEvent()
watch(current, () => pushEvent())

const config = computed(() => ({
  header: [t('时间', 'Time'), t('站点/企业', 'Station'), t('告警事件', 'Event'), t('级别', 'Level')],
  data: rows.value,
  rowNum: 7,
  headerBGC: 'rgba(0,229,255,0.15)',
  oddRowBGC: 'rgba(13,35,69,0.5)',
  evenRowBGC: 'rgba(8,22,45,0.5)',
  columnWidth: [88, 116],
  align: ['center', 'left', 'left', 'center'],
  waitTime: 2200,
  carousel: 'page',
}))
const accessibleTitle = computed(() => t('超标告警滚动日志', 'Over-limit alert log'))
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
.event-log {
  width: 100%;
  height: 100%;
  min-height: 0;
}
.el-fallback {
  color: var(--dc3d-text-dim);
  font-size: 12px;
  padding: 8px;
}
.el-row {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px solid var(--dc3d-panel-border);
}
</style>
