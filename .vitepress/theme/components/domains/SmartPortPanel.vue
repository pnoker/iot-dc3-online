<script setup lang="ts">
import DashboardShell from '../dashboard/DashboardShell.vue'
import DataVPanel from '../dashboard/DataVPanel.vue'
import SmartPortKpiFlops from '../dashboard/SmartPortKpiFlops.vue'
import SmartPortThroughput from '../dashboard/SmartPortThroughput.vue'
import PortAerialDispatch from '../dashboard/PortAerialDispatch.vue'
import BerthStsGantt from '../dashboard/BerthStsGantt.vue'
import YardBlockProfile from '../dashboard/YardBlockProfile.vue'
import PortEventLog from '../dashboard/PortEventLog.vue'
import StsEfficiencyRank from '../dashboard/StsEfficiencyRank.vue'
import StsMovesGauge from '../dashboard/StsMovesGauge.vue'
import GateTruckFlow from '../dashboard/GateTruckFlow.vue'
import TideWindow from '../dashboard/TideWindow.vue'
import YardBerthPonds from '../dashboard/YardBerthPonds.vue'
import PortThroughputTrend from '../dashboard/PortThroughputTrend.vue'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
</script>

<template>
  <DashboardShell
    :title="t('智慧港口调度中心', 'Smart Port Operations Center')"
    :subtitle="t('岸桥 STS · 堆场 RTG · 闸口 · 潮汐窗口协同', 'STS · RTG · Gate · Tidal Window Coordinated')"
  >
    <!-- 顶部:数字翻牌 KPI 带 + 吞吐概览 -->
    <template #kpi>
      <div class="sp-top">
        <DataVPanel class="sp-flops" :title="t('核心运营指标', 'Key Operations Metrics')" :border="8">
          <SmartPortKpiFlops />
        </DataVPanel>
        <DataVPanel class="sp-overview" :title="t('日吞吐达成', 'Daily TEU Achievement')" :border="8">
          <SmartPortThroughput />
        </DataVPanel>
      </div>
    </template>

    <!-- 主体:三段式工业大屏密铺(招牌主图跨多行多列) -->
    <div class="sp-grid">
      <DataVPanel class="c-aerial" :title="t('港区俯视调度', 'Terminal Aerial Dispatch')" :accessible-title="t('泊位船舶岸桥堆场集卡俯视调度图', 'Berth ship STS yard truck aerial dispatch')">
        <PortAerialDispatch />
      </DataVPanel>
      <DataVPanel class="c-gantt" :title="t('泊位-岸桥作业甘特', 'Berth-STC Gantt')" :accessible-title="t('泊位靠泊与岸桥分配甘特图', 'Berth berthing and STS allocation gantt')">
        <BerthStsGantt />
      </DataVPanel>
      <DataVPanel class="c-event" :title="t('作业事件日志', 'Operations Event Log')" :accessible-title="t('港口作业事件滚动日志', 'Port operations event log')">
        <PortEventLog />
      </DataVPanel>
      <DataVPanel class="c-yard" :title="t('堆场箱区 3D 视图', 'Yard Block Profile')" :accessible-title="t('堆场箱区三维体块高度与占用率', 'Yard block 3D profile by tier and occupancy')">
        <YardBlockProfile />
      </DataVPanel>
      <DataVPanel class="c-moves" :title="t('岸桥效率', 'STS Efficiency')" :accessible-title="t('岸桥 moves/h 仪表与利用率', 'STS moves per hour gauge and utilization')">
        <StsMovesGauge />
      </DataVPanel>
      <DataVPanel class="c-gate" :title="t('闸口集卡 TEU 流', 'Gate Truck TEU Flow')" :accessible-title="t('闸口各车道进出集卡 TEU 流', 'Gate lane inbound outbound truck TEU flow')">
        <GateTruckFlow />
      </DataVPanel>
      <DataVPanel class="c-tide" :title="t('潮汐窗口', 'Tidal Window')" :accessible-title="t('潮位与乘潮通航窗口', 'Tide level and tidal navigation window')">
        <TideWindow />
      </DataVPanel>
      <DataVPanel class="c-pond" :title="t('堆场与泊位达成', 'Yard & Berth Achievement')" :accessible-title="t('堆场利用率与泊位计划达成率', 'Yard utilization and berth plan achievement')">
        <YardBerthPonds />
      </DataVPanel>
      <DataVPanel class="c-rank" :title="t('岸桥效率排行', 'STS Moves Ranking')" :accessible-title="t('各岸桥 moves/h 效率排行', 'STS moves per hour ranking')">
        <StsEfficiencyRank />
      </DataVPanel>
      <DataVPanel class="c-trend" :title="t('24h 吞吐与岸桥趋势', '24h Throughput & STS Trend')" :accessible-title="t('全天吞吐 TEU 与岸桥 moves/h 趋势', '24h throughput TEU and STS moves trend')">
        <PortThroughputTrend />
      </DataVPanel>
    </div>
  </DashboardShell>
</template>

<style scoped>
/* 顶部:翻牌带(宽)+ 吞吐概览(窄) */
.sp-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
  margin-bottom: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .sp-top {
    grid-template-columns: 3fr 1fr;
  }
}
.sp-flops,
.sp-overview {
  min-height: 172px;
}
.sp-top :deep(.dvp-body) {
  min-height: 108px;
}

/* 主体三段式密铺:招牌俯视调度/堆场箱区跨 6 列 2 行 */
.sp-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .sp-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 200px;
    grid-template-areas:
      'aerial aerial aerial aerial aerial aerial gantt gantt gantt gantt event event'
      'aerial aerial aerial aerial aerial aerial gantt gantt gantt gantt event event'
      'yard yard yard yard yard yard moves moves gate gate gate gate'
      'yard yard yard yard yard yard moves moves gate gate gate gate'
      'tide tide tide tide pond pond pond pond rank rank rank rank'
      'trend trend trend trend trend trend trend trend trend trend trend trend';
  }
  .c-aerial { grid-area: aerial; }
  .c-gantt { grid-area: gantt; }
  .c-event { grid-area: event; }
  .c-yard { grid-area: yard; }
  .c-moves { grid-area: moves; }
  .c-gate { grid-area: gate; }
  .c-tide { grid-area: tide; }
  .c-pond { grid-area: pond; }
  .c-rank { grid-area: rank; }
  .c-trend { grid-area: trend; }
}
.sp-grid :deep(.dvp-body) {
  min-height: 0;
}
.sp-grid :deep(.dvp-body) > * {
  height: 100%;
}
</style>
