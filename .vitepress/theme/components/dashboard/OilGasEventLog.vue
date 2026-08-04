<script setup lang="ts">
/**
 * 管网事件滚动日志:DvScrollBoard,泊松事件驱动增量 push,保留最近 20 条。
 * 事件池:越压/欠压/罐位高高/罐位低低/机组振动超标/阀门内漏/气质超标/阴极保护异常。
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
  {level: 'critical', zh: '干线越压', en: 'Mainline over-pressure'},
  {level: 'critical', zh: '机组振动超标', en: 'Compressor vibration alarm'},
  {level: 'critical', zh: '罐位高高 HH', en: 'Tank level HH'},
  {level: 'warning', zh: '末端欠压', en: 'End-of-line under-pressure'},
  {level: 'warning', zh: '罐位低低', en: 'Tank level low'},
  {level: 'warning', zh: '阀门内漏', en: 'Valve internal leak'},
  {level: 'warning', zh: 'H₂S 含量偏高', en: 'H₂S content high'},
  {level: 'info', zh: '阴保电位正常', en: 'CP potential normal'},
  {level: 'info', zh: '收发球作业', en: 'Pigging operation'},
  {level: 'info', zh: '调峰启运', en: 'Peak-shaving start'},
]
const LEVEL_COLOR = {critical: '#ff5252', warning: '#ffa726', info: '#00e676'}
const LEVEL_TXT = {critical: {zh: '严重', en: 'Critical'}, warning: {zh: '警告', en: 'Warning'}, info: {zh: '提示', en: 'Info'}}

let clock = 8 * 3600 + 30 * 60
let seed = 1
function rnd() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}
function fmtTime(s: number) {
  const h = Math.floor(s / 3600) % 24
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0')
}

const STATIONS = ['CS-1', 'CS-2', 'SV-1', 'SV-2', 'T-201', 'T-203', 'GATE-A']
const rows = ref<any[][]>([])
function pushEvent() {
  clock += 5 + Math.floor(rnd() * 40)
  const ev = POOL[Math.floor(rnd() * POOL.length)]
  const loc = STATIONS[Math.floor(rnd() * STATIONS.length)]
  const lv = LEVEL_TXT[ev.level][en.value ? 'en' : 'zh']
  rows.value.unshift([
    fmtTime(clock),
    loc,
    en.value ? ev.en : ev.zh,
    '<span style="color:' + LEVEL_COLOR[ev.level] + ';font-weight:600">● ' + lv + '</span>',
  ])
  if (rows.value.length > 20) rows.value.pop()
}
for (let i = 0; i < 8; i++) pushEvent()
watch(current, () => pushEvent())

const config = computed(() => ({
  header: [t('时间', 'Time'), t('位号', 'Tag'), t('事件', 'Event'), t('级别', 'Level')],
  data: rows.value,
  rowNum: 7,
  headerBGC: 'rgba(0,229,255,0.15)',
  oddRowBGC: 'rgba(13,35,69,0.5)',
  evenRowBGC: 'rgba(8,22,45,0.5)',
  columnWidth: [88, 72],
  align: ['center', 'center', 'left', 'center'],
  waitTime: 2400,
  carousel: 'page',
}))
const accessibleTitle = computed(() => t('管网事件滚动日志', 'Pipeline event log'))
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
