<script setup lang="ts">
/**
 * 运行事件滚动日志:DvScrollBoard。泊松信号驱动增量 push,保留最近 20 条。
 * 事件池面向微电网:离网/并网切换、逆变器跳闸、PCS 故障、孤岛检测、低 SOC、过/欠压、方阵通信中断。
 */
import {ref, computed, watch} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const {current} = useDomainSeries(
  {baseline: 0, unit: '', events: [{rate: 1 / 6, type: 'spike', size: 1}]},
  {seed: 314, window: 2, intervalMs: 1000},
)

interface Ev {level: 'critical' | 'warning' | 'info'; zh: string; en: string}
const POOL: Ev[] = [
  {level: 'critical', zh: '逆变器跳闸', en: 'Inverter trip'},
  {level: 'warning', zh: '离网运行切换', en: 'Island mode engaged'},
  {level: 'info', zh: '并网恢复', en: 'Grid reconnected'},
  {level: 'critical', zh: 'PCS 故障', en: 'PCS fault'},
  {level: 'warning', zh: '低 SOC 预警', en: 'Low SOC alarm'},
  {level: 'warning', zh: '孤岛检测', en: 'Islanding detected'},
  {level: 'info', zh: '峰时放电启动', en: 'Peak discharge start'},
  {level: 'warning', zh: '过压告警', en: 'Over-voltage alarm'},
  {level: 'info', zh: '谷时充电启动', en: 'Valley charge start'},
  {level: 'warning', zh: '方阵通信中断', en: 'Array comm. lost'},
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
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const rows = ref<any[][]>([])
const DEVICES = ['PV-A1', 'PV-B2', 'PCS-01', 'INV-03', 'PCC-01', 'BESS-02', 'TR-01']
function pushEvent() {
  clock += 5 + Math.floor(rnd() * 45)
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
const accessibleTitle = computed(() => t('微电网运行事件滚动日志', 'Microgrid event log'))
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
