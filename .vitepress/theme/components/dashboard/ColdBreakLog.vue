<script setup lang="ts">
/**
 * 断链告警滚动日志:DvScrollBoard,泊松事件驱动增量 push,保留最近 20 条。
 * 事件池:温度越限/制冷失效/门封漏温/延时越温/湿度超标/冷媒泄漏/GPS 失联。
 */
import {ref, computed, watch} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const {current} = useDomainSeries(
  {baseline: 0, unit: '', events: [{rate: 1 / 5, type: 'spike', size: 1}]},
  {seed: 314, window: 2, intervalMs: 1000},
)

interface Ev {level: 'critical' | 'warning' | 'info'; zh: string; en: string}
const POOL: Ev[] = [
  {level: 'critical', zh: '冷冻区温度越上限', en: 'Frozen zone over temp'},
  {level: 'critical', zh: '制冷机组失效', en: 'Reefer unit failure'},
  {level: 'critical', zh: '冷媒泄漏', en: 'Refrigerant leak'},
  {level: 'warning', zh: '门封漏温', en: 'Door seal leak'},
  {level: 'warning', zh: '干线延时越温', en: 'Linehaul delay warm-up'},
  {level: 'warning', zh: '湿度超标', en: 'Humidity exceed'},
  {level: 'info', zh: '温度回落正常', en: 'Temp recovered'},
  {level: 'info', zh: '到货验收合格', en: 'Arrival accepted'},
]
const LEVEL_COLOR = {critical: '#ff5252', warning: '#ffa726', info: '#00e676'}
const LEVEL_TXT = {critical: {zh: '严重', en: 'Critical'}, warning: {zh: '警告', en: 'Warning'}, info: {zh: '提示', en: 'Info'}}
const LAYERS = ['冷藏', '冷冻', '恒温', '缓冲']
const LAYERS_EN = ['Chilled', 'Frozen', 'Constant', 'Buffer']

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
function pushEvent() {
  clock += 4 + Math.floor(rnd() * 32)
  const ev = POOL[Math.floor(rnd() * POOL.length)]
  const li = Math.floor(rnd() * 4)
  const layer = en.value ? LAYERS_EN[li] : LAYERS[li]
  const veh = 'BJ-' + String(7300 + Math.floor(rnd() * 199))
  const lv = LEVEL_TXT[ev.level][en.value ? 'en' : 'zh']
  rows.value.unshift([
    fmtTime(clock),
    veh,
    layer,
    en.value ? ev.en : ev.zh,
    `<span style="color:${LEVEL_COLOR[ev.level]};font-weight:600">● ${lv}</span>`,
  ])
  if (rows.value.length > 20) rows.value.pop()
}
for (let i = 0; i < 8; i++) pushEvent()
watch(current, () => pushEvent())

const config = computed(() => ({
  header: [t('时间', 'Time'), t('车牌', 'Vehicle'), t('温层', 'Layer'), t('事件', 'Event'), t('级别', 'Level')],
  data: rows.value,
  rowNum: 7,
  headerBGC: 'rgba(0,229,255,0.15)',
  oddRowBGC: 'rgba(13,35,69,0.5)',
  evenRowBGC: 'rgba(8,22,45,0.5)',
  columnWidth: [82, 82, 64],
  align: ['center', 'center', 'center', 'left', 'center'],
  waitTime: 2200,
  carousel: 'page',
}))
const accessibleTitle = computed(() => t('断链告警滚动日志', 'Cold-chain break alarm log'))
</script>

<template>
  <div class="event-log" role="log" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollBoard :config="config" style="width:100%;height:100%" />
      <template #fallback>
        <div class="el-fallback">
          <div v-for="(r, i) in rows.slice(0, 7)" :key="i" class="el-row">
            <span>{{ r[0] }}</span><span>{{ r[1] }}</span><span>{{ r[3] }}</span>
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
