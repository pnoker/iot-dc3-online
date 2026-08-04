<script setup lang="ts">
/**
 * 招牌②:储罐液位墙(纯 SVG 手绘圆柱罐,领域独有,专业准确)。
 * 4 座天然气处理场储罐横排:凝析油 T-201 / 污油 T-202 / 甘醇 T-203 / 甲醇 T-204。
 * 每罐:椭圆顶 + 矩形筒体 + 椭圆底,液体填色高度 = 液位%。
 * HH 高高液位红线(strapping 容积标定的安全上限 90%),越线报警色变红。
 * 罐顶标注罐号 + 介质,罐底标注液位% 与实时存量(t)。每罐独立 useDomainSeries 缓变。
 */
import {computed} from 'vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

interface TankSpec {
  key: string
  tag: string
  medium: () => string
  capacity: number // 满罐吨位 t
  baseline: number // 液位 %
  phase: number
  seed: number
  color: string // 介质液色(固定 hex)
}
// 基准液位 45-78%,缓慢漂移;HH 阈值 90%。
const TANKS: TankSpec[] = [
  {key: 't201', tag: 'T-201', medium: () => t('凝析油', 'Condensate'), capacity: 500, baseline: 72, phase: 0.0, seed: 3101, color: '#ffb020'},
  {key: 't202', tag: 'T-202', medium: () => t('污油', 'Slop Oil'), capacity: 300, baseline: 38, phase: 1.1, seed: 3102, color: '#8a6a3a'},
  {key: 't203', tag: 'T-203', medium: () => t('甘醇', 'Glycol'), capacity: 200, baseline: 64, phase: 2.2, seed: 3103, color: '#39ff9e'},
  {key: 't204', tag: 'T-204', medium: () => t('甲醇', 'Methanol'), capacity: 150, baseline: 81, phase: 3.3, seed: 3104, color: '#2b9bff'},
]
const HH = 90

const tanks = TANKS.map((tk) => ({
  ref: tk,
  level: useDomainSeries(
    {baseline: tk.baseline, unit: '%', cycleMode: 'multiplicative', cycle: (s) => Math.sin(s / 100 + tk.phase), cycleAmp: 0.05, noiseAmp: 0.5},
    {intervalMs: 4000, window: 20, seed: tk.seed},
  ).current,
}))

// 罐体几何(SVG viewBox 0 0 720 280):4 罐横排,每罐宽 ~150。
// 罐体:筒身顶 y=70、底 y=230(高 160),椭圆 ry=14,筒宽 w=90。
const BODY_TOP = 70
const BODY_BOT = 230
const BODY_H = BODY_BOT - BODY_TOP
const RY = 14
const SLOTS = [60, 225, 390, 555] // 每罐中心 x
const HALF_W = 45

interface Rendered {
  key: string
  tag: string
  medium: string
  cx: number
  pct: number
  alarm: boolean
  fillTopY: number
  color: string
  stock: number
}
const rendered = computed<Rendered[]>(() =>
  tanks.map((tk, i) => {
    const pct = Math.max(0, Math.min(99, tk.level.value))
    const alarm = pct >= HH
    const fillH = (pct / 100) * BODY_H
    const fillTopY = BODY_BOT - fillH
    return {
      key: tk.ref.key,
      tag: tk.ref.tag,
      medium: tk.ref.medium(),
      cx: SLOTS[i],
      pct: Math.round(pct),
      alarm,
      fillTopY,
      color: alarm ? '#ff5252' : tk.ref.color,
      stock: Math.round((pct / 100) * tk.ref.capacity),
    }
  }),
)

const HH_Y = BODY_BOT - (HH / 100) * BODY_H
const accessibleTitle = computed(() => t('储罐罐区液位墙 含高高液位报警', 'Tank farm level wall with HH alarm'))
</script>

<template>
  <div class="ogtank" role="group" :aria-label="accessibleTitle">
    <ClientOnly>
      <svg viewBox="0 0 720 280" preserveAspectRatio="xMidYMid meet" class="ogtank__svg">
        <!-- 每座罐 -->
        <g v-for="tk in rendered" :key="tk.key">
          <!-- 罐体阴影底 -->
          <ellipse :cx="tk.cx" :cy="BODY_BOT + RY" :rx="HALF_W" :ry="RY" fill="rgba(0,0,0,0.35)" />
          <!-- 罐体外壳(筒身) -->
          <rect
            :x="tk.cx - HALF_W" :y="BODY_TOP" :width="HALF_W * 2" :height="BODY_H"
            fill="rgba(13,35,69,0.7)"
            :stroke="tk.color" stroke-width="1.4" stroke-opacity="0.6"
          />
          <!-- 液体填充(clip 到筒身,用 rect + 顶部椭圆) -->
          <rect
            :x="tk.cx - HALF_W" :y="tk.fillTopY" :width="HALF_W * 2" :height="BODY_BOT - tk.fillTopY"
            :fill="tk.color" fill-opacity="0.55"
          />
          <!-- 液面椭圆(只在非满/非空时显示液面) -->
          <ellipse
            v-if="tk.pct > 0 && tk.pct < 100"
            :cx="tk.cx" :cy="tk.fillTopY" :rx="HALF_W" :ry="RY"
            :fill="tk.color" fill-opacity="0.75"
            :stroke="tk.color" stroke-width="1"
          />
          <!-- 罐顶椭圆 -->
          <ellipse :cx="tk.cx" :cy="BODY_TOP" :rx="HALF_W" :ry="RY" fill="rgba(13,35,69,0.9)" :stroke="tk.color" stroke-width="1.4" stroke-opacity="0.7" />
          <!-- 罐顶呼吸阀 -->
          <rect :x="tk.cx - 4" :y="BODY_TOP - 12" width="8" height="10" :fill="tk.color" fill-opacity="0.6" />
          <!-- 罐底椭圆 -->
          <ellipse :cx="tk.cx" :cy="BODY_BOT" :rx="HALF_W" :ry="RY" fill="rgba(8,22,45,0.9)" :stroke="tk.color" stroke-width="1.2" stroke-opacity="0.5" />
          <!-- strapping 刻度线(每 25%) -->
          <g stroke="rgba(255,255,255,0.12)" stroke-width="0.8">
            <line v-for="g in [25,50,75]" :key="g" :x1="tk.cx + HALF_W - 6" :y1="BODY_BOT - (g/100)*BODY_H" :x2="tk.cx + HALF_W" :y2="BODY_BOT - (g/100)*BODY_H" />
          </g>
        </g>

        <!-- HH 高高液位红线(全罐区统一安全上限) -->
        <line :x1="SLOTS[0] - HALF_W" :y1="HH_Y" :x2="SLOTS[3] + HALF_W" :y2="HH_Y" stroke="#ff5252" stroke-width="1.4" stroke-dasharray="6 4" opacity="0.9" />
        <text :x="SLOTS[3] + HALF_W - 2" :y="HH_Y - 4" class="ogtank__hh" text-anchor="end">HH {{ HH }}%</text>

        <!-- 每罐标签 -->
        <g v-for="tk in rendered" :key="'l'+tk.key">
          <text :x="tk.cx" :y="BODY_TOP - 20" class="ogtank__tag" text-anchor="middle">{{ tk.tag }}</text>
          <text :x="tk.cx" :y="BODY_BOT + RY + 22" class="ogtank__medium" text-anchor="middle">{{ tk.medium }}</text>
          <text :x="tk.cx" :y="BODY_BOT + RY + 38" class="ogtank__pct" :class="{alarm: tk.alarm}" text-anchor="middle">{{ tk.pct }}%</text>
          <text :x="tk.cx" :y="BODY_BOT + RY + 52" class="ogtank__stock" text-anchor="middle">{{ tk.stock }} t</text>
        </g>
      </svg>
      <template #fallback>
        <div class="ogtank__fb">
          <div v-for="tk in rendered" :key="tk.key" class="ogtank__fbcell">
            <strong>{{ tk.tag }}</strong> {{ tk.medium }}: {{ tk.pct }}%
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.ogtank {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.ogtank__svg {
  width: 100%;
  height: 100%;
  min-height: 0;
}
.ogtank__tag {
  fill: #d4ecff;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--dc3d-mono, monospace);
}
.ogtank__medium {
  fill: #6b8cae;
  font-size: 10px;
}
.ogtank__pct {
  fill: #00e5ff;
  font-size: 14px;
  font-weight: 700;
  font-family: var(--dc3d-mono, monospace);
}
.ogtank__pct.alarm {
  fill: #ff5252;
}
.ogtank__stock {
  fill: #6b8cae;
  font-size: 10px;
  font-family: var(--dc3d-mono, monospace);
}
.ogtank__hh {
  fill: #ff8a8a;
  font-size: 10px;
  font-weight: 600;
  font-family: var(--dc3d-mono, monospace);
}
.ogtank__fb {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 10px;
  color: var(--dc3d-text-dim);
  font-size: 12px;
}
.ogtank__fbcell {
  padding: 6px;
  border: 1px solid var(--dc3d-panel-border);
  border-radius: 4px;
}
</style>
