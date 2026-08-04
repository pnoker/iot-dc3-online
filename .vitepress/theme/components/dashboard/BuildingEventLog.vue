<script setup lang="ts">
/**
 * 楼宇安防/运维事件滚动日志:DvScrollBoard,泊松事件驱动增量 push,保留最近 20 条。
 * 时间用递增秒计数(SSR 安全,不用 Date.now);级别用 HTML 彩色 span。
 * 事件:门禁刷卡/报修工单/访客登记/消防报警/CO₂超标/AHU故障/漏水报警。
 */
import {ref, computed, watch} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

// 泊松事件信号
const {current} = useDomainSeries(
  {baseline: 0, unit: '', events: [{rate: 1 / 6, type: 'spike', size: 1}]},
  {seed: 314, window: 2, intervalMs: 1000},
)

interface Ev {level: 'critical' | 'warning' | 'info'; zh: string; en: string}
const POOL: Ev[] = [
  {level: 'info', zh: '门禁刷卡进入', en: 'Access card swipe'},
  {level: 'warning', zh: '报修工单提交', en: 'Repair ticket filed'},
  {level: 'info', zh: '访客登记', en: 'Visitor check-in'},
  {level: 'warning', zh: '室温偏离设定', en: 'Temp deviation'},
  {level: 'critical', zh: '消防探测器报警', en: 'Fire detector alarm'},
  {level: 'warning', zh: 'CO₂ 浓度超标', en: 'CO₂ exceeded'},
  {level: 'critical', zh: 'AHU 机组故障', en: 'AHU fault'},
  {level: 'info', zh: '电梯运行正常', en: 'Lift normal'},
  {level: 'warning', zh: '漏水报警', en: 'Leak detected'},
]
const LEVEL_COLOR = {critical: '#ff5252', warning: '#ffa726', info: '#00e676'}
const LEVEL_TXT = {critical: {zh: '紧急', en: 'Critical'}, warning: {zh: '告警', en: 'Warn'}, info: {zh: '提示', en: 'Info'}}

let clock = 8 * 3600
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

const LOCS = ['B1', '1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F']
const rows = ref<any[][]>([])
function pushEvent() {
  clock += 6 + Math.floor(rnd() * 45)
  const ev = POOL[Math.floor(rnd() * POOL.length)]
  const loc = `${LOCS[Math.floor(rnd() * LOCS.length)]}·${String.fromCharCode(65 + Math.floor(rnd() * 6))}`
  const lv = LEVEL_TXT[ev.level][en.value ? 'en' : 'zh']
  rows.value.unshift([
    fmtTime(clock),
    loc,
    en.value ? ev.en : ev.zh,
    `<span style="color:${LEVEL_COLOR[ev.level]};font-weight:600">● ${lv}</span>`,
  ])
  if (rows.value.length > 20) rows.value.pop()
}
for (let i = 0; i < 8; i++) pushEvent()
watch(current, () => pushEvent())

const config = computed(() => ({
  header: [t('时间', 'Time'), t('位置', 'Location'), t('事件', 'Event'), t('级别', 'Level')],
  data: rows.value,
  rowNum: 7,
  headerBGC: 'rgba(0,229,255,0.15)',
  oddRowBGC: 'rgba(13,35,69,0.5)',
  evenRowBGC: 'rgba(8,22,45,0.5)',
  columnWidth: [92, 84],
  align: ['center', 'center', 'left', 'center'],
  waitTime: 2400,
  carousel: 'page',
}))
const accessibleTitle = computed(() => t('楼宇安防与运维事件日志', 'Building security & operations event log'))
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
