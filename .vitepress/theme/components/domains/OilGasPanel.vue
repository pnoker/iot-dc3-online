<script setup lang="ts">
/**
 * 油气管网 DataV 科技大屏(阶段 3b,复用智慧工厂/水务范式)。
 * 顶部:压力偏差率/输量/管存/罐位/产气/气质合格率 数字翻牌 + 管网完整性概览。
 * 中部:三段式密铺 —— 招牌①管线纵断面与水力坡降(SVG) ②储罐液位墙(SVG) ③管网 GIS 流向(SVG)
 *        + 辅图(气质合规/压缩机 ISO 10816 仪表/管存调峰/井口多参数) + DataV(事件日志/站场排行/储罐水位/合格率)。
 * 底部:24h 输量与压力时序(全宽,markArea 晚高峰用气窗口)。
 */
import DashboardShell from '../dashboard/DashboardShell.vue'
import DataVPanel from '../dashboard/DataVPanel.vue'
import OilGasKpiFlops from '../dashboard/OilGasKpiFlops.vue'
import OilGasOverview from '../dashboard/OilGasOverview.vue'
import OilGasProfile from '../dashboard/OilGasProfile.vue'
import OilGasQualityTrend from '../dashboard/OilGasQualityTrend.vue'
import OilGasEventLog from '../dashboard/OilGasEventLog.vue'
import OilGasTankWall from '../dashboard/OilGasTankWall.vue'
import OilGasPipelineMap from '../dashboard/OilGasPipelineMap.vue'
import OilGasCompressorGauge from '../dashboard/OilGasCompressorGauge.vue'
import OilGasLinepackTrend from '../dashboard/OilGasLinepackTrend.vue'
import OilGasWellhead from '../dashboard/OilGasWellhead.vue'
import OilGasStationRank from '../dashboard/OilGasStationRank.vue'
import OilGasTankPonds from '../dashboard/OilGasTankPonds.vue'
import OilGasPercentPonds from '../dashboard/OilGasPercentPonds.vue'
import OilGasThroughputTrend from '../dashboard/OilGasThroughputTrend.vue'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
</script>

<template>
  <DashboardShell
    :title="t('油气管网监控中心', 'Oil & Gas Pipeline Control Center')"
    :subtitle="t('天然气管网数字孪生 · 水力坡降诊断 · 储罐管存调峰作战室', 'Gas pipeline digital twin · hydraulic gradient diagnostics · line-pack & tank peak-shaving war room')"
  >
    <!-- 顶部:数字翻牌 KPI 带 + 管网完整性概览 -->
    <template #kpi>
      <div class="og-top">
        <DataVPanel class="og-flops" :title="t('核心管网指标', 'Core Pipeline Metrics')" :border="8">
          <OilGasKpiFlops />
        </DataVPanel>
        <DataVPanel class="og-over" :title="t('管网完整性指数', 'Pipeline Integrity Index')" :border="8">
          <OilGasOverview />
        </DataVPanel>
      </div>
    </template>

    <!-- 主体:三段式工业大屏 -->
    <div class="og-grid">
      <DataVPanel class="c-profile" :title="t('管线纵断面与水力坡降', 'Profile & Hydraulic Gradient')" :accessible-title="t('天然气管线纵断面 运行压力 MAOP 包络 水力坡降', 'Gas pipeline profile operating pressure MAOP envelope hydraulic gradient')">
        <OilGasProfile />
      </DataVPanel>
      <DataVPanel class="c-quality" :title="t('气质四组分合规度', 'Gas Quality Compliance')" :accessible-title="t('H2S 水露点 CO2 热值 24h 合规度趋势', 'H2S water dewpoint CO2 calorific value 24h compliance')">
        <OilGasQualityTrend />
      </DataVPanel>
      <DataVPanel class="c-event" :title="t('管网事件日志', 'Pipeline Event Log')" :accessible-title="t('越压 罐位 振动 事件滚动日志', 'Over-pressure tank level vibration event log')">
        <OilGasEventLog />
      </DataVPanel>
      <DataVPanel class="c-tankwall" :title="t('储罐液位墙', 'Tank Farm Level Wall')" :accessible-title="t('凝析油 污油 甘醇 甲醇储罐液位 含高高液位报警', 'Condensate slop glycol methanol tank levels with HH alarm')">
        <OilGasTankWall />
      </DataVPanel>
      <DataVPanel class="c-gisflow" :title="t('管网 GIS 流向', 'Pipeline GIS Flow')" :accessible-title="t('集输管网走向 流向粒子 站场阀室散点', 'Gathering transmission pipeline flow with stations and valves')">
        <OilGasPipelineMap />
      </DataVPanel>
      <DataVPanel class="c-comp" :title="t('压缩机组工况', 'Compressor Condition')" :accessible-title="t('压缩机组振动速度仪表 ISO 10816 评价区', 'Compressor vibration gauges ISO 10816 zones')">
        <OilGasCompressorGauge />
      </DataVPanel>
      <DataVPanel class="c-linepack" :title="t('管存量与调峰', 'Line-pack & Peak-shaving')" :accessible-title="t('管存量与输量 24h 趋势 含调峰释放窗口', 'Line-pack and throughput 24h with peak-shaving window')">
        <OilGasLinepackTrend />
      </DataVPanel>
      <DataVPanel class="c-wellhead" :title="t('井口多参数', 'Wellhead Multiparam')" :accessible-title="t('气井井口油压套压温度产气量', 'Gas well tubing casing pressure temperature rate')">
        <OilGasWellhead />
      </DataVPanel>
      <DataVPanel class="c-rank" :title="t('站场输量排行', 'Station Throughput')" :accessible-title="t('各分输门站日输量排行', 'Distribution station daily throughput ranking')">
        <OilGasStationRank />
      </DataVPanel>
      <DataVPanel class="c-tankpond" :title="t('主力储罐液位', 'Primary Tank Levels')" :accessible-title="t('凝析油罐与甘醇罐实时液位', 'Condensate and glycol tank levels')">
        <OilGasTankPonds />
      </DataVPanel>
      <DataVPanel class="c-pctpond" :title="t('压力气质合格率', 'Pressure & Quality Rate')" :accessible-title="t('压力合格率气质达标率与各站压力偏差率', 'Pressure quality compliance and station pressure deviation')">
        <OilGasPercentPonds />
      </DataVPanel>
      <DataVPanel class="c-trend" :title="t('24h 输量与压力', '24h Throughput & Pressure')" :accessible-title="t('24 小时输量与出站压力时序 含晚高峰窗口', '24h throughput and outlet pressure with evening peak window')">
        <OilGasThroughputTrend />
      </DataVPanel>
    </div>
  </DashboardShell>
</template>

<style scoped>
/* 顶部:翻牌带(宽)+ 概览(窄) */
.og-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
  margin-bottom: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .og-top {
    grid-template-columns: 3fr 1fr;
  }
}
.og-flops,
.og-over {
  min-height: 172px;
}
.og-top :deep(.dvp-body) {
  min-height: 108px;
}

/* 主体三段式密铺:招牌纵断面/罐位墙/GIS 流向各跨多行多列 */
.og-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .og-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 200px;
    grid-template-areas:
      'profile profile profile profile profile profile quality quality quality event   event   event'
      'profile profile profile profile profile profile quality quality quality event   event   event'
      'tankwall tankwall tankwall tankwall gisflow gisflow gisflow gisflow comp    comp    comp    comp'
      'tankwall tankwall tankwall tankwall gisflow gisflow gisflow gisflow comp    comp    comp    comp'
      'linepack linepack linepack linepack wellhead wellhead wellhead wellhead rank    rank    rank    rank'
      'tankpond tankpond tankpond tankpond tankpond tankpond pctpond pctpond pctpond pctpond pctpond pctpond'
      'trend    trend    trend    trend    trend    trend    trend    trend    trend    trend    trend    trend';
  }
  .c-profile { grid-area: profile; }
  .c-quality { grid-area: quality; }
  .c-event { grid-area: event; }
  .c-tankwall { grid-area: tankwall; }
  .c-gisflow { grid-area: gisflow; }
  .c-comp { grid-area: comp; }
  .c-linepack { grid-area: linepack; }
  .c-wellhead { grid-area: wellhead; }
  .c-rank { grid-area: rank; }
  .c-tankpond { grid-area: tankpond; }
  .c-pctpond { grid-area: pctpond; }
  .c-trend { grid-area: trend; }
}
.og-grid :deep(.dvp-body) {
  min-height: 0;
}
.og-grid :deep(.dvp-body) > * {
  height: 100%;
}
</style>
