<script setup lang="ts">
import DashboardShell from '../dashboard/DashboardShell.vue'
import DataVPanel from '../dashboard/DataVPanel.vue'
import BuildingKpiFlops from '../dashboard/BuildingKpiFlops.vue'
import BuildingCompliance from '../dashboard/BuildingCompliance.vue'
import BuildingFloorHeatmap from '../dashboard/BuildingFloorHeatmap.vue'
import BuildingEnergySankey from '../dashboard/BuildingEnergySankey.vue'
import BuildingPsychrometric from '../dashboard/BuildingPsychrometric.vue'
import BuildingOccupancyTimeline from '../dashboard/BuildingOccupancyTimeline.vue'
import BuildingChillerCop from '../dashboard/BuildingChillerCop.vue'
import BuildingFloorEnergy from '../dashboard/BuildingFloorEnergy.vue'
import BuildingEventLog from '../dashboard/BuildingEventLog.vue'
import BuildingWaterLevels from '../dashboard/BuildingWaterLevels.vue'
import BuildingComplianceBars from '../dashboard/BuildingComplianceBars.vue'
import BuildingPowerCurve from '../dashboard/BuildingPowerCurve.vue'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
</script>

<template>
  <DashboardShell
    :title="t('智慧楼宇监控中心', 'Smart Building Control Center')"
    :subtitle="t('BA 楼宇自驱 — 能耗·环境·安防一体化作战室', 'Building automation war room: energy, indoor environment & security')"
  >
    <!-- 顶部:数字翻牌 KPI 带 + IEQ 综合达标 -->
    <template #kpi>
      <div class="sb-top">
        <DataVPanel class="sb-flops" :title="t('楼宇关键指标', 'Key Building Metrics')" :border="8">
          <BuildingKpiFlops />
        </DataVPanel>
        <DataVPanel class="sb-ieq" :title="t('室内环境综合指数', 'IEQ Index')" :border="8">
          <BuildingCompliance />
        </DataVPanel>
      </div>
    </template>

    <!-- 主体:三段式工业大屏 -->
    <div class="sb-grid">
      <DataVPanel class="c-floor" :title="t('楼层×防火分区环境热力', 'Floor × Zone Environment')" :accessible-title="t('楼层温度热力图', 'Floor temperature heatmap')">
        <BuildingFloorHeatmap />
      </DataVPanel>
      <DataVPanel class="c-sankey" :title="t('分项能耗流向', 'Sub-metered Energy Flow')" :accessible-title="t('分项能耗桑基图', 'Energy sankey')">
        <BuildingEnergySankey />
      </DataVPanel>
      <DataVPanel class="c-occ" :title="t('空间占用时空热力', 'Occupancy Spacetime')" :accessible-title="t('楼层24小时占用热力图', 'Occupancy heatmap')">
        <BuildingOccupancyTimeline />
      </DataVPanel>
      <DataVPanel class="c-psych" :title="t('AHU 焓湿图', 'AHU Psychrometric')" :accessible-title="t('空调降温除湿焓湿图', 'Psychrometric chart')">
        <BuildingPsychrometric />
      </DataVPanel>
      <DataVPanel class="c-cop" :title="t('冷水机组 COP', 'Chiller COP')" :accessible-title="t('冷水机组运行能效', 'Chiller COP gauge')">
        <BuildingChillerCop />
      </DataVPanel>
      <DataVPanel class="c-fenergy" :title="t('各楼层能耗排行', 'Floor Energy Ranking')" :accessible-title="t('各楼层能耗排行榜', 'Floor energy ranking')">
        <BuildingFloorEnergy />
      </DataVPanel>
      <DataVPanel class="c-event" :title="t('安防运维事件', 'Security & Ops Events')" :accessible-title="t('楼宇安防运维事件日志', 'Building event log')">
        <BuildingEventLog />
      </DataVPanel>
      <DataVPanel class="c-water" :title="t('水系统液位', 'Water System Levels')" :accessible-title="t('水系统水箱液位', 'Water tank levels')">
        <BuildingWaterLevels />
      </DataVPanel>
      <DataVPanel class="c-compliance" :title="t('达标率与利用率', 'Compliance & Utilization')" :accessible-title="t('室温达标率与各楼层利用率', 'Compliance and utilization')">
        <BuildingComplianceBars />
      </DataVPanel>
      <DataVPanel class="c-power" :title="t('24h 功率与峰谷电价', '24h Load & TOU Tariff')" :accessible-title="t('24小时功率曲线峰谷电价', '24h power curve with TOU tariff')">
        <BuildingPowerCurve />
      </DataVPanel>
    </div>
  </DashboardShell>
</template>

<style scoped>
/* 顶部:翻牌带(宽)+ IEQ 综合指数(窄) */
.sb-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
  margin-bottom: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .sb-top {
    grid-template-columns: 3fr 1fr;
  }
}
.sb-flops,
.sb-ieq {
  min-height: 172px;
}
.sb-top :deep(.dvp-body) {
  min-height: 108px;
}

/* 主体三段式密铺 */
.sb-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .sb-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 188px;
    grid-template-areas:
      'floor  floor  floor  floor  floor  floor  sankey sankey sankey sankey sankey sankey'
      'floor  floor  floor  floor  floor  floor  sankey sankey sankey sankey sankey sankey'
      'occ    occ    occ    occ    occ    psych psych  psych  psych  cop    cop    cop'
      'occ    occ    occ    occ    occ    psych psych  psych  psych  cop    cop    cop'
      'fenergy fenergy fenergy event event event event water water compli compli compli'
      'fenergy fenergy fenergy event event event event water water compli compli compli'
      'power  power  power  power  power  power  power  power  power  power  power  power';
  }
  .c-floor { grid-area: floor; }
  .c-sankey { grid-area: sankey; }
  .c-occ { grid-area: occ; }
  .c-psych { grid-area: psych; }
  .c-cop { grid-area: cop; }
  .c-fenergy { grid-area: fenergy; }
  .c-event { grid-area: event; }
  .c-water { grid-area: water; }
  .c-compliance { grid-area: compli; }
  .c-power { grid-area: power; }
}
.sb-grid :deep(.dvp-body) {
  min-height: 0;
}
.sb-grid :deep(.dvp-body) > * {
  height: 100%;
}
</style>
