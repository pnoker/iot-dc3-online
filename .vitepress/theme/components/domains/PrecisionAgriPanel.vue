<script setup lang="ts">
import DashboardShell from '../dashboard/DashboardShell.vue'
import DataVPanel from '../dashboard/DataVPanel.vue'
import AgriKpiFlops from '../dashboard/AgriKpiFlops.vue'
import CropStressGauge from '../dashboard/CropStressGauge.vue'
import GreenhouseProfileHeatmap from '../dashboard/GreenhouseProfileHeatmap.vue'
import SoilMoistureProfile from '../dashboard/SoilMoistureProfile.vue'
import IrrigationEventLog from '../dashboard/IrrigationEventLog.vue'
import OutdoorWeatherRadar from '../dashboard/OutdoorWeatherRadar.vue'
import GreenhouseClimateTrend from '../dashboard/GreenhouseClimateTrend.vue'
import GreenhouseStressCapsule from '../dashboard/GreenhouseStressCapsule.vue'
import FluidTankLevels from '../dashboard/FluidTankLevels.vue'
import AgriPercentPonds from '../dashboard/AgriPercentPonds.vue'
import ValveStatusGrid from '../dashboard/ValveStatusGrid.vue'
import IrrigationScheduleGantt from '../dashboard/IrrigationScheduleGantt.vue'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
</script>

<template>
  <DashboardShell
    :title="t('精准农业智能大棚监控中心', 'Precision Agriculture Greenhouse Control Center')"
    :subtitle="t('温光水气肥耦合的设施农业作战室', 'Coupled climate-water-fertigation war room for protected agriculture')"
  >
    <!-- 顶部:数字翻牌 KPI 带 + 作物胁迫指数概览 -->
    <template #kpi>
      <div class="pa-top">
        <DataVPanel class="pa-flops" :title="t('大棚核心指标', 'Greenhouse Core Metrics')" :border="8">
          <AgriKpiFlops />
        </DataVPanel>
        <DataVPanel class="pa-gauge" :title="t('作物胁迫指数', 'Crop Stress Index')" :border="8">
          <CropStressGauge />
        </DataVPanel>
      </div>
    </template>

    <!-- 主体:三段式工业大屏 -->
    <div class="pa-grid">
      <DataVPanel class="c-profile" :title="t('大棚剖面分层热力', 'Greenhouse Profile Heatmap')" :accessible-title="t('大棚剖面分层热力图(温湿CO₂光梯度)', 'Greenhouse vertical profile heatmap')">
        <GreenhouseProfileHeatmap />
      </DataVPanel>
      <DataVPanel class="c-soil" :title="t('土壤墒情多深度下渗', 'Soil Moisture Infiltration')" :accessible-title="t('土壤墒情多深度下渗热力图', 'Soil moisture infiltration heatmap')">
        <SoilMoistureProfile />
      </DataVPanel>
      <DataVPanel class="c-log" :title="t('灌溉与告警事件', 'Irrigation & Alarm Log')" :accessible-title="t('灌溉告警事件滚动日志', 'Irrigation alarm event log')">
        <IrrigationEventLog />
      </DataVPanel>
      <DataVPanel class="c-radar" :title="t('棚外气象', 'Outdoor Weather')" :accessible-title="t('棚外气象六维雷达', 'Outdoor weather radar')">
        <OutdoorWeatherRadar />
      </DataVPanel>
      <DataVPanel class="c-trend" :title="t('CO₂ 与温度趋势', 'CO₂ & Temp Trend')" :accessible-title="t('棚内CO₂温度时序', 'Greenhouse CO2 temp trend')">
        <GreenhouseClimateTrend />
      </DataVPanel>
      <DataVPanel class="c-capsule" :title="t('各棚胁迫指数', 'Per-greenhouse Stress')" :accessible-title="t('各棚胁迫指数胶囊图', 'Per-greenhouse stress capsule')">
        <GreenhouseStressCapsule />
      </DataVPanel>
      <DataVPanel class="c-tank" :title="t('水肥罐与储水', 'Fertig. & Storage')" :accessible-title="t('水肥罐储水罐水位', 'Fertigation tank levels')">
        <FluidTankLevels />
      </DataVPanel>
      <DataVPanel class="c-pond" :title="t('灌溉系统达成率', 'Irrig. Achievement')" :accessible-title="t('灌溉系统在线率与达成率', 'Irrigation achievement rates')">
        <AgriPercentPonds />
      </DataVPanel>
      <DataVPanel class="c-valve" :title="t('电磁阀状态矩阵', 'Solenoid Valve Matrix')" :accessible-title="t('灌溉电磁阀状态矩阵', 'Solenoid valve status matrix')">
        <ValveStatusGrid />
      </DataVPanel>
      <DataVPanel class="c-gantt" :title="t('灌溉调度甘特(含 ET₀ 需水线)', 'Irrigation Schedule (w/ ET₀ Demand)')" :accessible-title="t('灌溉调度甘特图与ET₀需水线', 'Irrigation schedule gantt with ET0 demand')">
        <IrrigationScheduleGantt />
      </DataVPanel>
    </div>
  </DashboardShell>
</template>

<style scoped>
/* 顶部:翻牌带(宽)+ 胁迫指数(窄) */
.pa-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
  margin-bottom: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .pa-top {
    grid-template-columns: 3fr 1fr;
  }
}
.pa-flops {
  min-height: 172px;
}
.pa-gauge {
  min-height: 172px;
}
.pa-top :deep(.dvp-body) {
  min-height: 108px;
}

/* 主体三段式密铺 */
.pa-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .pa-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 200px;
    grid-template-areas:
      'profile profile profile profile profile soil    soil    soil    soil    log     log     log'
      'profile profile profile profile profile soil    soil    soil    soil    log     log     log'
      'radar   radar   radar   trend   trend   trend   capsule capsule capsule tank    tank    tank'
      'pond    pond    pond    pond    valve   valve   valve   valve   valve   tank    tank    tank'
      'gantt   gantt   gantt   gantt   gantt   gantt   gantt   gantt   gantt   gantt   gantt   gantt';
  }
  .c-profile { grid-area: profile; }
  .c-soil { grid-area: soil; }
  .c-log { grid-area: log; }
  .c-radar { grid-area: radar; }
  .c-trend { grid-area: trend; }
  .c-capsule { grid-area: capsule; }
  .c-tank { grid-area: tank; }
  .c-pond { grid-area: pond; }
  .c-valve { grid-area: valve; }
  .c-gantt { grid-area: gantt; }
}
.pa-grid :deep(.dvp-body) {
  min-height: 0;
}
.pa-grid :deep(.dvp-body) > * {
  height: 100%;
}
</style>
