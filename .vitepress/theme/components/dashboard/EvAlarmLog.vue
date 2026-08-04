<script setup lang="ts">
/**
 * 充电网络告警与事件滚动日志:DvScrollBoard。泊松信号驱动增量 push,保留近 20 条。
 * 事件池:配变过载 / 站点离线 / 占位不充超时 / 急停触发 / 整流过温 / 通信中断 / 欠压 / 有序充电调度。
 */
import {ref, computed, watch} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const {current} = useDomainSeries(
  {baseline: 0, unit: '', events: [{rate: 1 / 5, type: 'spike', size: 1}]},
  {seed: 315, window: 2, intervalMs: 1000},
)

interface Ev {level: 'critical' | 'warning' | 'info'; zh: string; en: string}
const POOL: Ev[] = [
  {level: 'critical', zh: '配变过载 126%', en: 'Transformer overload 126%'},
  {level: 'warning', zh: '站点离线', en: 'Station offline'},
  {level: 'warning', zh: '占位不充超时', en: 'Idle-occupied timeout'},
  {level: 'critical', zh: '急停触发', en: 'E-stop triggered'},
  {level: 'warning', zh: '整流模块过温', en: 'Rectifier over-temp'},
  {level: 'warning', zh: '充电桩通信中断', en: 'Charger comm. lost'},
  {level: 'warning', zh: '直流母线欠压', en: 'DC bus under-voltage'},
  {level: 'info', zh: '有序充电降功率', en: 'OBMS curtail engaged'},
  {level: 'info', zh: '站点恢复在线', en: 'Station back online'},
  {level: 'critical', zh: '储能低 SOC', en: 'BESS low SOC'},
  {level: 'warning', zh: '枪头温度异常', en: 'Connector overheat'},
  {level: 'info', zh: '峰谷套利启动', en: 'Arbitrage started'},
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

const rows = ref<any[][]>([])
const DEVICES = ['TR-01', 'HSR', 'CBD', 'TECH', 'RIVER', 'GUN-DC-03', 'GUN-AC-02', 'BESS-1', 'LOGIST']
function pushEvent() {
  clock += 5 + Math.floor(rnd() * 45)
  const ev = POOL[Math.floor(rnd() * POOL.length)]
  const dev = DEVICES[Math.floor(rnd() * DEVICES.length)]
  const lv = LEVEL_TXT[ev.level][en.value ? 'en' : 'zh']
  rows.value.unshift([
    fmtTime(clock),
    dev,
    en.value ? ev.en : ev.zh,
    '<span style="color:' + LEVEL_COLOR[ev.level] + ';font-weight:600">● ' + lv + '</span>',
  ])
  if (rows.value.length > 20) rows.value.pop()
}
for (let i = 0; i < 8; i++) pushEvent()
watch(current, () => pushEvent())

const config = computed(() => ({
  header: [t('时间', 'Time'), t('设备', 'Device'), t('事件', 'Event'), t('级别', 'Level')],
  data: rows.value,
  rowNum: 7,
  headerBGC: 'rgba(0,229,255,0.15)',
  oddRowBGC: 'rgba(13,35,69,0.5)',
  evenRowBGC: 'rgba(8,22,45,0.5)',
  columnWidth: [92, 90],
  align: ['center', 'center', 'left', 'center'],
  waitTime: 2400,
  carousel: 'page',
}))
const accessibleTitle = computed(() => t('充电网络告警事件滚动日志', 'EV network alarm event log'))
</script>

<template>
  <div class="alog" role="log" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollBoard :config="config" style="width:100%;height:100%" />
      <template #fallback>
        <div class="alog-fallback">
          <div v-for="(r, i) in rows.slice(0, 7)" :key="i" class="alog-row">
            <span>{{ r[0] }}</span><span>{{ r[1] }}</span><span>{{ r[2] }}</span>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.alog { width: 100%; height: 100%; min-height: 0; }
.alog-fallback { color: var(--dc3d-text-dim); font-size: 12px; padding: 8px; }
.alog-row { display: flex; gap: 12px; padding: 4px 0; border-bottom: 1px solid var(--dc3d-panel-border); }
</style>
