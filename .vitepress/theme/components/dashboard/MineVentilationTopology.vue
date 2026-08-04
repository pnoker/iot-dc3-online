<script setup lang="ts">
/**
 * 招牌②:通风网络拓扑(纯 SVG + CSS,有向风路)。
 * 风路:进风井 → 运输大巷 →(综采面 / 掘进面)→ 回风巷 → 回风井 → 主扇(抽出式)。
 * 有向风路用流动虚线表方向(进风青 / 用风绿 / 回风蓝)。
 * 风门短路(漏风旁路):绕过综采面直接连运输大巷与回风巷的红虚线 —— 短路使工作面有效风量骤降(违章隐患)。
 * 主扇抽出式:负压把乏风抽出地表。各支路风量(m³/min)由 useDomainSeries 驱动。
 */
import {computed, ref, onMounted} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = !import.meta.env.SSR && matchMedia('(prefers-reduced-motion: reduce)').matches
})

// 各支路风量(m³/min):进风大巷/综采面/掘进面/回风巷,缓慢漂移
const qMain = useDomainSeries({baseline: 6200, unit: 'm³/min', cycle: (s) => Math.sin(s / 120), cycleAmp: 0.04, noiseAmp: 30}, {seed: 31, window: 2}).current
const qFace = useDomainSeries({baseline: 1800, unit: 'm³/min', cycle: (s) => Math.sin(s / 95 + 1), cycleAmp: 0.05, noiseAmp: 16}, {seed: 32, window: 2}).current
const qHead = useDomainSeries({baseline: 560, unit: 'm³/min', cycle: (s) => Math.sin(s / 80 + 2.2), cycleAmp: 0.08, noiseAmp: 8}, {seed: 33, window: 2}).current
const qReturn = useDomainSeries({baseline: 7600, unit: 'm³/min', cycle: (s) => Math.sin(s / 110 + 3), cycleAmp: 0.03, noiseAmp: 28}, {seed: 34, window: 2}).current
// 短路漏风量(越大越危险,>800 视为严重短路)
const qLeak = useDomainSeries({baseline: 420, unit: 'm³/min', cycle: (s) => Math.sin(s / 70 + 0.6), cycleAmp: 0.4, noiseAmp: 30, events: [{rate: 1 / 90, type: 'step', size: 380, duration: 25}]}, {seed: 35, window: 2}).current

const shortCircuit = computed(() => qLeak.value > 800)
const leakTxt = computed(() => Math.round(qLeak.value))

const LABEL = {
  intake: () => t('进风井', 'Intake Shaft'),
  transport: () => t('运输大巷', 'Transport Main'),
  face: () => t('综采面', 'Longwall Face'),
  heading: () => t('掘进面', 'Tunneling Face'),
  auxFan: () => t('局扇', 'Aux Fan'),
  return: () => t('回风巷', 'Return Airway'),
  returnShaft: () => t('回风井', 'Return Shaft'),
  mainFan: () => t('主扇', 'Main Fan'),
  door: () => t('风门', 'Air Door'),
  leak: () => t('短路漏风', 'Short-circuit'),
}
const accessibleTitle = computed(() => t('通风网络有向风路拓扑图', 'Ventilation network directed airflow topology'))
</script>

<template>
  <div class="vtopo" :class="{still: reducedMotion}" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 720 300" preserveAspectRatio="xMidYMid meet" class="vtopo-svg" aria-hidden="true">
      <!-- 底色连线(网络骨架) -->
      <g stroke="rgba(0,229,255,0.28)" stroke-width="2" fill="none">
        <!-- 进风井→运输大巷 -->
        <line x1="64" y1="70" x2="64" y2="160" />
        <line x1="64" y1="160" x2="120" y2="160" />
        <!-- 运输大巷主干 -->
        <line x1="190" y1="160" x2="430" y2="160" />
        <!-- 综采面支路(上汇入回风巷) -->
        <line x1="470" y1="160" x2="500" y2="160" />
        <line x1="500" y1="160" x2="500" y2="90" />
        <line x1="500" y1="90" x2="560" y2="90" />
        <!-- 掘进面支路(下分支,盲巷) -->
        <line x1="300" y1="160" x2="300" y2="232" />
        <!-- 回风巷主干 -->
        <line x1="190" y1="90" x2="610" y2="90" />
        <!-- 回风巷→回风井→主扇 -->
        <line x1="610" y1="90" x2="640" y2="90" />
        <line x1="640" y1="90" x2="640" y2="44" />
      </g>

      <!-- 有向流动(进风:下→右,青) -->
      <line x1="64" y1="70" x2="64" y2="160" class="flow flow-down" />
      <line x1="64" y1="160" x2="430" y2="160" class="flow flow-right" />
      <!-- 综采面用风(右→上→回风,绿) -->
      <line x1="470" y1="160" x2="500" y2="160" class="flow flow-right flow-use" />
      <line x1="500" y1="160" x2="500" y2="90" class="flow flow-up flow-use" />
      <!-- 掘进面支路(下,绿) -->
      <line x1="300" y1="160" x2="300" y2="232" class="flow flow-down flow-use" />
      <!-- 回风(右→回风井→上,蓝) -->
      <line x1="190" y1="90" x2="610" y2="90" class="flow flow-right flow-ret" />
      <line x1="640" y1="90" x2="640" y2="44" class="flow flow-up flow-ret" />

      <!-- 风门短路(红虚线,运输大巷↔回风巷 旁路,绕过综采面) -->
      <path d="M 250 160 Q 250 125 250 90" class="flow flow-leak" :class="{'leak-severe': shortCircuit}" />

      <!-- 节点:进风井 -->
      <g transform="translate(64,70)">
        <rect x="-34" y="-26" width="68" height="40" rx="4" class="nd nd-intake" />
        <text y="-8" text-anchor="middle" class="t-title">{{ LABEL.intake() }}</text>
        <text y="7" text-anchor="middle" class="t-val t-cyan">{{ Math.round(qMain) }} m³/min</text>
      </g>
      <!-- 运输大巷 -->
      <g transform="translate(190,160)">
        <rect x="-70" y="-20" width="140" height="40" rx="4" class="nd" />
        <text y="-3" text-anchor="middle" class="t-title">{{ LABEL.transport() }}</text>
        <text y="13" text-anchor="middle" class="t-val t-cyan">{{ Math.round(qMain) }}</text>
      </g>
      <!-- 综采面 -->
      <g transform="translate(500,125)">
        <rect x="-34" y="-18" width="68" height="36" rx="4" class="nd nd-use" />
        <text y="-1" text-anchor="middle" class="t-title">{{ LABEL.face() }}</text>
        <text y="13" text-anchor="middle" class="t-val t-green">{{ Math.round(qFace) }}</text>
      </g>
      <!-- 掘进面 + 局扇 -->
      <g transform="translate(300,232)">
        <rect x="-40" y="-18" width="80" height="36" rx="4" class="nd nd-use" />
        <text y="-1" text-anchor="middle" class="t-title">{{ LABEL.heading() }}</text>
        <text y="13" text-anchor="middle" class="t-val t-green">{{ Math.round(qHead) }}</text>
        <!-- 局扇符号(压入式通风) -->
        <circle cx="46" cy="0" r="7" class="auxfan" />
        <text x="46" y="22" text-anchor="middle" class="t-sub t-amber">{{ LABEL.auxFan() }}</text>
      </g>
      <!-- 回风巷 -->
      <g transform="translate(400,90)">
        <rect x="-70" y="-20" width="140" height="40" rx="4" class="nd" />
        <text y="-3" text-anchor="middle" class="t-title">{{ LABEL.return() }}</text>
        <text y="13" text-anchor="middle" class="t-val t-purple">{{ Math.round(qReturn) }}</text>
      </g>
      <!-- 回风井 -->
      <g transform="translate(640,70)">
        <rect x="-30" y="-20" width="60" height="36" rx="4" class="nd nd-ret" />
        <text y="-3" text-anchor="middle" class="t-title">{{ LABEL.returnShaft() }}</text>
      </g>
      <!-- 主扇(抽出式,地表) -->
      <g transform="translate(640,30)">
        <circle r="13" class="mainfan" />
        <path d="M -7 -2 L 7 -2 M -7 2 L 7 2 M 0 -8 L 0 8" class="fanblade" :class="{spin: !reducedMotion}" />
        <text y="-20" text-anchor="middle" class="t-title">{{ LABEL.mainFan() }}</text>
      </g>
      <!-- 风门(在短路旁路与正规风路上) -->
      <g transform="translate(250,90)">
        <rect x="-9" y="-9" width="18" height="18" rx="2" class="door" />
        <line x1="-9" y1="-9" x2="9" y2="9" class="door-line" />
        <text y="-14" text-anchor="middle" class="t-sub t-amber">{{ LABEL.door() }}</text>
      </g>
      <!-- 短路漏风标签 -->
      <text x="262" y="128" class="t-leak" :class="{severe: shortCircuit}">{{ LABEL.leak() }} {{ leakTxt }}</text>
    </svg>

    <div class="vtopo-legend">
      <span class="lg"><i class="i-cyan" />{{ t('进风', 'Intake') }}</span>
      <span class="lg"><i class="i-green" />{{ t('用风', 'Use') }}</span>
      <span class="lg"><i class="i-purple" />{{ t('回风', 'Return') }}</span>
      <span class="lg"><i class="i-red" />{{ t('短路漏风', 'Leak') }}</span>
    </div>
  </div>
</template>

<style scoped>
.vtopo {width: 100%; height: 100%; display: flex; flex-direction: column; gap: 2px; box-sizing: border-box;}
.vtopo-svg {flex: 1; min-height: 0; width: 100%;}

.nd {fill: rgba(13,35,69,0.88); stroke: rgba(0,229,255,0.55); stroke-width: 1.2;}
.nd-intake {stroke: #00e5ff;}
.nd-use {stroke: #00e676;}
.nd-ret {stroke: #b980ff;}
.t-title {font-size: 11px; font-weight: 600; fill: #d4ecff;}
.t-sub {font-size: 9px; fill: #6b8cae;}
.t-val {font-size: 10px; font-weight: 700; font-family: var(--dc3d-mono, monospace);}
.t-cyan {fill: #00e5ff;}
.t-green {fill: #00e676;}
.t-purple {fill: #b980ff;}
.t-amber {fill: #ffb020;}

.auxfan {fill: rgba(255,176,32,0.18); stroke: #ffb020; stroke-width: 1.4;}
.mainfan {fill: rgba(8,22,45,0.9); stroke: #ff2d9b; stroke-width: 1.8;}
.fanblade {stroke: #ff2d9b; stroke-width: 1.8; fill: none; transform-box: fill-box; transform-origin: center;}
.fanblade.spin {animation: vtopo-spin 1.4s linear infinite;}
@keyframes vtopo-spin {to {transform: rotate(360deg);}}

.door {fill: rgba(255,176,32,0.12); stroke: #ffb020; stroke-width: 1.2;}
.door-line {stroke: #ffb020; stroke-width: 1.4;}

.t-leak {font-size: 9.5px; fill: #ff8a8a; font-weight: 600; font-family: var(--dc3d-mono, monospace);}
.t-leak.severe {fill: #ff5252; font-size: 11px;}

/* 有向流动:虚线 stroke-dashoffset 动画表方向 */
.flow {stroke-width: 2.4; fill: none; stroke-dasharray: 6 8; opacity: 0.95;}
.flow-down {stroke: #00e5ff; animation: v-down 0.9s linear infinite;}
.flow-up {stroke: #00e676; animation: v-up 0.9s linear infinite;}
.flow-right {stroke: #00e5ff; animation: v-right 0.9s linear infinite;}
.flow-use {stroke: #00e676;}
.flow-ret {stroke: #b980ff;}
.flow-leak {stroke: #ff5252; stroke-dasharray: 4 6; animation: v-down 0.7s linear infinite, v-blink 0.9s ease-in-out infinite;}
.leak-severe {stroke-width: 3.2 !important; animation: v-down 0.5s linear infinite, v-blink 0.5s ease-in-out infinite !important;}
@keyframes v-down {to {stroke-dashoffset: -14;}}
@keyframes v-up {to {stroke-dashoffset: 14;}}
@keyframes v-right {to {stroke-dashoffset: -14;}}
@keyframes v-blink {0%,100% {opacity: 0.45;} 50% {opacity: 1;}}

.vtopo.still .flow {animation: none !important;}
.vtopo.still .fanblade {animation: none;}

.vtopo-legend {display: flex; flex-wrap: wrap; gap: 10px; padding: 2px 4px; flex-shrink: 0;}
.lg {display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--dc3d-text-dim);}
.lg i {width: 10px; height: 3px; border-radius: 2px; display: inline-block;}
.i-cyan {background: #00e5ff; box-shadow: 0 0 6px #00e5ff;}
.i-green {background: #00e676; box-shadow: 0 0 6px #00e676;}
.i-purple {background: #b980ff; box-shadow: 0 0 6px #b980ff;}
.i-red {background: #ff5252; box-shadow: 0 0 6px #ff5252;}
</style>
