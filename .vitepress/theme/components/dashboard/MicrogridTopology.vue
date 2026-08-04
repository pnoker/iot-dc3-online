<script setup lang="ts">
/**
 * 招牌①:电气单线拓扑 SLD(纯 SVG + CSS,布局完全可控)。
 * 潮流:光伏方阵→直流汇流→并网逆变器→AC母线;储能PCS→母线;
 *      母线→变压器→PCC并网点→电网;母线→负荷。
 * 潮流方向用 CSS 流动虚线表充/放/购/售;PCS 与电网支路按功率符号反向;
 * 过载支路(负荷)红脉冲。色盲冗余:支路叠方向箭头与 ±kW 文本。
 */
import {computed, ref, onMounted} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = !import.meta.env.SSR && matchMedia('(prefers-reduced-motion: reduce)').matches
})

// 四路实时功率,决定潮流方向与支路状态。
const pv = useDomainSeries(
  {baseline: 520, unit: 'kW', cycle: (s) => Math.sin(s / 120), cycleAmp: 0.12, noiseAmp: 12},
  {seed: 11, window: 2},
).current
const bess = useDomainSeries(
  {baseline: 90, unit: 'kW', cycle: (s) => Math.sin(s / 90 + 1), cycleAmp: 0.5, noiseAmp: 8},
  {seed: 22, window: 2},
).current // 正=放电(BESS→母线),负=充电(母线→BESS)
const grid = useDomainSeries(
  {baseline: -40, unit: 'kW', cycle: (s) => Math.sin(s / 100 + 2), cycleAmp: 1.2, noiseAmp: 10},
  {seed: 33, window: 2},
).current // 正=购电(电网→母线),负=售电(母线→电网)
const load = useDomainSeries(
  {baseline: 620, unit: 'kW', cycle: (s) => Math.sin(s / 80 + 0.5), cycleAmp: 0.08, noiseAmp: 14},
  {seed: 44, window: 2},
).current

const LABEL = {
  pv: () => t('光伏方阵', 'PV Array'),
  dcc: () => t('直流汇流', 'DC Comb.'),
  inv: () => t('并网逆变器', 'Inverter'),
  bess: () => t('储能电池', 'BESS'),
  pcs: () => t('储能 PCS', 'PCS'),
  bus: () => t('AC 母线', 'AC Bus'),
  trafo: () => t('变压器', 'Transformer'),
  pcc: () => t('PCC 并网点', 'PCC'),
  grid: () => t('电网', 'Grid'),
  load: () => t('负荷', 'Load'),
}

// PCS 支路方向:放电→上流(normal),充电→下流(reverse)
const pcsDir = computed(() => (bess.value >= 0 ? 'up' : 'down'))
// 电网支路方向:购电→左流(grid→bus,reverse),售电→右流(bus→grid,normal)
const gridDir = computed(() => (grid.value >= 0 ? 'buy' : 'sell'))
// 负荷过载:负荷>750 视为重载,红脉冲
const overload = computed(() => load.value > 750)

const pvKw = computed(() => Math.round(Math.max(0, pv.value)))
const bessKw = computed(() => Math.round(bess.value))
const gridKw = computed(() => Math.round(grid.value))
const loadKw = computed(() => Math.round(Math.max(0, load.value)))

const bessTxt = computed(() => (bessKw.value >= 0 ? `+${bessKw.value}` : `${bessKw.value}`))
const gridTxt = computed(() => (gridKw.value >= 0 ? `+${gridKw.value}` : `${gridKw.value}`))
const bessLabel = computed(() => (bessKw.value >= 0 ? t('放电', 'Discharge') : t('充电', 'Charge')))
const gridLabel = computed(() => (gridKw.value >= 0 ? t('购电', 'Import') : t('售电', 'Export')))

const accessibleTitle = computed(() => t('光储充用电气单线拓扑图', 'Microgrid single-line diagram'))
</script>

<template>
  <div class="sld" :class="{still: reducedMotion}" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 720 360" preserveAspectRatio="xMidYMid meet" class="sld-svg" aria-hidden="true">
      <!-- 导线底色 -->
      <g stroke="rgba(0,229,255,0.35)" stroke-width="2" fill="none">
        <line x1="115" y1="60" x2="145" y2="60" />
        <line x1="215" y1="60" x2="250" y2="60" />
        <line x1="290" y1="80" x2="290" y2="180" />
        <line x1="115" y1="300" x2="145" y2="300" />
        <line x1="215" y1="300" x2="290" y2="300" />
        <line x1="290" y1="300" x2="290" y2="320" />
        <line x1="290" y1="320" x2="345" y2="320" />
        <line x1="180" y1="280" x2="180" y2="180" />
        <line x1="360" y1="180" x2="360" y2="278" />
        <line x1="430" y1="180" x2="460" y2="180" />
        <line x1="520" y1="180" x2="544" y2="180" />
        <line x1="576" y1="180" x2="625" y2="180" />
      </g>

      <!-- AC 母线(粗) -->
      <line x1="140" y1="180" x2="430" y2="180" stroke="#00e5ff" stroke-width="5" opacity="0.85" />
      <line x1="140" y1="180" x2="430" y2="180" stroke="#fff" stroke-width="1.4" opacity="0.6" />

      <!-- 潮流流动:光伏→母线(恒向) -->
      <line x1="290" y1="80" x2="290" y2="180" class="flow flow-down" />
      <!-- PCS 支路:方向随 bess 符号 -->
      <line x1="180" y1="280" x2="180" y2="180" class="flow" :class="pcsDir === 'up' ? 'flow-up' : 'flow-down'" />
      <!-- 电网支路:方向随 grid 符号 -->
      <line x1="430" y1="180" x2="625" y2="180" class="flow" :class="gridDir === 'sell' ? 'flow-right' : 'flow-left'" />
      <!-- 负荷支路:母线→负荷 -->
      <line x1="360" y1="180" x2="360" y2="278" class="flow flow-down" :class="{'flow-overload': overload}" />

      <!-- 节点:光伏方阵 -->
      <g transform="translate(25,38)">
        <rect width="90" height="44" rx="4" class="nd nd-pv" />
        <text x="45" y="20" text-anchor="middle" class="t-title">{{ LABEL.pv() }}</text>
        <text x="45" y="35" text-anchor="middle" class="t-kw t-green">{{ pvKw }} kW</text>
      </g>
      <!-- DC 汇流 -->
      <g transform="translate(145,42)">
        <rect width="70" height="36" rx="3" class="nd" />
        <text x="35" y="22" text-anchor="middle" class="t-title">{{ LABEL.dcc() }}</text>
      </g>
      <!-- 逆变器 -->
      <g transform="translate(250,40)">
        <rect width="80" height="40" rx="3" class="nd nd-inv" />
        <text x="40" y="18" text-anchor="middle" class="t-title">{{ LABEL.inv() }}</text>
        <text x="40" y="32" text-anchor="middle" class="t-sub">DC→AC</text>
      </g>
      <!-- 储能电池 -->
      <g transform="translate(25,278)">
        <rect width="90" height="44" rx="4" class="nd nd-bess" />
        <text x="45" y="20" text-anchor="middle" class="t-title">{{ LABEL.bess() }}</text>
        <text x="45" y="35" text-anchor="middle" class="t-kw t-amber">{{ bessTxt }} kW</text>
      </g>
      <!-- PCS -->
      <g transform="translate(145,282)">
        <rect width="70" height="36" rx="3" class="nd nd-pcs" />
        <text x="35" y="15" text-anchor="middle" class="t-title">{{ LABEL.pcs() }}</text>
        <text x="35" y="28" text-anchor="middle" class="t-sub">{{ bessLabel }}</text>
      </g>
      <!-- 母线标签 -->
      <text x="285" y="172" text-anchor="middle" class="t-bus">{{ LABEL.bus() }} · 0.4 kV</text>
      <!-- 负荷 -->
      <g transform="translate(315,278)">
        <rect width="90" height="44" rx="4" class="nd" :class="{'nd-overload': overload}" />
        <text x="45" y="20" text-anchor="middle" class="t-title">{{ LABEL.load() }}</text>
        <text x="45" y="35" text-anchor="middle" class="t-kw" :class="overload ? 't-red' : 't-purple'">{{ loadKw }} kW</text>
      </g>
      <!-- 变压器 -->
      <g transform="translate(460,155)">
        <rect width="60" height="50" rx="3" class="nd" />
        <circle cx="30" cy="25" r="13" fill="none" stroke="#00e5ff" stroke-width="1.4" opacity="0.8" />
        <text x="30" y="44" text-anchor="middle" class="t-sub">{{ LABEL.trafo() }}</text>
      </g>
      <!-- PCC 并网点(断路器) -->
      <g transform="translate(560,180)">
        <circle r="16" class="pcc-ring" />
        <circle r="9" class="pcc-core" />
        <text y="34" text-anchor="middle" class="t-pcc">{{ LABEL.pcc() }}</text>
      </g>
      <!-- 电网 -->
      <g transform="translate(625,155)">
        <rect width="70" height="50" rx="4" class="nd nd-grid" />
        <text x="35" y="22" text-anchor="middle" class="t-title">{{ LABEL.grid() }}</text>
        <text x="35" y="38" text-anchor="middle" class="t-kw t-cyan">{{ gridTxt }} kW</text>
      </g>
      <!-- 电网交换方向文本 -->
      <text x="528" y="172" text-anchor="middle" class="t-dir">{{ gridLabel }}</text>
    </svg>
  </div>
</template>

<style scoped>
.sld { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.sld-svg { width: 100%; height: 100%; }

.nd { fill: rgba(13,35,69,0.85); stroke: rgba(0,229,255,0.55); stroke-width: 1.2; }
.nd-pv { stroke: #00e676; }
.nd-bess { stroke: #ffb020; }
.nd-pcs { stroke: #ffb020; }
.nd-inv { stroke: #00e5ff; }
.nd-grid { stroke: #2b9bff; }
.nd-overload { stroke: #ff5252; animation: sld-blink 1s ease-in-out infinite; }

.t-title { font-size: 11px; font-weight: 600; fill: #d4ecff; }
.t-sub { font-size: 9px; fill: #6b8cae; }
.t-kw { font-size: 10px; font-weight: 700; font-family: var(--dc3d-mono, monospace); }
.t-green { fill: #00e676; }
.t-amber { fill: #ffb020; }
.t-cyan { fill: #00e5ff; }
.t-purple { fill: #b980ff; }
.t-red { fill: #ff5252; }
.t-bus { font-size: 9px; fill: #6b8cae; letter-spacing: 0.5px; }
.t-pcc { font-size: 10px; font-weight: 600; fill: #00e5ff; }
.t-dir { font-size: 9px; fill: #ffb020; font-weight: 600; }

.pcc-ring { fill: rgba(8,22,45,0.9); stroke: #ff2d9b; stroke-width: 1.6; filter: drop-shadow(0 0 4px #ff2d9b); }
.pcc-core { fill: #ff2d9b; filter: drop-shadow(0 0 4px #ff2d9b); }

/* 潮流流动:重叠在底色线上的虚线,stroke-dashoffset 动画表方向 */
.flow {
  stroke-width: 2.4;
  fill: none;
  stroke-dasharray: 6 8;
  opacity: 0.95;
}
.flow-down { stroke: #00e676; animation: sld-down 0.9s linear infinite; }
.flow-up { stroke: #ffb020; animation: sld-up 0.9s linear infinite; }
.flow-right { stroke: #00e5ff; animation: sld-right 0.9s linear infinite; }
.flow-left { stroke: #2b9bff; animation: sld-left 0.9s linear infinite; }
.flow-overload { stroke: #ff5252 !important; animation: sld-down 0.6s linear infinite, sld-blink-stroke 0.8s ease-in-out infinite; }

@keyframes sld-down { to { stroke-dashoffset: -14; } }
@keyframes sld-up { to { stroke-dashoffset: 14; } }
@keyframes sld-right { to { stroke-dashoffset: -14; } }
@keyframes sld-left { to { stroke-dashoffset: 14; } }
@keyframes sld-blink { 0%,100% { stroke-opacity: 0.55; } 50% { stroke-opacity: 1; } }
@keyframes sld-blink-stroke { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }

.sld.still .flow { animation: none !important; }
.sld.still .nd-overload { animation: none; }
</style>
