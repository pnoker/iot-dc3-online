<script setup lang="ts">
/**
 * 台区配变负载与热模型(ECharts gauge + 侧栏)。
 * gauge 显示负载率 0-150%,分段:经济 0-70% / 重载 70-100% / 过载 100-120% / 严重 >120%。
 * 热模型(IEC 60076-7 顶层油温简化):θ_oil = θ_amb + Δθ_r × (L/L_r)^1.6
 *   θ_amb=40℃(夏季户外) Δθ_r=55℃ → 满载(100%)θ≈95℃。
 * 告警分级按热模型:>120% 或 θ_oil>95℃ 触发 critical,联动 OBMS 有序充电降功率(非简单 90%/30s)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const THETA_AMB = 40 // 环温 ℃
const THETA_R = 55 // 额定顶层油温升
const OIL_EXP = 1.6

const loadSrc = useDomainSeries(
  {baseline: 92, unit: '%', cycle: (s) => Math.sin(s / 95 + 1), cycleAmp: 0.22, noiseAmp: 2},
  {seed: 81, window: 2},
)

const load = computed(() => Math.max(0, Math.min(150, loadSrc.current.value)))
const oilTemp = computed(() => +(THETA_AMB + THETA_R * Math.pow(load.value / 100, OIL_EXP)).toFixed(1))

// 分级:综合负载率与热模型
const level = computed(() => {
  const l = load.value
  const th = oilTemp.value
  if (l > 120 || th > 105) return {key: 'crit', color: '#ff5252', zh: '严重过载 · 启动有序充电', en: 'Critical · OBMS curtail', action: true}
  if (l > 100 || th > 95) return {key: 'over', color: '#ff8a3d', zh: '过载告警', en: 'Overload alarm', action: true}
  if (l > 70) return {key: 'heavy', color: '#ffb020', zh: '重载运行', en: 'Heavy load', action: false}
  return {key: 'eco', color: '#00e676', zh: '经济运行', en: 'Economic', action: false}
})

const option = computed(() => ({
  series: [
    {
      type: 'gauge',
      min: 0,
      max: 150,
      startAngle: 210,
      endAngle: -30,
      radius: '90%',
      center: ['50%', '60%'],
      progress: {show: true, width: 11, roundCap: true},
      pointer: {width: 4, length: '60%', itemStyle: {color: '#d4ecff'}},
      anchor: {show: true, size: 9, itemStyle: {color: '#d4ecff', borderColor: level.value.color, borderWidth: 2}},
      axisLine: {
        lineStyle: {
          width: 11,
          color: [
            [0.467, '#00e676'], // 0-70% 经济
            [0.667, '#ffb020'], // 70-100% 重载
            [0.8, '#ff8a3d'], // 100-120% 过载
            [1, '#ff5252'], // 120-150% 严重
          ],
        },
      },
      axisTick: {distance: -18, length: 4, lineStyle: {color: 'rgba(212,236,255,0.5)'}},
      splitLine: {distance: -20, length: 9, lineStyle: {color: 'rgba(212,236,255,0.6)', width: 1.5}},
      axisLabel: {distance: -2, color: '#6b8cae', fontSize: 9, formatter: (v: number) => (v % 30 === 0 ? v : '')},
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '34%'],
        formatter: '{value}%',
        color: level.value.color,
        fontSize: 24,
        fontWeight: 800,
      },
      title: {offsetCenter: [0, '58%'], color: '#6b8cae', fontSize: 10},
      data: [{value: Math.round(load.value), name: t('负载率', 'Load')}],
    },
  ],
}))

const accessibleTitle = computed(() => t('台区配变负载率与顶层油温热模型', 'Transformer load & top-oil thermal model'))
</script>

<template>
  <div class="txg" role="group" :aria-label="accessibleTitle">
    <div class="txg-gauge">
      <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
    </div>
    <div class="txg-side">
      <div class="txg-row">
        <span class="txg-k">{{ t('顶层油温', 'Top-oil') }}</span>
        <span class="txg-v" :style="{color: oilTemp > 95 ? '#ff5252' : '#d4ecff'}">{{ oilTemp }}℃</span>
      </div>
      <div class="txg-row">
        <span class="txg-k">{{ t('环温', 'Ambient') }}</span>
        <span class="txg-v">{{ THETA_AMB }}℃</span>
      </div>
      <div class="txg-row">
        <span class="txg-k">{{ t('额定容量', 'Rating') }}</span>
        <span class="txg-v">2000 kVA</span>
      </div>
      <div class="txg-level" :style="{borderColor: level.color, color: level.color, boxShadow: '0 0 8px ' + level.color}">
        <span class="txg-dot" :style="{background: level.color}" />
        {{ t(level.zh, level.en) }}
      </div>
      <div v-if="level.action" class="txg-action">
        {{ t('OBMS 有序充电已降功率', 'OBMS smart-charging curtailed') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.txg { display: flex; gap: 8px; width: 100%; height: 100%; box-sizing: border-box; }
.txg-gauge { flex: 1.4; min-width: 0; height: 100%; }
.txg-side { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; justify-content: center; }
.txg-row { display: flex; justify-content: space-between; align-items: baseline; padding: 3px 6px; border-bottom: 1px solid rgba(0,229,255,0.12); }
.txg-k { font-size: 11px; color: var(--dc3d-text-dim); }
.txg-v { font-size: 15px; font-weight: 700; font-family: var(--dc3d-mono, monospace); color: #d4ecff; }
.txg-level {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 8px; margin-top: 4px;
  border: 1px solid; border-radius: var(--dc3d-radius);
  font-size: 12px; font-weight: 600; letter-spacing: 0.3px;
}
.txg-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.txg-action {
  font-size: 10.5px; color: #ff8a8a; padding: 4px 8px;
  background: rgba(255,82,82,0.1); border-radius: 3px;
  animation: txg-blink 1.6s ease-in-out infinite;
}
@keyframes txg-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
@media (max-width: 720px) {
  .txg { flex-direction: column; }
  .txg-gauge { flex: none; height: 60%; }
}
</style>
