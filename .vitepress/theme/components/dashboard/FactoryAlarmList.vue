<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useDomainSeries } from '../../composables/useDomainSeries'
import { useI18n } from '../../composables/useI18n'

type Severity = 'critical' | 'warning' | 'info'
type AlarmStatus = 'active' | 'acknowledged' | 'resolved'

interface Alarm {
  id: number
  time: number
  line: string
  station: string
  typeKey: string
  severity: Severity
  status: AlarmStatus
}

// 告警类型池:严重度随类型绑定,色盲双重编码(图标形 + 语义色 + 文本)
const TYPE_POOL: { key: string; zh: string; en: string; severity: Severity }[] = [
  { key: 'equipment', zh: '设备故障', en: 'Equipment Fault', severity: 'critical' },
  { key: 'fpy', zh: 'FPY<95%', en: 'FPY<95%', severity: 'warning' },
  { key: 'takt', zh: '节拍偏离', en: 'Takt Deviation', severity: 'warning' },
  { key: 'changeover', zh: '换型超时', en: 'Changeover Timeout', severity: 'warning' },
  { key: 'oee', zh: 'OEE<60%', en: 'OEE<60%', severity: 'info' },
]

const SEV_META: Record<Severity, { icon: string; color: string; zh: string; en: string }> = {
  critical: { icon: '▲', color: '#dc2626', zh: '严重', en: 'Critical' },
  warning: { icon: '⚠', color: '#d97706', zh: '警告', en: 'Warning' },
  info: { icon: 'ℹ', color: '#0a6cb2', zh: '提示', en: 'Info' },
}

const STATUS_META: Record<AlarmStatus, { zh: string; en: string }> = {
  active: { zh: '待处理', en: 'Active' },
  acknowledged: { zh: '处理中', en: 'Handling' },
  resolved: { zh: '已解除', en: 'Resolved' },
}

defineProps<{ accessibleTitle?: string }>()

const { t } = useI18n()

const alarms = ref<Alarm[]>([])
let nextId = 1

// 用 useDomainSeries 驱动告警生成:baseline 0,泊松事件触发 step(size 1, duration 2s)
// duration >= 采样间隔保证上升沿被捕获;内置 SSR 安全 + 后台/全局暂停
const { current } = useDomainSeries(
  { baseline: 0, unit: '', events: [{ rate: 1 / 8, type: 'step', size: 1, duration: 2 }] },
  { intervalMs: 1000, window: 60, seed: 42 },
)

function rand(n: number): number {
  return Math.floor(Math.random() * n)
}

function makeAlarm(time: number): Alarm {
  const type = TYPE_POOL[rand(TYPE_POOL.length)]
  const r = Math.random()
  const status: AlarmStatus = r < 0.62 ? 'active' : r < 0.85 ? 'acknowledged' : 'resolved'
  return {
    id: nextId++,
    time,
    line: `L${1 + rand(8)}`,
    station: `S${1 + rand(6)}`,
    typeKey: type.key,
    severity: type.severity,
    status,
  }
}

function pushAlarm(): void {
  // 新告警置于顶部,保留最近 8 条
  alarms.value = [makeAlarm(Date.now()), ...alarms.value].slice(0, 8)
}

// 检测信号上升沿(跨阈值)→ 触发一条新告警
watch(current, (v, oldV) => {
  if ((oldV ?? 0) <= 0.5 && v > 0.5) pushAlarm()
})

// 客户端回填几条历史告警,避免首屏空列表(onMounted 仅客户端,无 hydration 不匹配)
onMounted(() => {
  const now = Date.now()
  const back: Alarm[] = []
  for (let i = 0; i < 5; i++) {
    back.push(makeAlarm(now - (i + 1) * (15 + rand(35)) * 1000))
  }
  alarms.value = back
})

function typeLabel(key: string): { zh: string; en: string } {
  return TYPE_POOL.find((x) => x.key === key) ?? TYPE_POOL[0]
}
function sevMeta(s: Severity) {
  return SEV_META[s]
}
function statusMeta(s: AlarmStatus) {
  return STATUS_META[s]
}
function formatTime(ts: number): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
</script>

<template>
  <section
    class="alarm-list"
    :aria-label="accessibleTitle || t('实时告警', 'Live Alarms')"
  >
    <header class="alarm-head">
      <div class="alarm-row alarm-head-row">
        <span class="col-time">{{ t('时间', 'Time') }}</span>
        <span class="col-loc">{{ t('产线·工位', 'Line·Station') }}</span>
        <span class="col-type">{{ t('类型', 'Type') }}</span>
        <span class="col-level">{{ t('级别', 'Level') }}</span>
        <span class="col-status">{{ t('状态', 'Status') }}</span>
      </div>
    </header>

    <TransitionGroup
      v-if="alarms.length"
      tag="ul"
      name="alarm"
      class="alarm-body"
      role="log"
      aria-live="polite"
    >
      <li
        v-for="a in alarms"
        :key="a.id"
        class="alarm-row alarm-item"
        :class="`sev-${a.severity}`"
        :style="{ '--sev': sevMeta(a.severity).color }"
      >
        <span class="col-time">{{ formatTime(a.time) }}</span>
        <span class="col-loc">{{ a.line }}·{{ a.station }}</span>
        <span class="col-type" :title="t(typeLabel(a.typeKey).zh, typeLabel(a.typeKey).en)">
          {{ t(typeLabel(a.typeKey).zh, typeLabel(a.typeKey).en) }}
        </span>
        <span class="col-level">
          <span class="sev-ico" aria-hidden="true">{{ sevMeta(a.severity).icon }}</span>
          {{ t(sevMeta(a.severity).zh, sevMeta(a.severity).en) }}
        </span>
        <span class="col-status" :class="`st-${a.status}`">
          {{ t(statusMeta(a.status).zh, statusMeta(a.status).en) }}
        </span>
      </li>
    </TransitionGroup>

    <p v-else class="alarm-empty">{{ t('暂无告警', 'No active alarms') }}</p>
  </section>
</template>

<style scoped>
.alarm-list {
  /* 中性变量:父级卡片可覆盖以适配明暗主题 */
  --al-muted: rgba(132, 132, 132, 0.75);
  --al-border: rgba(132, 132, 132, 0.16);
  --al-head-bg: rgba(132, 132, 132, 0.07);
  --al-hover: rgba(132, 132, 132, 0.06);

  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  font-size: 12px;
  line-height: 1.4;
}

.alarm-head {
  flex: 0 0 auto;
}

.alarm-row {
  display: grid;
  grid-template-columns: 54px 1fr 1.3fr 82px 64px;
  gap: 6px;
  align-items: center;
  padding: 5px 10px;
}

.alarm-head-row {
  color: var(--al-muted);
  font-weight: 600;
  letter-spacing: 0.02em;
  background: var(--al-head-bg);
  border-top: 1px solid var(--al-border);
  border-bottom: 1px solid var(--al-border);
  white-space: nowrap;
}

.alarm-body {
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
  position: relative;
}

.alarm-item {
  border-bottom: 1px solid var(--al-border);
  /* severity 色标条:inset 阴影不占布局,表头行对齐不受影响 */
  box-shadow: inset 3px 0 0 var(--sev, transparent);
  transition: background 0.2s ease;
}

.alarm-item:hover {
  background: var(--al-hover);
}

.col-time {
  font-variant-numeric: tabular-nums;
  color: var(--al-muted);
  font-size: 11px;
  white-space: nowrap;
}

.col-loc {
  white-space: nowrap;
}

.col-type {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-level {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.sev-ico {
  color: var(--sev);
  font-size: 11px;
  line-height: 1;
}

.col-status {
  text-align: center;
  font-size: 11px;
  white-space: nowrap;
}

/* 状态区分:权重 + 透明度,不引入额外语义色以免与级别色混淆 */
.st-active {
  font-weight: 600;
}
.st-acknowledged {
  opacity: 0.85;
}
.st-resolved {
  opacity: 0.5;
  text-decoration: line-through;
}

.alarm-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 24px;
  color: var(--al-muted);
  font-size: 12px;
}

/* 新告警从顶部滑入;满 8 条时尾部滑出 */
.alarm-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.alarm-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
  position: absolute;
  left: 0;
  right: 0;
}
.alarm-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.alarm-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
.alarm-move {
  transition: transform 0.4s ease;
}

@media (prefers-reduced-motion: reduce) {
  .alarm-enter-active,
  .alarm-leave-active,
  .alarm-move {
    transition: none;
  }
}
</style>
