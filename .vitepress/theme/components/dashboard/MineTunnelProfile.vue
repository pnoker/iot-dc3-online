<script setup lang="ts">
/**
 * 招牌①:矿井巷道剖面 + UWB 人员定位(纯 SVG 手绘平面图,布局完全可控)。
 * 主井/副井(进风,竖井)→ 运输大巷(主运横巷);回风巷(回风横巷)→ 风井(回风竖井);
 * 综采面(长壁综采,连运输大巷与回风巷);掘进头(独头掘进盲巷);
 * UWB 人员散点(青)沿巷道分布;禁入区/采空区(红虚线+脉冲)误入即红色告警。
 * 进风方向用青色流向箭头(辅助,主体聚焦人员定位)。
 */
import {computed, ref, onMounted} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = !import.meta.env.SSR && matchMedia('(prefers-reduced-motion: reduce)').matches
})

// 井下在岗人数(驱动右上角计数标签)
const pplSrc = useDomainSeries(
  {baseline: 186, unit: '人', cycle: (s) => Math.sin(s / 70 + 1.1), cycleAmp: 0.04, noiseAmp: 2.4},
  {seed: 22, window: 2},
).current
const ppl = computed(() => Math.max(0, Math.round(pplSrc.value)))

// UWB 人员散点(确定性位置:巷道内真实分布;误入禁入区者标 tress)
interface Dot {x: number; y: number; tress?: boolean}
const DOTS: Dot[] = [
  // 运输大巷(主运横巷 y≈214)
  {x: 132, y: 214}, {x: 162, y: 214}, {x: 196, y: 214}, {x: 300, y: 210},
  {x: 384, y: 218}, {x: 424, y: 214}, {x: 462, y: 214},
  // 综采面(x≈516 竖向)
  {x: 516, y: 152}, {x: 516, y: 176}, {x: 516, y: 202},
  // 掘进头(x≈340 竖向盲巷)
  {x: 340, y: 244}, {x: 340, y: 266}, {x: 340, y: 282},
  // 回风巷(y≈134)
  {x: 208, y: 134}, {x: 384, y: 134},
  // 误入禁入区/采空区(红色告警)
  {x: 286, y: 176, tress: true}, {x: 252, y: 180, tress: true},
]

const LABEL = {
  surface: () => t('地表', 'Surface'),
  mainShaft: () => t('主井', 'Main Shaft'),
  auxShaft: () => t('副井', 'Aux Shaft'),
  returnShaft: () => t('风井', 'Return Shaft'),
  transport: () => t('运输大巷', 'Transport Main'),
  returnAir: () => t('回风巷', 'Return Airway'),
  face: () => t('综采面', 'Longwall Face'),
  heading: () => t('掘进头', 'Tunneling Head'),
  forbidden: () => t('禁入区·采空区', 'Forbidden · Goaf'),
  intake: () => t('进风', 'Intake'),
  staff: () => t('井下在岗', 'Staff'),
}
const accessibleTitle = computed(() => t('矿井巷道剖面与 UWB 人员定位示意图', 'Tunnel profile and UWB personnel location'))
</script>

<template>
  <div class="mprof" :class="{still: reducedMotion}" role="img" :aria-label="accessibleTitle">
    <svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMid meet" class="mprof-svg" aria-hidden="true">
      <!-- 地表线 -->
      <line x1="0" y1="42" x2="720" y2="42" stroke="rgba(0,229,255,0.35)" stroke-width="1.2" />
      <line x1="0" y1="42" x2="720" y2="42" stroke="#00e5ff" stroke-width="1.2" stroke-dasharray="2 6" opacity="0.6" />
      <text x="8" y="34" class="t-surface">{{ LABEL.surface() }}</text>

      <!-- 岩层阴影(地表与煤层之间的围岩) -->
      <rect x="0" y="44" width="720" height="74" fill="rgba(43,155,255,0.04)" />

      <!-- 竖井:主井/副井(进风) -->
      <g>
        <rect x="70" y="44" width="34" height="158" rx="3" class="shaft shaft-intake" />
        <text x="87" y="38" text-anchor="middle" class="t-shaft">{{ LABEL.mainShaft() }}</text>
        <text x="87" y="210" text-anchor="middle" class="t-sub t-cyan">{{ LABEL.intake() }}</text>
      </g>
      <g>
        <rect x="112" y="44" width="34" height="158" rx="3" class="shaft shaft-intake" />
        <text x="129" y="38" text-anchor="middle" class="t-shaft">{{ LABEL.auxShaft() }}</text>
      </g>

      <!-- 风井(回风竖井) -->
      <g>
        <rect x="560" y="44" width="34" height="106" rx="3" class="shaft shaft-return" />
        <text x="577" y="38" text-anchor="middle" class="t-shaft">{{ LABEL.returnShaft() }}</text>
        <text x="577" y="160" text-anchor="middle" class="t-sub t-purple">↑ {{ t('回风', 'Return') }}</text>
      </g>

      <!-- 回风巷(回风横巷) -->
      <rect x="104" y="120" width="460" height="28" rx="6" class="drift drift-return" />
      <text x="180" y="138" class="t-drift t-purple">{{ LABEL.returnAir() }}</text>

      <!-- 运输大巷(主运横巷) -->
      <rect x="104" y="200" width="420" height="28" rx="6" class="drift drift-transport" />
      <text x="180" y="218" class="t-drift t-cyan">{{ LABEL.transport() }}</text>

      <!-- 进风流向箭头(沿运输大巷向右,辅助表意) -->
      <g class="flow-arrows">
        <path d="M 250 214 l 10 -4 l 0 8 z" class="arrow-cyan" />
        <path d="M 320 214 l 10 -4 l 0 8 z" class="arrow-cyan" />
        <path d="M 390 214 l 10 -4 l 0 8 z" class="arrow-cyan" />
      </g>

      <!-- 综采面(长壁,连运输大巷与回风巷) -->
      <rect x="498" y="120" width="40" height="108" rx="4" class="face" />
      <text x="518" y="178" text-anchor="middle" class="t-face" transform="rotate(-90 518 178)">{{ LABEL.face() }}</text>

      <!-- 掘进头(独头盲巷) -->
      <rect x="328" y="228" width="26" height="62" rx="3" class="drift drift-heading" />
      <line x1="328" y1="290" x2="354" y2="290" class="heading-face" />
      <text x="314" y="266" text-anchor="end" class="t-drift t-amber">{{ LABEL.heading() }}</text>

      <!-- 禁入区/采空区(红虚线 + 斜纹 + 脉冲) -->
      <g class="forbidden" :class="{still: reducedMotion}">
        <rect x="236" y="156" width="96" height="40" rx="2" class="forbidden-box" />
        <text x="284" y="150" text-anchor="middle" class="t-forbid">{{ LABEL.forbidden() }}</text>
        <circle cx="284" cy="176" r="5" class="forbidden-pulse" :class="{still: reducedMotion}" />
        <circle cx="284" cy="176" r="2.4" fill="#ff5252" />
      </g>

      <!-- UWB 人员散点 -->
      <g v-for="(d, i) in DOTS" :key="'u' + i" class="uwb" :class="{intrusion: d.tress, still: reducedMotion}">
        <circle :cx="d.x" :cy="d.y" :r="d.tress ? 4.5 : 3.4" :class="d.tress ? 'uwb-tress-ring' : 'uwb-ring'" />
        <circle :cx="d.x" :cy="d.y" :r="2.2" :fill="d.tress ? '#ff5252' : '#00e676'" />
      </g>
    </svg>

    <!-- 图例 + 在岗计数 -->
    <div class="mprof-legend">
      <span class="lg"><i class="i-green" />{{ t('人员', 'Staff') }}</span>
      <span class="lg"><i class="i-red" />{{ t('误入告警', 'Intrusion') }}</span>
      <span class="lg"><i class="i-cyan" />{{ t('进风', 'Intake') }}</span>
      <span class="lg"><i class="i-purple" />{{ t('回风', 'Return') }}</span>
      <span class="lg-count">{{ LABEL.staff() }} <b class="c-green">{{ ppl }}</b> {{ t('人', 'ppl') }}</span>
    </div>
  </div>
</template>

<style scoped>
.mprof {width: 100%; height: 100%; display: flex; flex-direction: column; gap: 2px; box-sizing: border-box;}
.mprof-svg {flex: 1; min-height: 0; width: 100%;}

.t-surface {fill: #6b8cae; font-size: 10px; letter-spacing: 1px; font-family: var(--dc3d-mono, monospace);}
.t-shaft {fill: #d4ecff; font-size: 11px; font-weight: 600;}
.t-sub {font-size: 9px;}
.t-cyan {fill: #00e5ff;}
.t-purple {fill: #b980ff;}
.t-amber {fill: #ffb020;}
.t-drift {font-size: 11px; font-weight: 600; letter-spacing: 0.5px; fill: #d4ecff;}
.t-face {font-size: 11px; font-weight: 700; fill: #00e676; letter-spacing: 1px;}
.t-forbid {fill: #ff8a8a; font-size: 9.5px; font-weight: 600; letter-spacing: 0.5px;}

.shaft {fill: rgba(8,22,45,0.85); stroke-width: 1.6;}
.shaft-intake {stroke: #00e5ff;}
.shaft-return {stroke: #b980ff;}
.drift {fill: rgba(13,35,69,0.7); stroke-width: 1.4;}
.drift-transport {stroke: #00e5ff;}
.drift-return {stroke: #b980ff; stroke-dasharray: 0;}
.drift-heading {stroke: #ffb020;}
.heading-face {stroke: #ffb020; stroke-width: 2.4; stroke-linecap: round;}
.face {fill: rgba(0,230,118,0.12); stroke: #00e676; stroke-width: 1.6;}

.arrow-cyan {fill: #00e5ff; opacity: 0.85;}
.flow-arrows {animation: mprof-nudge 2.6s linear infinite;}
@keyframes mprof-nudge {0%,100% {opacity: 0.5;} 50% {opacity: 1;}}

/* 禁入区:红斜纹 + 边框闪烁 */
.forbidden-box {fill: rgba(255,82,82,0.10); stroke: #ff5252; stroke-width: 1.4; stroke-dasharray: 5 3; animation: mprof-blink 1.4s ease-in-out infinite;}
.forbidden-pulse {fill: rgba(255,82,82,0.18); animation: mprof-pulse 1.8s ease-out infinite; transform-box: fill-box; transform-origin: center;}
@keyframes mprof-blink {0%,100% {stroke-opacity: 0.5;} 50% {stroke-opacity: 1;}}
@keyframes mprof-pulse {0% {transform: scale(1); opacity: 0.9;} 100% {transform: scale(4); opacity: 0;}}

/* UWB 人员:青绿点,误入者红环脉冲 */
.uwb-ring {fill: rgba(0,230,118,0.22);}
.uwb-tress-ring {fill: rgba(255,82,82,0.22); animation: mprof-pulse 1.6s ease-out infinite; transform-box: fill-box; transform-origin: center;}
.uwb.still .uwb-tress-ring {animation: none;}
.uwb.still .forbidden-pulse {animation: none;}

.mprof-legend {display: flex; flex-wrap: wrap; gap: 10px; padding: 2px 4px; flex-shrink: 0; align-items: center;}
.lg {display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--dc3d-text-dim);}
.lg i {width: 9px; height: 9px; border-radius: 50%; display: inline-block;}
.i-green {background: #00e676; box-shadow: 0 0 6px #00e676;}
.i-red {background: #ff5252; box-shadow: 0 0 6px #ff5252;}
.i-cyan {background: #00e5ff; box-shadow: 0 0 6px #00e5ff;}
.i-purple {background: #b980ff; box-shadow: 0 0 6px #b980ff;}
.lg-count {margin-left: auto; font-size: 12px; color: var(--dc3d-text-dim); font-family: var(--dc3d-mono, monospace);}
.c-green {color: #00e676; font-size: 15px; font-weight: 700; text-shadow: 0 0 8px rgba(0,230,118,0.5);}

.mprof.still .forbidden-box {animation: none;}
.mprof.still .flow-arrows {animation: none;}
</style>
