<script setup lang="ts">
/**
 * 矿山安全事件滚动日志:DvScrollBoard,泊松事件驱动增量 push,保留最近 20 条。
 * 事件类型:瓦斯超限/瓦斯断电/人员误入禁入区/主扇停机/局扇停风/顶板离层/水仓高水位/设备过载。
 * 级别用 HTML 彩色 span。
 */
import {ref, computed, watch} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const {current} = useDomainSeries({baseline: 0, unit: '', events: [{rate: 1 / 5, type: 'spike', size: 1}]}, {seed: 818, window: 2, intervalMs: 1000})

interface Ev {level: 'critical' | 'warning' | 'info'; zh: string; en: string}
const POOL: Ev[] = [
  {level: 'critical', zh: '瓦斯超限报警', en: 'Gas over-limit alarm'},
  {level: 'critical', zh: '瓦斯断电动作', en: 'Gas-triggered power cut'},
  {level: 'critical', zh: '人员误入禁入区', en: 'Intrusion into goaf'},
  {level: 'critical', zh: '主扇停机', en: 'Main fan trip'},
  {level: 'warning', zh: '局扇停风', en: 'Aux fan stop'},
  {level: 'warning', zh: '瓦斯浓度上升趋势', en: 'Gas rising trend'},
  {level: 'warning', zh: '风门短路漏风', en: 'Door short-circuit'},
  {level: 'warning', zh: '顶板离层告警', en: 'Roof delamination'},
  {level: 'warning', zh: '水仓高水位', en: 'Sump high level'},
  {level: 'info', zh: '设备过载', en: 'Equipment overload'},
  {level: 'info', zh: '人员升井', en: 'Staff surfaced'},
  {level: 'info', zh: '班次交接', en: 'Shift handover'},
]
const LEVEL_COLOR = {critical: '#ff5252', warning: '#ffa726', info: '#00e676'}
const LEVEL_TXT = {critical: {zh: '紧急', en: 'Critical'}, warning: {zh: '警告', en: 'Warning'}, info: {zh: '提示', en: 'Info'}}

let clock = 8 * 3600
let seed = 7
function rnd() {seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff}
function fmt(s: number) {const h = Math.floor(s / 3600) % 24, m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`}

const rows = ref<any[][]>([])
const LOCS_ZH = ['1301 综采面', '1302 掘进头', '运输大巷', '回风巷', '主井底', '风井']
const LOCS_EN = ['1301 Face', '1302 Head', 'Transport', 'Return', 'Shaft Bot.', 'Return Shaft']
function pushEvent() {
  clock += 6 + Math.floor(rnd() * 45)
  const ev = POOL[Math.floor(rnd() * POOL.length)]
  const li = Math.floor(rnd() * LOCS_ZH.length)
  const loc = en.value ? LOCS_EN[li] : LOCS_ZH[li]
  const lv = LEVEL_TXT[ev.level][en.value ? 'en' : 'zh']
  rows.value.unshift([fmt(clock), loc, en.value ? ev.en : ev.zh, `<span style="color:${LEVEL_COLOR[ev.level]};font-weight:600">● ${lv}</span>`])
  if (rows.value.length > 20) rows.value.pop()
}
for (let i = 0; i < 8; i++) pushEvent()
watch(current, () => pushEvent())

const config = computed(() => ({
  header: [t('时间', 'Time'), t('位置', 'Location'), t('事件', 'Event'), t('级别', 'Level')],
  data: rows.value, rowNum: 7,
  headerBGC: 'rgba(0,229,255,0.15)', oddRowBGC: 'rgba(13,35,69,0.5)', evenRowBGC: 'rgba(8,22,45,0.5)',
  columnWidth: [80, 100], align: ['center', 'center', 'left', 'center'], waitTime: 2000, carousel: 'page',
}))
const accessibleTitle = computed(() => t('矿山安全事件滚动日志', 'Mine safety event log'))
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
