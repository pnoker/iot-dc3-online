<script setup lang="ts">
import {computed} from 'vue'
import DashboardShell from './DashboardShell.vue'
import {useDomainSeries, type FactorSpec} from '../../composables/useDomainSeries'
import {getDomain, type DomainMeta} from '../../mock/registry'
import {useI18n} from '../../composables/useI18n'

const props = defineProps<{id: string}>()
const {en, t} = useI18n()
const domain = getDomain(props.id) as DomainMeta

// 按 demo.kind 构造五因子 FactorSpec:每个领域的实时数字呈现该领域真实形态
// (光伏夜间 0 / 交通早晚双峰 / 楼宇工作时段方波 / 矿山瓦斯偶发突涌 …)
function peak(h: number, c: number, w = 1.5) {
  return Math.exp(-((h - c) ** 2) / (2 * w * w))
}
function makeSpec(d: DomainMeta['demo']): FactorSpec {
  const {baseline, unit, kind, cycleAmp, noiseAmp} = d
  switch (kind) {
    case 'pv':
      return {baseline: 0, unit, shape: (h) => (h >= 6 && h <= 18 ? Math.sin(((h - 6) / 12) * Math.PI) * 300 : 0), noiseAmp}
    case 'sin':
      return {baseline, unit, shape: (h) => baseline * (1 + (cycleAmp ?? 0.06) * Math.sin(((h - 9) / 12) * Math.PI)), noiseAmp}
    case 'peak2':
      return {baseline, unit, shape: (h) => baseline * (0.6 + 0.5 * peak(h, 8) + 0.4 * peak(h, 18)), noiseAmp}
    case 'occupancy':
      return {baseline, unit, shape: (h) => (h >= 9 && h <= 18 ? baseline * 1.6 : baseline * 0.4), noiseAmp}
    case 'evPeak':
      return {baseline, unit, shape: (h) => baseline * (0.7 + 0.8 * peak(h, 20, 2)), noiseAmp}
    case 'gas':
      return {baseline, unit, noiseAmp, events: [{rate: 1 / 45, type: 'step', size: baseline * 1.5, duration: 4}]}
    default:
      return {baseline, unit, cycleMode: 'multiplicative', cycle: (tt) => Math.sin(tt / 30), cycleAmp: cycleAmp ?? 0.03, noiseAmp}
  }
}

const {series, current} = useDomainSeries(makeSpec(domain.demo), {intervalMs: 1000, window: 60, seed: 42})

const displayValue = computed(() => {
  const v = current.value
  if (domain.demo.unit === '%') return v.toFixed(1)
  if (domain.demo.kind === 'gas') return v.toFixed(2)
  return v.toFixed(0)
})
const sparkPath = computed(() => {
  const pts = series.value.map((p) => p[1])
  if (pts.length < 2) return ''
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const range = max - min || 1
  return pts.map((v, i) => `${(i / (pts.length - 1)) * 100},${32 - ((v - min) / range) * 30}`).join(' ')
})
const statusColor = computed(() =>
  domain.demo.baseline > 0 && current.value > domain.demo.baseline * 1.3 ? 'var(--dc3d-warning)' : 'var(--dc3d-normal)',
)
</script>

<template>
  <DashboardShell
    :title="en ? `${domain.name_en} · ${domain.name_zh}` : domain.name_zh"
    :subtitle="en ? domain.tagline_en : domain.tagline_zh"
  >
    <div class="ph-grid" :style="{'--accent': domain.accent}">
      <section class="dc3d-panel ph-card">
        <div class="ph-head">
          <span class="ph-icon">{{ domain.icon }}</span>
          <span class="ph-stage">{{ domain.stage }}</span>
        </div>
        <h2>{{ t('看板建设中', 'Dashboard under construction') }}</h2>
        <p class="ph-desc">
          {{ t('该领域看板将在', 'This dashboard ships in') }} <b>{{ domain.stage }}</b>
          {{ t('实现。完成后呈现:', ', featuring:') }} {{ en ? domain.tagline_en : domain.tagline_zh }}
        </p>
        <p class="ph-sig"><b>{{ t('招牌可视化', 'Signature visuals') }}:</b> {{ domain.signature }}</p>
      </section>

      <section class="dc3d-panel ph-card ph-demo">
        <div class="ph-demo-label">{{ en ? domain.demo.label_en : domain.demo.label_zh }}</div>
        <div class="ph-demo-row">
          <div class="ph-demo-value" :style="{color: statusColor}">
            {{ displayValue }}<span class="ph-unit">{{ domain.demo.unit }}</span>
          </div>
          <svg class="ph-spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient :id="`phg${domain.id}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" :stop-color="domain.accent" stop-opacity="0.6" />
                <stop offset="100%" :stop-color="domain.accent" stop-opacity="0" />
              </linearGradient>
            </defs>
            <polygon :points="`0,32 ${sparkPath} 100,32`" :fill="`url(#phg${domain.id})`" />
            <polyline :points="sparkPath" fill="none" :stroke="domain.accent" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" />
          </svg>
        </div>
        <div class="ph-hint">
          <span class="ph-live" />
          {{ t('五因子实时模拟 · 与顶部暂停联动', 'Five-factor live simulation · linked to the pause toggle') }}
        </div>
      </section>
    </div>
  </DashboardShell>
</template>

<style scoped>
.ph-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 960px) {
  .ph-grid {
    grid-template-columns: 1.1fr 1fr;
  }
}
.ph-card {
  padding: 20px 22px;
}
.ph-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.ph-icon {
  font-size: 30px;
  filter: drop-shadow(0 0 8px var(--accent));
}
.ph-stage {
  padding: 2px 10px;
  border-radius: 0;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--dc3d-mono);
  color: #fff;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
}
.ph-card h2 {
  font-size: 18px;
  margin: 6px 0 8px;
  color: var(--dc3d-text);
  letter-spacing: 1px;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
}
.ph-desc {
  color: var(--dc3d-text-dim);
  font-size: 14px;
  line-height: 1.7;
  margin: 0 0 10px;
}
.ph-sig {
  color: var(--dc3d-text-dim);
  font-size: 13px;
  margin: 0;
}
.ph-demo-label {
  color: var(--dc3d-text-dim);
  font-size: 12px;
  letter-spacing: 1px;
  font-family: var(--dc3d-mono);
}
.ph-demo-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin: 6px 0 10px;
}
.ph-demo-value {
  font-size: clamp(30px, 4vw, 48px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  font-family: var(--dc3d-mono);
  text-shadow: 0 0 14px currentColor, 0 0 28px rgba(0, 229, 255, 0.3);
}
.ph-unit {
  font-size: 14px;
  font-weight: 600;
  color: var(--dc3d-text-dim);
  margin-left: 6px;
  text-shadow: none;
}
.ph-spark {
  width: 50%;
  height: 36px;
  opacity: 0.95;
  filter: drop-shadow(0 0 4px var(--accent));
}
.ph-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dc3d-text-dim);
  font-size: 12px;
  font-family: var(--dc3d-mono);
}
.ph-live {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dc3d-normal);
  animation: dc3d-breathe 1.6s ease-in-out infinite;
}
@keyframes dc3d-breathe {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ph-live {
    animation: none;
  }
}
</style>
