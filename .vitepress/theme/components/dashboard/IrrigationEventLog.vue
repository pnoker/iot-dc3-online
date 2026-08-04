<script setup lang="ts">
/**
 * 灌溉/告警事件滚动日志:DvScrollBoard,泊松事件驱动增量 push,保留最近 20 条。
 * 时间用递增秒计数(SSR 安全,不用 Date.now);级别用 HTML 彩色 span。
 * 灌溉调度/阀门/EC/墒情/施肥/CO₂ 补气等真实大棚事件。
 */
import {ref, computed, watch} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

// 泊松事件信号:current 每次跨阈值触发一条新事件
const {current} = useDomainSeries(
  {baseline: 0, unit: '', events: [{rate: 1 / 6, type: 'spike', size: 1}]},
  {seed: 314, window: 2, intervalMs: 1000},
)

interface Ev {level: 'critical' | 'warning' | 'info' | 'ok'; zh: string; en: string}
const POOL: Ev[] = [
  {level: 'ok', zh: '滴灌 A 区启动灌溉', en: 'Drip zone A irrigation started'},
  {level: 'info', zh: '滴灌 A 区灌溉完成', en: 'Drip zone A irrigation done'},
  {level: 'warning', zh: 'EC 偏高预警 2.6 dS/m', en: 'EC high alert 2.6 dS/m'},
  {level: 'critical', zh: '基质势低于阈值 -40 kPa', en: 'Matrix potential low -40 kPa'},
  {level: 'ok', zh: '水肥施肥完成', en: 'Fertigation completed'},
  {level: 'info', zh: 'CO₂ 补气启动', en: 'CO₂ enrichment started'},
  {level: 'warning', zh: '天窗开启通风', en: 'Roof vent opened'},
  {level: 'critical', zh: '电磁阀 V07 通信故障', en: 'Valve V07 comm fault'},
  {level: 'info', zh: '喷灌 C 区计划触发', en: 'Sprinkler zone C scheduled'},
  {level: 'ok', zh: '回水罐液位恢复', en: 'Return tank level recovered'},
  {level: 'warning', zh: 'VPD 超 1.4 kPa', en: 'VPD exceeds 1.4 kPa'},
  {level: 'info', zh: '夜间补光灯开启', en: 'Night supplemental light on'},
]
const LEVEL_COLOR = {critical: '#ff5252', warning: '#ffa726', info: '#2b9bff', ok: '#00e676'}
const LEVEL_TXT = {
  critical: {zh: '严重', en: 'Critical'},
  warning: {zh: '警告', en: 'Warn'},
  info: {zh: '提示', en: 'Info'},
  ok: {zh: '正常', en: 'OK'},
}

let clock = 6 * 3600 // 06:00:00 起
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

const ZONES = ['A', 'B', 'C', 'D']
const rows = ref<any[][]>([])
function pushEvent() {
  clock += 4 + Math.floor(rnd() * 50)
  const ev = POOL[Math.floor(rnd() * POOL.length)]
  const zone = ZONES[Math.floor(rnd() * ZONES.length)]
  const lv = LEVEL_TXT[ev.level][en.value ? 'en' : 'zh']
  rows.value.unshift([
    fmtTime(clock),
    `${en.value ? 'Zone' : '区'} ${zone}`,
    en.value ? ev.en : ev.zh,
    `<span style="color:${LEVEL_COLOR[ev.level]};font-weight:600">● ${lv}</span>`,
  ])
  if (rows.value.length > 20) rows.value.pop()
}
for (let i = 0; i < 8; i++) pushEvent()
watch(current, () => pushEvent())

const config = computed(() => ({
  header: [t('时间', 'Time'), t('分区', 'Zone'), t('事件', 'Event'), t('级别', 'Level')],
  data: rows.value,
  rowNum: 7,
  headerBGC: 'rgba(0,229,255,0.15)',
  oddRowBGC: 'rgba(13,35,69,0.5)',
  evenRowBGC: 'rgba(8,22,45,0.5)',
  columnWidth: [88, 78],
  align: ['center', 'center', 'left', 'center'],
  waitTime: 2200,
  carousel: 'page',
}))

const accessibleTitle = computed(() => t('灌溉与告警事件滚动日志', 'Irrigation & alarm event log'))
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
