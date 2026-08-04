<script setup lang="ts">
/**
 * 冷链物流 DataV 科技大屏(阶段 3b,复用智慧水务范式)。
 * 顶部:合规率/断链时长/在途车次/库容利用率/货损率/能耗 数字翻牌 + 温控合规概览。
 * 中部:三段式密铺 —— 招牌①冷藏车队运输轨迹温层(SVG)
 *        ②冷库温区分区(SVG 3D 体块) ③门到门温层断链桑基(ECharts)
 *        + 辅图(温度合规带/月台作业甘特/单车温湿度)
 *        + DataV(断链告警日志/车队准点排行/冷库冷媒量/制冷效率)。
 * 底部:24h 多温区温度时序(全宽,温层限值 markLine + 越限红散点)。
 */
import DashboardShell from '../dashboard/DashboardShell.vue'
import DataVPanel from '../dashboard/DataVPanel.vue'
import ColdKpiFlops from '../dashboard/ColdKpiFlops.vue'
import ColdFleetOverview from '../dashboard/ColdFleetOverview.vue'
import ColdFleetMap from '../dashboard/ColdFleetMap.vue'
import ColdChainSankey from '../dashboard/ColdChainSankey.vue'
import ColdBreakLog from '../dashboard/ColdBreakLog.vue'
import ColdStorageZones from '../dashboard/ColdStorageZones.vue'
import ColdComplianceBand from '../dashboard/ColdComplianceBand.vue'
import ColdFleetRank from '../dashboard/ColdFleetRank.vue'
import ColdDockGantt from '../dashboard/ColdDockGantt.vue'
import ColdVehicleTh from '../dashboard/ColdVehicleTh.vue'
import ColdRefrigerant from '../dashboard/ColdRefrigerant.vue'
import ColdEfficiency from '../dashboard/ColdEfficiency.vue'
import ColdTrend from '../dashboard/ColdTrend.vue'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
</script>

<template>
  <DashboardShell
    :title="t('冷链物流监控中心', 'Cold-Chain Logistics Control Center')"
    :subtitle="t('车队温层追踪 · 冷库温区孪生 · 全链路温合规作战室', 'Fleet cold-layer tracking · storage-zone twin · end-to-end compliance war room')"
  >
    <!-- 顶部:数字翻牌 KPI 带 + 温控合规概览 -->
    <template #kpi>
      <div class="cc-top">
        <DataVPanel class="cc-flops" :title="t('冷链核心指标', 'Core Cold-Chain Metrics')" :border="8">
          <ColdKpiFlops />
        </DataVPanel>
        <DataVPanel class="cc-over" :title="t('温控合规指数', 'Thermal Compliance Index')" :border="8">
          <ColdFleetOverview />
        </DataVPanel>
      </div>
    </template>

    <!-- 主体:三段式工业大屏 -->
    <div class="cc-grid">
      <DataVPanel class="c-fleetmap" :title="t('冷藏车队运输轨迹温层', 'Reefer Fleet Trajectory by Cold-Layer')" :accessible-title="t('车队运输轨迹按温层着色与断链点', 'Fleet routes colored by cold-layer with break points')">
        <ColdFleetMap />
      </DataVPanel>
      <DataVPanel class="c-sankey" :title="t('门到门温层断链桑基', 'Door-to-Door Cold-Layer Sankey')" :accessible-title="t('装车干线中转末端流量与断链损失桑基图', 'Loading to last-mile flow with cold-chain break loss')">
        <ColdChainSankey />
      </DataVPanel>
      <DataVPanel class="c-breaklog" :title="t('断链告警日志', 'Cold-Chain Break Alarm')" :accessible-title="t('温度越限断链事件滚动日志', 'Temperature excursion and break event log')">
        <ColdBreakLog />
      </DataVPanel>
      <DataVPanel class="c-storage" :title="t('冷库温区分区', 'Cold Storage Zone Twin')" :accessible-title="t('冷藏冷冻恒温缓冲温区 3D 占用率与温度', 'Chilled frozen constant buffer zones occupancy and temperature')">
        <ColdStorageZones />
      </DataVPanel>
      <DataVPanel class="c-comply" :title="t('温度合规带', 'Temperature Compliance Band')" :accessible-title="t('单车温度合规带与越限区段', 'Single reefer compliance band with excursion windows')">
        <ColdComplianceBand />
      </DataVPanel>
      <DataVPanel class="c-rank" :title="t('车队准点排行', 'Fleet On-Time Ranking')" :accessible-title="t('各车队准点率与温控达标排行', 'Fleet on-time and compliance ranking')">
        <ColdFleetRank />
      </DataVPanel>
      <DataVPanel class="c-dock" :title="t('月台作业甘特', 'Dock Operation Gantt')" :accessible-title="t('月台装车卸车作业时段甘特图', 'Dock door loading and unloading schedule gantt')">
        <ColdDockGantt />
      </DataVPanel>
      <DataVPanel class="c-vehicle" :title="t('单车温湿度', 'Single Reefer Temp & Humidity')" :accessible-title="t('单车温度湿度双轴时序', 'Single reefer temperature and humidity trend')">
        <ColdVehicleTh />
      </DataVPanel>
      <DataVPanel class="c-refrig" :title="t('冷库冷媒量', 'Refrigerant Charge')" :accessible-title="t('冷藏冷冻制冷系统冷媒充注量', 'Chilled and frozen refrigerant charge level')">
        <ColdRefrigerant />
      </DataVPanel>
      <DataVPanel class="c-effcy" :title="t('制冷效率与温控达标', 'Cooling Efficiency & Compliance')" :accessible-title="t('制冷效率温控达标率与各温区达标胶囊', 'Cooling efficiency compliance rate and per-zone capsule')">
        <ColdEfficiency />
      </DataVPanel>
      <DataVPanel class="c-trend" :title="t('24h 多温区温度', '24h Multi-Zone Temperature')" :accessible-title="t('24 小时各温区温度时序 含限值线与越限点', '24h temperature by zone with limits and excursion points')">
        <ColdTrend />
      </DataVPanel>
    </div>
  </DashboardShell>
</template>

<style scoped>
/* 顶部:翻牌带(宽)+ 概览(窄) */
.cc-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
  margin-bottom: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .cc-top {
    grid-template-columns: 3fr 1fr;
  }
}
.cc-flops,
.cc-over {
  min-height: 172px;
}
.cc-top :deep(.dvp-body) {
  min-height: 108px;
}

/* 主体三段式密铺 */
.cc-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .cc-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 200px;
    grid-template-areas:
      'fleetmap fleetmap fleetmap fleetmap fleetmap sankey  sankey  sankey  sankey  breaklog breaklog breaklog'
      'fleetmap fleetmap fleetmap fleetmap fleetmap sankey  sankey  sankey  sankey  breaklog breaklog breaklog'
      'storage  storage  storage  storage  comply  comply  comply  comply  rank    rank    rank    rank'
      'storage  storage  storage  storage  comply  comply  comply  comply  rank    rank    rank    rank'
      'dock     dock     dock     dock     vehicle vehicle vehicle refrig  refrig  effcy   effcy   effcy'
      'trend    trend    trend    trend    trend   trend   trend   trend   trend   trend   trend   trend';
  }
  .c-fleetmap { grid-area: fleetmap; }
  .c-sankey { grid-area: sankey; }
  .c-breaklog { grid-area: breaklog; }
  .c-storage { grid-area: storage; }
  .c-comply { grid-area: comply; }
  .c-rank { grid-area: rank; }
  .c-dock { grid-area: dock; }
  .c-vehicle { grid-area: vehicle; }
  .c-refrig { grid-area: refrig; }
  .c-effcy { grid-area: effcy; }
  .c-trend { grid-area: trend; }
}
.cc-grid :deep(.dvp-body) {
  min-height: 0;
}
.cc-grid :deep(.dvp-body) > * {
  height: 100%;
}
</style>
