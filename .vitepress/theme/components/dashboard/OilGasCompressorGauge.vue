<script setup lang="ts">
/**
 * 压缩机工况:3 台离心式压缩机组的振动速度仪表(mm/s,ISO 10816 评价区)。
 * ISO 10816-3 振动速度区(刚性安装,10-200 kW 段):
 *   A 区 <2.3(优良,绿)、B 区 2.3-4.5(合格,青)、C 区 4.5-7.1(报警,琥珀)、D 区 >7.1(危险,红)。
 * 每台机组独立 useDomainSeries(baseline 3.0-5.2 mm/s),C/D 区触发表盘指针色变。
 */
import {computed} from 'vue'
import BaseChart from './BaseChart.vue'
import {useDomainSeries} from '../../composables/useDomainSeries'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()

const UNITS = [
  {zh: 'K-101 压缩机', en: 'K-101', baseline: 3.1, seed: 511},
  {zh: 'K-102 压缩机', en: 'K-102', baseline: 4.3, seed: 522},
  {zh: 'K-103 压缩机', en: 'K-103', baseline: 5.4, seed: 533},
]
const vibes = UNITS.map((u) => ({
  ref: u,
  val: useDomainSeries({baseline: u.baseline, unit: 'mm/s', cycle: (s) => Math.sin(s / 120 + u.seed), cycleAmp: 0.06, noiseAmp: 0.18}, {seed: u.seed, window: 2}).current,
}))

// ISO 10816 区间色(0-10 mm/s 量程):A<2.3 / B 2.3-4.5 / C 4.5-7.1 / D>7.1
function zoneColor(v: number): string {
  if (v < 2.3) return '#00e676'
  if (v < 4.5) return '#00e5ff'
  if (v < 7.1) return '#ffa726'
  return '#ff5252'
}
function zoneName(v: number): string {
  if (v < 2.3) return t('A 优良', 'A Good')
  if (v < 4.5) return t('B 合格', 'B Accept.')
  if (v < 7.1) return t('C 报警', 'C Alarm')
  return t('D 危险', 'D Danger')
}

const MAX = 10
const option = computed(() => {
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => p.name + '<br/>' + t('振动速度', 'Vibration') + ': <b>' + p.value.toFixed(2) + ' mm/s</b><br/>' + zoneName(p.value),
    },
    series: vibes.map((u, i) => {
      const v = Math.max(0, Math.min(MAX, u.val.value))
      return {
        type: 'gauge',
        center: [String(16 + i * 34) + '%', '60%'],
        radius: '54%',
        min: 0,
        max: MAX,
        startAngle: 200,
        endAngle: -20,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 9,
            // ISO 10816 四区段着色(比例 0-1)
            color: [
              [0.23, '#00e676'],
              [0.45, '#00e5ff'],
              [0.71, '#ffa726'],
              [1, '#ff5252'],
            ],
          },
        },
        pointer: {itemStyle: {color: zoneColor(v)}, length: '58%', width: 3},
        anchor: {show: true, size: 8, itemStyle: {color: '#d4ecff'}},
        axisTick: {distance: -13, length: 4, lineStyle: {color: 'rgba(255,255,255,0.3)'}},
        splitLine: {distance: -15, length: 8, lineStyle: {color: '#d4ecff', width: 2}},
        axisLabel: {color: '#6b8cae', fontSize: 9, distance: -23},
        title: {show: true, offsetCenter: [0, '74%'], color: '#d4ecff', fontSize: 12, fontWeight: 600},
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '32%'],
          formatter: '{value}',
          color: zoneColor(v),
          fontSize: 16,
          fontWeight: 700,
          fontFamily: 'var(--dc3d-mono, monospace)',
        },
        data: [{value: +v.toFixed(2), name: t(u.ref.zh, u.ref.en)}],
      }
    }),
  }
})

const accessibleTitle = computed(() => t('压缩机组振动速度仪表 ISO 10816', 'Compressor vibration gauges ISO 10816'))
const UNIT_HINT = computed(() => t('振动速度 mm/s · ISO 10816-3', 'Vibration mm/s · ISO 10816-3'))
</script>

<template>
  <div class="ogcomp" role="group" :aria-label="accessibleTitle">
    <BaseChart :option="option" :accessible-title="accessibleTitle" height="100%" />
    <span class="ogcomp__hint">{{ UNIT_HINT }}</span>
  </div>
</template>

<style scoped>
.ogcomp {
  position: relative;
  width: 100%;
  height: 100%;
}
.ogcomp__hint {
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.5px;
  color: var(--dc3d-text-dim);
  font-family: var(--dc3d-mono, monospace);
  pointer-events: none;
}
</style>
