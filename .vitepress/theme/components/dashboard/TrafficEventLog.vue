<script setup lang="ts">
/**
 * 交通事件滚动日志:DvScrollBoard,泊松事件驱动增量 push,保留最近 20 条。
 * 事件类型:事故/违章/信号故障/拥堵报警/设备离线。级别用 HTML 彩色 span。
 */
import {ref, computed, watch} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const {current} = useDomainSeries({baseline: 0, unit: '', events: [{rate: 1 / 4, type: 'spike', size: 1}]}, {seed: 717, window: 2, intervalMs: 1000})

interface Ev {level: 'critical' | 'warning' | 'info'; zh: string; en: string}
const POOL: Ev[] = [
  {level: 'critical', zh: '追尾事故', en: 'Rear-end collision'},
  {level: 'critical', zh: '多车连环相撞', en: 'Multi-vehicle crash'},
  {level: 'warning', zh: '违章变道', en: 'Illegal lane change'},
  {level: 'warning', zh: '闯红灯抓拍', en: 'Red-light running'},
  {level: 'critical', zh: '信号机故障', en: 'Signal controller fault'},
  {level: 'warning', zh: '路段拥堵报警', en: 'Congestion alert'},
  {level: 'warning', zh: '排队溢出 spillback', en: 'Queue spillback'},
  {level: 'info', zh: '检测器离线', en: 'Detector offline'},
  {level: 'info', zh: '事故已清除', en: 'Incident cleared'},
  {level: 'warning', zh: '违章停车', en: 'Illegal parking'},
]
const LEVEL_COLOR = {critical: '#ff5252', warning: '#ffa726', info: '#00e676'}
const LEVEL_TXT = {critical: {zh: '严重', en: 'Critical'}, warning: {zh: '警告', en: 'Warning'}, info: {zh: '提示', en: 'Info'}}

let clock = 8 * 3600
let seed = 1
function rnd() {seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff}
function fmt(s: number) {const h = Math.floor(s / 3600) % 24, m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`}

const rows = ref<any[][]>([])
const ROADS = ['人民路', '解放路', '中山路', '建国路', '滨海大道', '外环路']
const ROADS_EN = ['Renmin', 'Jiefang', 'Zhongshan', 'Jianguo', 'Binhai', 'Ring']
function pushEvent() {
  clock += 6 + Math.floor(rnd() * 45)
  const ev = POOL[Math.floor(rnd() * POOL.length)]
  const ri = Math.floor(rnd() * ROADS.length)
  const road = en.value ? ROADS_EN[ri] : ROADS[ri]
  const lv = LEVEL_TXT[ev.level][en.value ? 'en' : 'zh']
  rows.value.unshift([fmt(clock), road, en.value ? ev.en : ev.zh, `<span style="color:${LEVEL_COLOR[ev.level]};font-weight:600">● ${lv}</span>`])
  if (rows.value.length > 20) rows.value.pop()
}
for (let i = 0; i < 8; i++) pushEvent()
watch(current, () => pushEvent())

const config = computed(() => ({
  header: [t('时间', 'Time'), t('路段', 'Road'), t('事件', 'Event'), t('级别', 'Level')],
  data: rows.value, rowNum: 7,
  headerBGC: 'rgba(0,229,255,0.15)', oddRowBGC: 'rgba(13,35,69,0.5)', evenRowBGC: 'rgba(8,22,45,0.5)',
  columnWidth: [86, 96], align: ['center', 'center', 'left', 'center'], waitTime: 2000, carousel: 'page',
}))
const accessibleTitle = computed(() => t('交通事件滚动日志', 'Traffic event log'))
</script>

<template>
  <div class="elog" role="log" :aria-label="accessibleTitle">
    <ClientOnly>
      <DvScrollBoard :config="config" style="width:100%;height:100%" />
      <template #fallback>
        <div class="el-fb"><div v-for="(r, i) in rows.slice(0, 7)" :key="i" class="el-row"><span>{{ r[0] }}</span><span>{{ r[1] }}</span><span>{{ r[2] }}</span></div></div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.elog {width: 100%; height: 100%; min-height: 0;}
.el-fb {color: var(--dc3d-text-dim); font-size: 12px; padding: 8px;}
.el-row {display: flex; gap: 12px; padding: 4px 0; border-bottom: 1px solid var(--dc3d-panel-border);}
</style>
