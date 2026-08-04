<script setup lang="ts">
import DashboardShell from '../dashboard/DashboardShell.vue'
import DataVPanel from '../dashboard/DataVPanel.vue'
import TrafficKpiFlops from '../dashboard/TrafficKpiFlops.vue'
import TrafficOverview from '../dashboard/TrafficOverview.vue'
import TrafficCongestionMap from '../dashboard/TrafficCongestionMap.vue'
import IntersectionChannelization from '../dashboard/IntersectionChannelization.vue'
import TrafficEventLog from '../dashboard/TrafficEventLog.vue'
import GreenWaveTimeSpace from '../dashboard/GreenWaveTimeSpace.vue'
import TrafficFlowSpeed from '../dashboard/TrafficFlowSpeed.vue'
import IntersectionQueue from '../dashboard/IntersectionQueue.vue'
import TrafficSaturationRank from '../dashboard/TrafficSaturationRank.vue'
import TrafficSignalOnline from '../dashboard/TrafficSignalOnline.vue'
import TrafficDirectionFlow from '../dashboard/TrafficDirectionFlow.vue'
import TrafficSpillback from '../dashboard/TrafficSpillback.vue'
import TrafficTimeline from '../dashboard/TrafficTimeline.vue'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
</script>

<template>
  <DashboardShell
    :title="t('智慧交通监控中心', 'Smart Traffic Control Center')"
    :subtitle="t('路网拥堵指数 TPI 驱动的城市交通作战室', 'TPI-driven urban traffic war room')"
  >
    <!-- 顶部:数字翻牌 KPI 带 + TPI 概览 -->
    <template #kpi>
      <div class="st-top">
        <DataVPanel class="st-flops" :title="t('关键交通指标', 'Key Traffic Metrics')" :border="8">
          <TrafficKpiFlops />
        </DataVPanel>
        <DataVPanel class="st-overview" :title="t('路网拥堵指数 TPI', 'Traffic Performance Index')" :border="8">
          <TrafficOverview />
        </DataVPanel>
      </div>
    </template>

    <!-- 主体:三段式工业大屏密铺(招牌主图跨多行多列) -->
    <div class="st-grid">
      <DataVPanel class="c-cong" :title="t('路网拥堵热力', 'Network Congestion Heat')" :accessible-title="t('路网拥堵热力图与OD轨迹飞线', 'Network congestion heat and OD trajectories')">
        <TrafficCongestionMap />
      </DataVPanel>
      <DataVPanel class="c-inter" :title="t('焦点路口渠化', 'Intersection Channelization')" :accessible-title="t('路口渠化俯视与信号相位倒计时', 'Intersection channelization and signal phase')">
        <IntersectionChannelization />
      </DataVPanel>
      <DataVPanel class="c-event" :title="t('交通事件日志', 'Traffic Event Log')" :accessible-title="t('交通事件滚动日志', 'Traffic event log')">
        <TrafficEventLog />
      </DataVPanel>
      <DataVPanel class="c-wave" :title="t('干线绿波时距', 'Arterial Green-Wave Time-Space')" :accessible-title="t('绿波带宽与抵达车速时距图', 'Green-wave bandwidth and arrival speed')">
        <GreenWaveTimeSpace />
      </DataVPanel>
      <DataVPanel class="c-flowspeed" :title="t('24h 流量与车速', '24h Flow & Speed')" :accessible-title="t('全天流量与车速双轴', '24h flow and speed dual axis')">
        <TrafficFlowSpeed />
      </DataVPanel>
      <DataVPanel class="c-queue" :title="t('路口排队长度', 'Intersection Queue')" :accessible-title="t('路口排队长度柱', 'Intersection queue length')">
        <IntersectionQueue />
      </DataVPanel>
      <DataVPanel class="c-satrank" :title="t('路口饱和度排行', 'Saturation Ranking')" :accessible-title="t('路口饱和度V/C排行', 'Intersection saturation V/C ranking')">
        <TrafficSaturationRank />
      </DataVPanel>
      <DataVPanel class="c-signal" :title="t('信号控制健康度', 'Signal Health')" :accessible-title="t('信号在线率与绿波覆盖率', 'Signal online rate and green-wave coverage')">
        <TrafficSignalOnline />
      </DataVPanel>
      <DataVPanel class="c-direct" :title="t('各方向流量', 'Directional Flow')" :accessible-title="t('各方向流量胶囊', 'Directional flow capsules')">
        <TrafficDirectionFlow />
      </DataVPanel>
      <DataVPanel class="c-spill" :title="t('关键路口排队溢出', 'Queue Spillback')" :accessible-title="t('关键路口溢出度', 'Critical intersection spillback')">
        <TrafficSpillback />
      </DataVPanel>
      <DataVPanel class="c-timeline" :title="t('实时 TPI 与车速趋势', 'Real-time TPI & Speed')" :accessible-title="t('实时TPI车速时序', 'Real-time TPI speed trend')">
        <TrafficTimeline />
      </DataVPanel>
    </div>
  </DashboardShell>
</template>

<style scoped>
/* 顶部:翻牌带(宽)+ TPI 概览(窄) */
.st-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
  margin-bottom: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .st-top {
    grid-template-columns: 3fr 1fr;
  }
}
.st-flops,
.st-overview {
  min-height: 172px;
}
.st-top :deep(.dvp-body) {
  min-height: 108px;
}

/* 主体三段式密铺:招牌拥堵热力/绿波时距跨 6 列 2 行 */
.st-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .st-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 200px;
    grid-template-areas:
      'cong cong cong cong cong cong inter inter inter event event event'
      'cong cong cong cong cong cong inter inter inter event event event'
      'wave wave wave wave wave wave flowspeed flowspeed flowspeed queue queue queue'
      'wave wave wave wave wave wave flowspeed flowspeed flowspeed satrank satrank satrank'
      'signal signal signal signal direct direct direct direct spill spill spill spill'
      'timeline timeline timeline timeline timeline timeline timeline timeline timeline timeline timeline timeline';
  }
  .c-cong { grid-area: cong; }
  .c-inter { grid-area: inter; }
  .c-event { grid-area: event; }
  .c-wave { grid-area: wave; }
  .c-flowspeed { grid-area: flowspeed; }
  .c-queue { grid-area: queue; }
  .c-satrank { grid-area: satrank; }
  .c-signal { grid-area: signal; }
  .c-direct { grid-area: direct; }
  .c-spill { grid-area: spill; }
  .c-timeline { grid-area: timeline; }
}
.st-grid :deep(.dvp-body) {
  min-height: 0;
}
.st-grid :deep(.dvp-body) > * {
  height: 100%;
}
</style>
