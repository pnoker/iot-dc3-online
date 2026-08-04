<script setup lang="ts">
/**
 * 智慧水务 DataV 科技大屏(阶段 3a,复用智慧工厂范式)。
 * 顶部:漏损率/MNF/压力合格率/水质达标率/产销差/泵效 数字翻牌 + 管网健康概览。
 * 中部:三段式密铺 —— 招牌①管网 GIS 数字孪生(SVG) ②DMA 漏损四象限 ③流量桑基
 *        + 辅图(水质热力/泵效仪表) + DataV(事件日志/DMA 排行/水库水位/达成率)。
 * 底部:24h 压力/流量时序(全宽,markArea MNF 夜间最小流量窗口)。
 */
import DashboardShell from '../dashboard/DashboardShell.vue'
import DataVPanel from '../dashboard/DataVPanel.vue'
import WaterKpiFlops from '../dashboard/WaterKpiFlops.vue'
import WaterOverview from '../dashboard/WaterOverview.vue'
import WaterPipeMap from '../dashboard/WaterPipeMap.vue'
import WaterFlowSankey from '../dashboard/WaterFlowSankey.vue'
import WaterEventLog from '../dashboard/WaterEventLog.vue'
import WaterDmaQuadrant from '../dashboard/WaterDmaQuadrant.vue'
import WaterQualityHeatmap from '../dashboard/WaterQualityHeatmap.vue'
import WaterDmaRanking from '../dashboard/WaterDmaRanking.vue'
import WaterPumpGauge from '../dashboard/WaterPumpGauge.vue'
import WaterReservoirLevel from '../dashboard/WaterReservoirLevel.vue'
import WaterQualityRate from '../dashboard/WaterQualityRate.vue'
import WaterPressureFlowTrend from '../dashboard/WaterPressureFlowTrend.vue'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
</script>

<template>
  <DashboardShell
    :title="t('智慧水务监控中心', 'Smart Water Network Control Center')"
    :subtitle="t('管网数字孪生 · DMA 漏损诊断 · 实时水质保障作战室', 'Pipe-network digital twin · DMA leak diagnostics · water quality war room')"
  >
    <!-- 顶部:数字翻牌 KPI 带 + 管网健康概览 -->
    <template #kpi>
      <div class="wn-top">
        <DataVPanel class="wn-flops" :title="t('核心供水指标', 'Core Water Metrics')" :border="8">
          <WaterKpiFlops />
        </DataVPanel>
        <DataVPanel class="wn-over" :title="t('管网健康概览', 'Network Health Index')" :border="8">
          <WaterOverview />
        </DataVPanel>
      </div>
    </template>

    <!-- 主体:三段式工业大屏 -->
    <div class="wn-grid">
      <DataVPanel class="c-piptop" :title="t('管网 GIS 数字孪生', 'Pipe-Network GIS Digital Twin')" :accessible-title="t('城市管网压力梯度与漏损点数字孪生', 'Pipe network pressure gradient and leak points')">
        <WaterPipeMap />
      </DataVPanel>
      <DataVPanel class="c-sankey" :title="t('流量分配桑基', 'Flow Allocation Sankey')" :accessible-title="t('水源泵站 DMA 用户流量分配桑基图', 'Source to user flow allocation sankey')">
        <WaterFlowSankey />
      </DataVPanel>
      <DataVPanel class="c-log" :title="t('管网事件日志', 'Network Event Log')" :accessible-title="t('爆管漏损事件滚动日志', 'Burst and leak event log')">
        <WaterEventLog />
      </DataVPanel>
      <DataVPanel class="c-quad" :title="t('DMA 分区漏损四象限', 'DMA Leakage Quadrant')" :accessible-title="t('夜间最小流量与单位管长漏损四象限分析', 'DMA MNF vs unit-length leakage quadrant')">
        <WaterDmaQuadrant />
      </DataVPanel>
      <DataVPanel class="c-heat" :title="t('余氯水质热力', 'Residual Chlorine Heatmap')" :accessible-title="t('小时监测站余氯热力图', 'Hourly residual chlorine heatmap by station')">
        <WaterQualityHeatmap />
      </DataVPanel>
      <DataVPanel class="c-rank" :title="t('DMA 漏损排行', 'DMA Leakage Ranking')" :accessible-title="t('各 DMA 分区漏损率排行', 'DMA non-revenue water ranking')">
        <WaterDmaRanking />
      </DataVPanel>
      <DataVPanel class="c-pump" :title="t('泵站机组效率', 'Pump Station Efficiency')" :accessible-title="t('泵站机组实时效率仪表', 'Pump unit efficiency gauges')">
        <WaterPumpGauge />
      </DataVPanel>
      <DataVPanel class="c-pond" :title="t('水库水位', 'Reservoir Levels')" :accessible-title="t('清水池与高位水池水位', 'Clear-well and elevated tank levels')">
        <WaterReservoirLevel />
      </DataVPanel>
      <DataVPanel class="c-qual" :title="t('压力水质合格率', 'Pressure & Quality Rate')" :accessible-title="t('压力合格率水质达标率与各分区水质', 'Pressure and quality compliance rates')">
        <WaterQualityRate />
      </DataVPanel>
      <DataVPanel class="c-trend" :title="t('24h 管网压力与流量', '24h Pressure & Flow')" :accessible-title="t('24 小时管网压力流量时序 含夜间最小流量窗口', '24h pressure and flow with minimum night flow window')">
        <WaterPressureFlowTrend />
      </DataVPanel>
    </div>
  </DashboardShell>
</template>

<style scoped>
/* 顶部:翻牌带(宽)+ 概览(窄) */
.wn-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
  margin-bottom: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .wn-top {
    grid-template-columns: 3fr 1fr;
  }
}
.wn-flops,
.wn-over {
  min-height: 172px;
}
.wn-top :deep(.dvp-body) {
  min-height: 108px;
}

/* 主体三段式密铺 */
.wn-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .wn-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 200px;
    grid-template-areas:
      'piptop piptop piptop piptop piptop sankey sankey sankey log    log    log    log'
      'piptop piptop piptop piptop piptop sankey sankey sankey log    log    log    log'
      'quad   quad   quad   quad   heat   heat   heat   heat   rank   rank   rank   rank'
      'quad   quad   quad   quad   heat   heat   heat   heat   rank   rank   rank   rank'
      'pump   pump   pump   pond   pond   pond   qual   qual   qual   qual   qual   qual'
      'trend  trend  trend  trend  trend  trend  trend  trend  trend  trend  trend  trend';
  }
  .c-piptop { grid-area: piptop; }
  .c-sankey { grid-area: sankey; }
  .c-log { grid-area: log; }
  .c-quad { grid-area: quad; }
  .c-heat { grid-area: heat; }
  .c-rank { grid-area: rank; }
  .c-pump { grid-area: pump; }
  .c-pond { grid-area: pond; }
  .c-qual { grid-area: qual; }
  .c-trend { grid-area: trend; }
}
.wn-grid :deep(.dvp-body) {
  min-height: 0;
}
.wn-grid :deep(.dvp-body) > * {
  height: 100%;
}
</style>
