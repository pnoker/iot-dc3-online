<script setup lang="ts">
/**
 * 招牌③:AHU 焓湿图(干球温度 × 含湿量)。
 * 状态点:新风 OA(高温高湿)→ 混合 MA → 送风 SA(冷却盘管后近饱和低温)→ 室内 RA(等湿加热)。
 * 自绘等相对湿度(RH)参考曲线(Magnus 饱和蒸汽压 + 含湿量公式),空调过程路径连线。
 * 物理准确:P=101325Pa, W = 0.62198·Pv/(P−Pv), Pv = RH·Ps(T)。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const P = 101325 // 标准大气压 Pa
function satPressure(tc: number): number {
  // Magnus 饱和水汽压
  return 610.78 * Math.exp((17.27 * tc) / (tc + 237.3))
}
// 含湿量 g/kg(干空气)
function humidityRatio(tc: number, rh: number): number {
  const rhc = Math.max(0, Math.min(1, rh))
  const pv = rhc * satPressure(tc)
  return ((0.62198 * pv) / (P - pv)) * 1000
}

// 四状态点:独立漂移(温/湿度小周期)。SA 近盘管机器露点(低温近饱和)。
const oaT = useDomainSeries({baseline: 34, unit: '°C', cycle: (s) => Math.sin(s / 130), cycleAmp: 0.01, noiseAmp: 0.25}, {seed: 11, window: 2}).current
const oaR = useDomainSeries({baseline: 0.58, unit: '', cycle: (s) => Math.sin(s / 150 + 1), cycleAmp: 0.02, noiseAmp: 0.01}, {seed: 12, window: 2}).current
const maT = useDomainSeries({baseline: 27.5, unit: '°C', cycle: (s) => Math.sin(s / 140 + 0.5), cycleAmp: 0.01, noiseAmp: 0.2}, {seed: 13, window: 2}).current
const maR = useDomainSeries({baseline: 0.62, unit: '', cycle: (s) => Math.sin(s / 160 + 2), cycleAmp: 0.02, noiseAmp: 0.01}, {seed: 14, window: 2}).current
const saT = useDomainSeries({baseline: 14, unit: '°C', cycle: (s) => Math.sin(s / 170 + 1), cycleAmp: 0.008, noiseAmp: 0.12}, {seed: 15, window: 2}).current
const saR = useDomainSeries({baseline: 0.92, unit: '', cycle: (s) => Math.sin(s / 180 + 3), cycleAmp: 0.01, noiseAmp: 0.008}, {seed: 16, window: 2}).current
const raT = useDomainSeries({baseline: 25, unit: '°C', cycle: (s) => Math.sin(s / 150 + 2), cycleAmp: 0.008, noiseAmp: 0.15}, {seed: 17, window: 2}).current
const raR = useDomainSeries({baseline: 0.5, unit: '', cycle: (s) => Math.sin(s / 170 + 4), cycleAmp: 0.02, noiseAmp: 0.01}, {seed: 18, window: 2}).current

// 等相对湿度参考曲线(30/50/70/90%)
const RH_CURVES = [0.3, 0.5, 0.7, 0.9]
function rhLine(rh: number): [number, number][] {
  const pts: [number, number][] = []
  for (let tc = 0; tc <= 40; tc += 1) {
    pts.push([tc, +humidityRatio(tc, rh).toFixed(2)])
  }
  return pts
}

const accessibleTitle = computed(() => t('AHU 焓湿图(空调降温除湿过程)', 'AHU psychrometric chart (cooling & dehumidification)'))

const option = computed(() => {
  const oa: [number, number] = [+oaT.value.toFixed(1), +humidityRatio(oaT.value, oaR.value).toFixed(2)]
  const ma: [number, number] = [+maT.value.toFixed(1), +humidityRatio(maT.value, maR.value).toFixed(2)]
  const sa: [number, number] = [+saT.value.toFixed(1), +humidityRatio(saT.value, saR.value).toFixed(2)]
  const ra: [number, number] = [+raT.value.toFixed(1), +humidityRatio(raT.value, raR.value).toFixed(2)]
  const ptLabel = (zh: string, enText: string, color: string) => ({
    show: true,
    formatter: t(zh, enText),
    position: 'top',
    color,
    fontSize: 11,
    fontWeight: 700,
    textShadowBlur: 6,
    textShadowColor: 'rgba(0,0,0,0.65)',
    distance: 6,
  })
  return {
    legend: {show: false},
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const d = p.data
        if (!d || !Array.isArray(d.value)) return p.name || ''
        const [tc, w] = d.value
        const head = d.tagZh ? t(d.tagZh, d.tagEn) : ''
        return `${head}<br/>${t('干球温度', 'Dry-bulb')}: <b>${tc}°C</b><br/>${t('含湿量', 'Humidity ratio')}: <b>${w} g/kg</b><br/>${t('相对湿度', 'RH')}: ${Math.round(d.rh * 100)}%`
      },
    },
    grid: {left: 44, right: 22, top: 16, bottom: 40, containLabel: true},
    xAxis: {
      type: 'value',
      name: t('干球温度 °C', 'Dry-bulb °C'),
      nameLocation: 'middle',
      nameGap: 26,
      min: 0,
      max: 40,
      interval: 5,
    },
    yAxis: {
      type: 'value',
      name: t('含湿量 g/kg', 'W g/kg'),
      nameLocation: 'middle',
      nameGap: 36,
      min: 0,
      max: 26,
      interval: 5,
    },
    series: [
      // 等相对湿度参考曲线(灰色虚线,无面积)
      ...RH_CURVES.map((rh) => ({
        type: 'line' as const,
        name: `RH ${rh * 100}%`,
        data: rhLine(rh),
        showSymbol: false,
        smooth: true,
        lineStyle: {color: 'rgba(148,163,184,0.35)', width: 1, type: 'dashed' as const, shadowBlur: 0},
        itemStyle: {color: 'rgba(148,163,184,0.35)'},
        areaStyle: {opacity: 0},
        silent: true,
        endLabel: {show: true, formatter: `${rh * 100}%`, color: 'rgba(148,163,184,0.7)', fontSize: 9},
      })),
      // 空调过程路径 OA→MA→SA→RA(降温除湿 + 等湿加热)
      {
        type: 'line',
        name: t('空调过程', 'AC Process'),
        data: [oa, ma, sa, ra],
        showSymbol: false,
        smooth: false,
        lineStyle: {width: 2.5, color: '#00e5ff', type: 'solid', shadowBlur: 0},
        itemStyle: {color: '#00e5ff'},
        areaStyle: {opacity: 0},
        z: 5,
      },
      // 状态点
      {
        type: 'scatter',
        name: t('状态点', 'Air States'),
        data: [
          {value: oa, tagZh: '新风 OA', tagEn: 'OA', rh: oaR.value, itemStyle: {color: '#ff5252'}, symbolSize: 14, label: ptLabel('新风 OA', 'OA', '#ff5252')},
          {value: ma, tagZh: '混合 MA', tagEn: 'MA', rh: maR.value, itemStyle: {color: '#b980ff'}, symbolSize: 12, label: ptLabel('混合 MA', 'MA', '#b980ff')},
          {value: sa, tagZh: '送风 SA', tagEn: 'SA', rh: saR.value, itemStyle: {color: '#00e6ff'}, symbolSize: 14, label: ptLabel('送风 SA', 'SA', '#00e6ff')},
          {value: ra, tagZh: '室内 RA', tagEn: 'RA', rh: raR.value, itemStyle: {color: '#39ff9e'}, symbolSize: 14, label: ptLabel('室内 RA', 'RA', '#39ff9e')},
        ],
        z: 6,
      },
    ],
  }
})
</script>

<template>
  <BaseChart :option="option" :accessible-title="accessibleTitle" height="clamp(260px, 36vh, 400px)" />
</template>

<style scoped></style>
