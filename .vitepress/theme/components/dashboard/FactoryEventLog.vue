<script setup lang="ts">
/**
 * 生产事件滚动日志:DvScrollBoard,泊松事件驱动增量 push,保留最近 20 条。
 * 时间用递增秒计数(SSR 安全,不用 Date.now);级别用 HTML 彩色 span。
 */
import {ref, computed, watch} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

// 泊松事件信号:current 每次跨过阈值触发一条新事件
const {current} = useDomainSeries(
  {baseline: 0, unit: '', events: [{rate: 1 / 5, type: 'spike', size: 1}]},
  {seed: 314, window: 2, intervalMs: 1000},
)

interface Ev {level: 'critical' | 'warning' | 'info'; zh: string; en: string}
const POOL: Ev[] = [
  {level: 'critical', zh: '设备故障停机', en: 'Equipment breakdown'},
  {level: 'warning', zh: '换型超时', en: 'Changeover overtime'},
  {level: 'warning', zh: '缺料停机', en: 'Material shortage'},
  {level: 'info', zh: 'FPY 偏低预警', en: 'FPY low warning'},
  {level: 'warning', zh: '节拍偏离', en: 'Takt deviation'},
  {level: 'info', zh: '计划完成', en: 'Plan completed'},
  {level: 'info', zh: '首件检验通过', en: 'FAI passed'},
]
const LEVEL_COLOR = {critical: '#ff5252', warning: '#ffa726', info: '#00e676'}
const LEVEL_TXT = {critical: {zh: '严重', en: 'Critical'}, warning: {zh: '警告', en: 'Warning'}, info: {zh: '提示', en: 'Info'}}

let clock = 8 * 3600 + 30 * 60 // 08:30:00 起
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
  clock += 5 + Math.floor(rnd() * 40)
  const ev = POOL[Math.floor(rnd() * POOL.length)]
  const line = `L${1 + Math.floor(rnd() * 8)}·S${1 + Math.floor(rnd() * 6)}`
  const lv = LEVEL_TXT[ev.level][en.value ? 'en' : 'zh']
  rows.value.unshift([
    fmtTime(clock),
    line,
    en.value ? ev.en : ev.zh,
    `<span style="color:${LEVEL_COLOR[ev.level]};font-weight:600">● ${lv}</span>`,
  ])
  if (rows.value.length > 20) rows.value.pop()
}
// 首屏回填 8 条
for (let i = 0; i < 8; i++) pushEvent()
watch(current, () => pushEvent())

const config = computed(() => ({
  header: [t('时间', 'Time'), t('产线·工位', 'Line·Station'), t('事件', 'Event'), t('级别', 'Level')],
  data: rows.value,
  rowNum: 7,
  headerBGC: 'rgba(0,229,255,0.15)',
  oddRowBGC: 'rgba(13,35,69,0.5)',
  evenRowBGC: 'rgba(8,22,45,0.5)',
  columnWidth: [92, 110],
  align: ['center', 'center', 'left', 'center'],
  waitTime: 2200,
  carousel: 'page',
}))
const accessibleTitle = computed(() => t('生产事件滚动日志', 'Production event log'))
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
