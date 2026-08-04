<script setup lang="ts">
import DashboardShell from '../dashboard/DashboardShell.vue'
import DataVPanel from '../dashboard/DataVPanel.vue'
import MicrogridKpiFlops from '../dashboard/MicrogridKpiFlops.vue'
import MicrogridGreenRate from '../dashboard/MicrogridGreenRate.vue'
import MicrogridTopology from '../dashboard/MicrogridTopology.vue'
import MicrogridSocGauge from '../dashboard/MicrogridSocGauge.vue'
import MicrogridPowerBalance from '../dashboard/MicrogridPowerBalance.vue'
import MicrogridEventLog from '../dashboard/MicrogridEventLog.vue'
import MicrogridGenRank from '../dashboard/MicrogridGenRank.vue'
import MicrogridBranchCapsule from '../dashboard/MicrogridBranchCapsule.vue'
import MicrogridCarbonBars from '../dashboard/MicrogridCarbonBars.vue'
import MicrogridDeviceGraph from '../dashboard/MicrogridDeviceGraph.vue'
import MicrogridPvSocTrend from '../dashboard/MicrogridPvSocTrend.vue'
import MicrogridArbitrage from '../dashboard/MicrogridArbitrage.vue'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
</script>

<template>
  <DashboardShell
    :title="t('微电网能源管控中心', 'Microgrid Energy Control Center')"
    :subtitle="t('光储充用一体 · 峰谷套利 · 并离网协同', 'PV-Storage-Load Integrated · Arbitrage · Grid/Island')"
  >
    <!-- 顶部:数字翻牌 KPI 带 + 绿电概览 -->
    <template #kpi>
      <div class="mg-top">
        <DataVPanel class="mg-flops" :title="t('核心运行指标', 'Key Metrics')" :border="8">
          <MicrogridKpiFlops />
        </DataVPanel>
        <DataVPanel class="mg-green" :title="t('绿电与电能质量', 'Green Rate & Power Quality')" :border="8">
          <MicrogridGreenRate />
        </DataVPanel>
      </div>
    </template>

    <!-- 主体:三段式工业大屏 -->
    <div class="mg-grid">
      <DataVPanel class="c-topo" :title="t('电气单线拓扑 SLD', 'Single-Line Diagram')" :accessible-title="t('光储充用电气单线拓扑图', 'Microgrid single-line diagram')">
        <MicrogridTopology />
      </DataVPanel>
      <DataVPanel class="c-socg" :title="t('储能 SOC 与充放电', 'Battery SOC & PCS')" :accessible-title="t('储能电池 SOC 仪表与充放电功率', 'Battery SOC gauge and charge power')">
        <MicrogridSocGauge />
      </DataVPanel>
      <DataVPanel class="c-evlog" :title="t('运行事件日志', 'Event Log')" :accessible-title="t('微电网运行事件滚动日志', 'Microgrid event log')">
        <MicrogridEventLog />
      </DataVPanel>
      <DataVPanel class="c-pbal" :title="t('发用电功率平衡', 'Power Balance')" :accessible-title="t('光伏储能电网负荷功率平衡与峰平谷电价', 'Power balance with peak-flat-valley tariff')">
        <MicrogridPowerBalance />
      </DataVPanel>
      <DataVPanel class="c-pvsoc" :title="t('7 天发电与 SOC', '7-Day PV & SOC')" :accessible-title="t('近 7 天光伏发电量与平均 SOC', '7-day PV generation and SOC')">
        <MicrogridPvSocTrend />
      </DataVPanel>
      <DataVPanel class="c-gnk" :title="t('方阵发电排行', 'PV Array Ranking')" :accessible-title="t('各光伏方阵日发电量排行', 'PV array generation ranking')">
        <MicrogridGenRank />
      </DataVPanel>
      <DataVPanel class="c-carbon" :title="t('碳减排', 'Carbon Reduction')" :accessible-title="t('近 7 天碳减排量', 'Carbon reduction by day')">
        <MicrogridCarbonBars />
      </DataVPanel>
      <DataVPanel class="c-dgraph" :title="t('节点设备状态', 'Device Status')" :accessible-title="t('关键设备通信拓扑与状态', 'Device communication topology and status')">
        <MicrogridDeviceGraph />
      </DataVPanel>
      <DataVPanel class="c-caps" :title="t('馈线功率分布', 'Feeder Power')" :accessible-title="t('各馈线支路实时功率胶囊图', 'Feeder branch power capsule')">
        <MicrogridBranchCapsule />
      </DataVPanel>
      <DataVPanel class="c-arb" :title="t('今日峰谷套利收益', 'Peak-Valley Arbitrage')" :accessible-title="t('储能峰谷套利收益瀑布', 'Arbitrage profit waterfall')">
        <MicrogridArbitrage />
      </DataVPanel>
    </div>
  </DashboardShell>
</template>

<style scoped>
/* 顶部:翻牌带(宽)+ 绿电概览(窄) */
.mg-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
  margin-bottom: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .mg-top {
    grid-template-columns: 3fr 1fr;
  }
}
.mg-flops,
.mg-green {
  min-height: 172px;
}
.mg-top :deep(.dvp-body) {
  min-height: 108px;
}

/* 主体三段式密铺 */
.mg-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .mg-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 200px;
    grid-template-areas:
      'topo topo topo topo topo socg socg socg evlog evlog evlog evlog'
      'topo topo topo topo topo socg socg socg evlog evlog evlog evlog'
      'pbal pbal pbal pbal pbal pbal pvsoc pvsoc pvsoc gnk gnk gnk'
      'pbal pbal pbal pbal pbal pbal pvsoc pvsoc pvsoc gnk gnk gnk'
      'carbon carbon carbon carbon dgraph dgraph dgraph dgraph caps caps caps caps'
      'arb arb arb arb arb arb arb arb arb arb arb arb';
  }
  .c-topo { grid-area: topo; }
  .c-socg { grid-area: socg; }
  .c-evlog { grid-area: evlog; }
  .c-pbal { grid-area: pbal; }
  .c-pvsoc { grid-area: pvsoc; }
  .c-gnk { grid-area: gnk; }
  .c-carbon { grid-area: carbon; }
  .c-dgraph { grid-area: dgraph; }
  .c-caps { grid-area: caps; }
  .c-arb { grid-area: arb; }
}
.mg-grid :deep(.dvp-body) {
  min-height: 0;
}
.mg-grid :deep(.dvp-body) > * {
  height: 100%;
}
</style>
