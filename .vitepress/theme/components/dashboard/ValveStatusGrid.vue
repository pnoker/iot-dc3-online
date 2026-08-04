<script setup lang="ts">
/**
 * 电磁阀/喷头状态矩阵(纯 SVG/CSS,栅格 4×3=12 阀)。
 * 12 阀分属 A/B/C/D 四区(每区 3 阀),状态:正在灌溉(open)/ 常闭(closed)/ 故障(fault)/ 计划(planned)。
 * 一个实时信号驱动"当前灌溉区"在 A-D 间轮转 → 对应区 3 阀齐开,其余常闭;
 * 1 阀固定故障、2 阀计划,贴近真实灌溉轮灌制度。
 * 色盲冗余:状态叠字形(▲/○/✕/◷)。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

// 实时轮灌信号:0..1 慢漂移,activeZone = floor(live*4) → 当前灌溉区 A/B/C/D
const {current: live} = useDomainSeries(
  {baseline: 0.5, unit: '', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 45), cycleAmp: 0.5, noiseAmp: 0.04},
  {intervalMs: 2200, seed: 99},
)
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

const ZONES = ['A', 'B', 'C', 'D']
// 固定故障阀 / 计划阀索引(V06 故障,V11/V12 计划)
const FAULT_IDX = 5
const PLANNED_IDX = [10, 11]

const STATUS = {
  open: {color: '#00e5ff', glyph: '▲', zh: '灌溉', en: 'Open'},
  closed: {color: '#6b8cae', glyph: '○', zh: '常闭', en: 'Closed'},
  fault: {color: '#ff5252', glyph: '✕', zh: '故障', en: 'Fault'},
  planned: {color: '#ffb020', glyph: '◷', zh: '计划', en: 'Planned'},
} as const
type StatusKey = keyof typeof STATUS

const valves = computed(() => {
  const lv = clamp(live.value, 0, 1)
  const activeZone = Math.min(3, Math.floor(lv * 4))
  return Array.from({length: 12}, (_, i) => {
    let st: StatusKey = 'closed'
    if (i === FAULT_IDX) st = 'fault'
    else if (PLANNED_IDX.includes(i)) st = 'planned'
    else if (Math.floor(i / 3) === activeZone) st = 'open'
    const meta = STATUS[st]
    return {
      idx: i,
      name: `V${String(i + 1).padStart(2, '0')}`,
      zone: ZONES[Math.floor(i / 3)],
      status: st,
      color: meta.color,
      glyph: meta.glyph,
      label: t(meta.zh, meta.en),
    }
  })
})

// 图例统计
const counts = computed(() => {
  const c: Record<StatusKey, number> = {open: 0, closed: 0, fault: 0, planned: 0}
  for (const v of valves.value) c[v.status]++
  return c
})

const legend: {key: StatusKey}[] = [{key: 'open'}, {key: 'closed'}, {key: 'planned'}, {key: 'fault'}]
const accessibleTitle = computed(() => t('灌溉电磁阀状态矩阵', 'Irrigation solenoid valve status matrix'))
</script>

<template>
  <div class="valves" role="group" :aria-label="accessibleTitle">
    <div class="valves__grid">
      <div v-for="v in valves" :key="v.idx" class="valve" :class="'valve--' + (v.status)" :style="{'--c': v.color}">
        <svg class="valve__icon" viewBox="0 0 24 24" aria-hidden="true">
          <!-- 阀体:两个三角组成蝶阀/闸阀符号 -->
          <path d="M5,7 L12,12 L5,17 Z" :fill="v.color" :stroke="v.color" stroke-width="0.5" opacity="0.85" />
          <path d="M19,7 L12,12 L19,17 Z" :fill="v.color" :stroke="v.color" stroke-width="0.5" opacity="0.55" />
          <line x1="12" y1="3" x2="12" y2="7" :stroke="v.color" stroke-width="1.4" />
          <circle cx="12" cy="12" r="2" :fill="v.color" />
        </svg>
        <div class="valve__meta">
          <span class="valve__name">{{ v.name }}</span>
          <span class="valve__zone">{{ t('区', 'Z') }}{{ v.zone }}</span>
        </div>
        <span class="valve__status">
          <span class="valve__glyph" :style="{color: v.color}">{{ v.glyph }}</span>
          <span class="valve__lbl">{{ v.label }}</span>
        </span>
      </div>
    </div>
    <div class="valves__legend">
      <span v-for="l in legend" :key="l.key" class="valves__leg">
        <i class="valves__dot" :style="{background: STATUS[l.key].color}" />
        {{ t(STATUS[l.key].zh, STATUS[l.key].en) }}
        <em :style="{color: STATUS[l.key].color}">{{ counts[l.key] }}</em>
      </span>
    </div>
  </div>
</template>

<style scoped>
.valves {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 8px;
  box-sizing: border-box;
}
.valves__grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 1fr;
  gap: 6px;
  min-height: 0;
}
.valve {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--c) 8%, rgba(8, 22, 45, 0.55));
  box-shadow: inset 0 0 10px color-mix(in srgb, var(--c) 10%, transparent);
  padding: 4px 2px;
  min-height: 0;
  overflow: hidden;
}
.valve--open {
  animation: valve-pulse 1.6s ease-in-out infinite;
}
@keyframes valve-pulse {
  0%, 100% {box-shadow: inset 0 0 10px color-mix(in srgb, var(--c) 18%, transparent), 0 0 6px color-mix(in srgb, var(--c) 35%, transparent);}
  50% {box-shadow: inset 0 0 14px color-mix(in srgb, var(--c) 30%, transparent), 0 0 14px color-mix(in srgb, var(--c) 60%, transparent);}
}
.valve__icon {
  width: 26px;
  height: 26px;
  filter: drop-shadow(0 0 4px color-mix(in srgb, var(--c) 60%, transparent));
}
.valve__meta {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.valve__name {
  font-size: 11px;
  font-weight: 700;
  color: var(--dc3d-text, #d4ecff);
  font-family: var(--dc3d-mono, monospace);
}
.valve__zone {
  font-size: 9px;
  color: var(--dc3d-text-dim, #6b8cae);
}
.valve__status {
  display: flex;
  align-items: center;
  gap: 2px;
}
.valve__glyph {
  font-size: 11px;
  line-height: 1;
}
.valve__lbl {
  font-size: 9px;
  color: var(--dc3d-text-dim, #6b8cae);
  letter-spacing: 0.3px;
}
.valves__legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  font-size: 10px;
  color: var(--dc3d-text-dim, #6b8cae);
  flex-shrink: 0;
}
.valves__leg {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.valves__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.valves__leg em {
  font-style: normal;
  font-weight: 700;
  font-family: var(--dc3d-mono, monospace);
}
</style>
