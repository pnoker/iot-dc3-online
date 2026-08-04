<script setup lang="ts">
/**
 * 招牌 ① 智能大棚剖面分层热力(纯 SVG/CSS 手绘,跨高度梯度着色)。
 * 按物理高度分四层:天窗区(屋顶通风)/ 冠层(作物)/ 中部 / 根区基质,
 * 每层温度驱动色带(冷蓝→适绿→暖琥珀→热红),叠加 温/湿/CO₂/PAR 四维读数。
 * 屋顶弧 + 立柱 + 太阳 + 滴灌管线 + 作物剪影纯 SVG,布局完全可控(矮容器友好)。
 * 物理工况:屋顶最热最干、PAR 最高、CO₂ 最低(通风交换);冠层温湿光最适、CO₂ 富集;
 * 中部次之;根区最凉最湿、PAR≈0(基质无光合)、CO₂ 来自土壤呼吸中等。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface LayerSpec {
  key: string
  zh: string
  en: string
  height: string // 物理高度标注
  baseTemp: number
  baseRh: number
  baseCo2: number
  basePar: number
  phase: number
  seed: number
}

// 四层基线值(贴近真实大棚垂直梯度):屋顶热干高光低CO₂;冠层最适富CO₂;中部次之;根区凉湿无光
const LAYERS: LayerSpec[] = [
  {key: 'vent', zh: '天窗区', en: 'Vent / Roof', height: '3.5–4.5 m', baseTemp: 30.4, baseRh: 54, baseCo2: 430, basePar: 920, phase: 0.0, seed: 301},
  {key: 'canopy', zh: '冠层', en: 'Canopy', height: '1.8–2.8 m', baseTemp: 24.2, baseRh: 72, baseCo2: 860, basePar: 760, phase: 0.8, seed: 302},
  {key: 'mid', zh: '中部', en: 'Mid', height: '0.8–1.6 m', baseTemp: 23.1, baseRh: 70, baseCo2: 780, basePar: 420, phase: 1.6, seed: 303},
  {key: 'root', zh: '根区基质', en: 'Root Zone', height: '0–0.3 m', baseTemp: 20.8, baseRh: 86, baseCo2: 620, basePar: 0, phase: 2.4, seed: 304},
]

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

const layers = LAYERS.map((l) => {
  const temp = useDomainSeries(
    {baseline: l.baseTemp, unit: '℃', cycle: (s) => Math.sin(s / 110 + l.phase), cycleAmp: 0.04, noiseAmp: 0.2},
    {seed: l.seed, window: 2},
  ).current
  const rh = useDomainSeries(
    {baseline: l.baseRh, unit: '%', cycle: (s) => Math.sin(s / 120 + l.phase + 0.5), cycleAmp: 0.05, noiseAmp: 0.6},
    {seed: l.seed + 10, window: 2},
  ).current
  const co2 = useDomainSeries(
    {baseline: l.baseCo2, unit: 'ppm', cycle: (s) => Math.sin(s / 130 + l.phase + 1.0), cycleAmp: 0.03, noiseAmp: 6},
    {seed: l.seed + 20, window: 2},
  ).current
  const par = useDomainSeries(
    {baseline: l.basePar, unit: 'μmol', cycle: (s) => Math.sin(s / 100 + l.phase + 1.5), cycleAmp: 0.06, noiseAmp: l.basePar > 0 ? 8 : 0},
    {seed: l.seed + 30, window: 2},
  ).current
  return {spec: l, temp, rh, co2, par}
})

// 温度 → 热力色(冷蓝 → 适绿 → 暖琥珀 → 热红),返回 rgba 字符串(DataV/SVG 传真色)
const HEAT_STOPS = [
  {p: 0.0, c: [21, 101, 192]}, // #1565c0 冷
  {p: 0.35, c: [0, 188, 212]}, // #00bcd4 凉
  {p: 0.55, c: [46, 200, 110]}, // 适绿
  {p: 0.78, c: [255, 176, 32]}, // #ffb020 暖
  {p: 1.0, c: [229, 57, 53]}, // #e53935 热
]
function heatColor(temp: number, alpha = 0.62): string {
  const t = clamp((temp - 16) / (34 - 16), 0, 1)
  for (let i = 0; i < HEAT_STOPS.length - 1; i++) {
    const a = HEAT_STOPS[i]
    const b = HEAT_STOPS[i + 1]
    if (t >= a.p && t <= b.p) {
      const k = (t - a.p) / (b.p - a.p)
      const r = Math.round(a.c[0] + (b.c[0] - a.c[0]) * k)
      const g = Math.round(a.c[1] + (b.c[1] - a.c[1]) * k)
      const bl = Math.round(a.c[2] + (b.c[2] - a.c[2]) * k)
      return `rgba(${r},${g},${bl},${alpha})`
    }
  }
  return 'rgba(229,57,53,0.6)'
}

const bands = computed(() =>
  layers.map(({spec, temp, rh, co2, par}) => {
    const tc = temp.value
    return {
      key: spec.key,
      name: t(spec.zh, spec.en),
      height: spec.height,
      temp: tc.toFixed(1),
      rh: Math.round(rh.value),
      co2: Math.round(co2.value),
      par: spec.basePar > 0 ? Math.round(par.value) : '—',
      heat: heatColor(tc, 0.6),
      heatSoft: heatColor(tc, 0.18),
      tempColor: heatColor(tc, 1),
    }
  }),
)

const accessibleTitle = computed(() => t('智能大棚剖面分层热力图', 'Greenhouse vertical profile heatmap'))
</script>

<template>
  <div class="gh" role="img" :aria-label="accessibleTitle">
    <!-- 屋顶弧 + 立柱 + 太阳:纯 SVG 装饰骨架 -->
    <svg class="gh-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ghSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="rgba(0,229,255,0.10)" />
          <stop offset="1" stop-color="rgba(8,22,45,0)" />
        </linearGradient>
      </defs>
      <path d="M2,40 Q50,2 98,40 L98,98 L2,98 Z" fill="url(#ghSky)" stroke="rgba(0,229,255,0.5)" stroke-width="0.5" />
      <!-- 屋脊 -->
      <path d="M2,40 Q50,2 98,40" fill="none" stroke="rgba(43,155,255,0.85)" stroke-width="0.8" />
      <!-- 立柱 -->
      <line x1="2" y1="40" x2="2" y2="98" stroke="rgba(43,155,255,0.7)" stroke-width="0.8" />
      <line x1="98" y1="40" x2="98" y2="98" stroke="rgba(43,155,255,0.7)" stroke-width="0.8" />
      <!-- 通风天窗(屋脊处可开翻窗) -->
      <path d="M30,14 L50,6 L50,14 Z" fill="rgba(0,230,118,0.25)" stroke="rgba(0,230,118,0.8)" stroke-width="0.4" />
      <text x="40" y="12" font-size="3.2" fill="#00e676" text-anchor="middle">vent</text>
    </svg>
    <!-- 太阳 -->
    <svg class="gh-sun" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="#ffb020" opacity="0.9" />
      <g stroke="#ffb020" stroke-width="1.5" opacity="0.7">
        <line x1="12" y1="1" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="23" />
        <line x1="1" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="23" y2="12" />
        <line x1="4" y1="4" x2="6" y2="6" /><line x1="18" y1="18" x2="20" y2="20" />
        <line x1="20" y1="4" x2="18" y2="6" /><line x1="6" y1="18" x2="4" y2="20" />
      </g>
    </svg>

    <!-- 四层色带(温度梯度着色)+ 每层四维读数 -->
    <div class="gh-layers">
      <div
        v-for="(b, i) in bands"
        :key="b.key"
        class="gh-layer"
        :class="{'gh-layer--root': b.key === 'root'}"
        :style="{background: 'linear-gradient(90deg, ' + (b.heatSoft) + ' 0%, ' + (b.heat) + ' 38%, rgba(8,22,45,0.25) 100%)', '--edge': b.tempColor}"
      >
        <div class="gh-layer-head">
          <span class="gh-layer-name">{{ b.name }}</span>
          <span class="gh-layer-h">{{ b.height }}</span>
        </div>
        <div class="gh-metrics">
          <div class="gh-m"><span class="gh-mv" :style="{color: b.tempColor}">{{ b.temp }}</span><span class="gh-mu">℃</span></div>
          <div class="gh-m"><span class="gh-mv">{{ b.rh }}</span><span class="gh-mu">%RH</span></div>
          <div class="gh-m"><span class="gh-mv">{{ b.co2 }}</span><span class="gh-mu">ppm</span></div>
          <div class="gh-m"><span class="gh-mv">{{ b.par }}</span><span class="gh-mu">PAR</span></div>
        </div>
        <!-- 冠层作物剪影 -->
        <svg v-if="b.key === 'canopy'" class="gh-crop" viewBox="0 0 120 20" preserveAspectRatio="none" aria-hidden="true">
          <g fill="rgba(46,200,110,0.85)">
            <ellipse cx="8" cy="14" rx="5" ry="6" /><ellipse cx="24" cy="13" rx="6" ry="7" />
            <ellipse cx="42" cy="14" rx="5" ry="6" /><ellipse cx="60" cy="13" rx="6" ry="7" />
            <ellipse cx="78" cy="14" rx="5" ry="6" /><ellipse cx="96" cy="13" rx="6" ry="7" />
            <ellipse cx="112" cy="14" rx="5" ry="6" />
          </g>
          <line x1="0" y1="19" x2="120" y2="19" stroke="rgba(0,230,118,0.5)" stroke-width="0.6" />
        </svg>
        <!-- 根区滴灌管线 + 基质纹理 -->
        <svg v-if="b.key === 'root'" class="gh-crop" viewBox="0 0 120 20" preserveAspectRatio="none" aria-hidden="true">
          <line x1="2" y1="4" x2="118" y2="4" stroke="rgba(0,229,255,0.8)" stroke-width="0.8" />
          <g fill="rgba(0,229,255,0.9)">
            <circle cx="14" cy="4" r="0.9" /><circle cx="30" cy="4" r="0.9" /><circle cx="46" cy="4" r="0.9" />
            <circle cx="62" cy="4" r="0.9" /><circle cx="78" cy="4" r="0.9" /><circle cx="94" cy="4" r="0.9" /><circle cx="110" cy="4" r="0.9" />
          </g>
          <g fill="rgba(139,90,43,0.5)">
            <rect x="0" y="6" width="120" height="14" />
          </g>
        </svg>
        <span class="gh-edge" />
      </div>
    </div>
    <div class="gh-legend">
      <span class="gh-leg-label">{{ t('热力梯度', 'Heat gradient') }}:</span>
      <span class="gh-leg-bar" />
      <span class="gh-leg-end">{{ t('冷 16℃', '16℃') }}</span>
      <span class="gh-leg-end">{{ t('热 34℃', '34℃') }}</span>
    </div>
  </div>
</template>

<style scoped>
.gh {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  padding: 2px 4px 22px;
}
.gh-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.gh-sun {
  position: absolute;
  top: 6px;
  right: 12px;
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 0 6px rgba(255, 176, 32, 0.6));
}
.gh-layers {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: 1.05fr 1.15fr 1fr 0.9fr;
  gap: 3px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
.gh-layer {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-left: 3px solid var(--edge);
  border-radius: 3px;
  overflow: hidden;
  min-height: 0;
}
.gh-layer-head {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-width: 64px;
}
.gh-layer-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--dc3d-text, #d4ecff);
  letter-spacing: 0.5px;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}
.gh-layer-h {
  font-size: 10px;
  color: var(--dc3d-text-dim, #6b8cae);
  font-family: var(--dc3d-mono, monospace);
}
.gh-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.gh-m {
  display: flex;
  align-items: baseline;
  gap: 2px;
  justify-content: center;
}
.gh-mv {
  font-size: 15px;
  font-weight: 700;
  font-family: var(--dc3d-mono, monospace);
  color: #d4ecff;
}
.gh-mu {
  font-size: 9px;
  color: var(--dc3d-text-dim, #6b8cae);
  letter-spacing: 0.3px;
}
.gh-crop {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 20px;
  opacity: 0.85;
  pointer-events: none;
}
.gh-edge {
  display: none;
}
.gh-legend {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--dc3d-text-dim, #6b8cae);
}
.gh-leg-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, #1565c0, #00bcd4, #2ec86e, #ffb020, #e53935);
  box-shadow: 0 0 6px rgba(0, 229, 255, 0.2);
}
.gh-leg-label {
  flex-shrink: 0;
}
.gh-leg-end {
  flex-shrink: 0;
  font-family: var(--dc3d-mono, monospace);
}
@media (max-width: 720px) {
  .gh-layer-head {
    min-width: 50px;
  }
  .gh-mv {
    font-size: 13px;
  }
}
</style>
