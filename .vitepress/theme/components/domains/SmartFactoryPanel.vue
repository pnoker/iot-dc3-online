<script setup lang="ts">
import DashboardShell from '../dashboard/DashboardShell.vue'
import DataVPanel from '../dashboard/DataVPanel.vue'
import FactoryKpiFlops from '../dashboard/FactoryKpiFlops.vue'
import FactoryOeeRing from '../dashboard/FactoryOeeRing.vue'
import FactoryStatusMatrix from '../dashboard/FactoryStatusMatrix.vue'
import FactoryProcessTopology from '../dashboard/FactoryProcessTopology.vue'
import FactoryTrendChart from '../dashboard/FactoryTrendChart.vue'
import FactoryRanking from '../dashboard/FactoryRanking.vue'
import FactoryOeeWaterfall from '../dashboard/FactoryOeeWaterfall.vue'
import FactoryEventLog from '../dashboard/FactoryEventLog.vue'
import FactoryOutputRank from '../dashboard/FactoryOutputRank.vue'
import FactoryTankLevels from '../dashboard/FactoryTankLevels.vue'
import FactoryCompletionBars from '../dashboard/FactoryCompletionBars.vue'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
</script>

<template>
  <DashboardShell
    :title="t('智慧工厂监控中心', 'Smart Factory Control Center')"
    :subtitle="t('实时 OEE 驱动的离散制造产线作战室', 'Real-time OEE war room for discrete manufacturing')"
  >
    <!-- 顶部:数字翻牌 KPI 带 + OEE 三因子环 -->
    <template #kpi>
      <div class="fx-top">
        <DataVPanel class="fx-flops" :title="t('关键生产指标', 'Key Production Metrics')" :border="8">
          <FactoryKpiFlops />
        </DataVPanel>
        <DataVPanel class="fx-ring" :title="t('OEE 综合效率', 'OEE')" :border="8">
          <FactoryOeeRing />
        </DataVPanel>
      </div>
    </template>

    <!-- 主体:三段式工业大屏 -->
    <div class="fx-grid">
      <DataVPanel class="c-matrix" :title="t('设备状态矩阵', 'Machine Status Matrix')" :accessible-title="t('设备状态矩阵热力图', 'Machine status matrix')">
        <FactoryStatusMatrix />
      </DataVPanel>
      <DataVPanel class="c-topo" :title="t('工艺流向拓扑', 'Process Flow')" :accessible-title="t('工艺流向拓扑', 'Process flow topology')">
        <FactoryProcessTopology />
      </DataVPanel>
      <DataVPanel class="c-log" :title="t('生产事件日志', 'Event Log')" :accessible-title="t('生产事件滚动日志', 'Event log')">
        <FactoryEventLog />
      </DataVPanel>
      <DataVPanel class="c-trend" :title="t('实时产量与良率', 'Throughput & Yield')" :accessible-title="t('产量良率时序', 'Throughput yield trend')">
        <FactoryTrendChart />
      </DataVPanel>
      <DataVPanel class="c-orank" :title="t('班组产量排行', 'Team Output Ranking')" :accessible-title="t('班组产量排行', 'Team output ranking')">
        <FactoryOutputRank />
      </DataVPanel>
      <DataVPanel class="c-rank" :title="t('工位 OEE 排行', 'Workstation OEE')" :accessible-title="t('工位 OEE 排行', 'Workstation OEE ranking')">
        <FactoryRanking />
      </DataVPanel>
      <DataVPanel class="c-tank" :title="t('储罐与仓位', 'Tanks & Storage')" :accessible-title="t('储罐仓位水位', 'Tank levels')">
        <FactoryTankLevels />
      </DataVPanel>
      <DataVPanel class="c-comp" :title="t('达成率与完成度', 'Achievement & Completion')" :accessible-title="t('达成率完成度', 'Achievement completion')">
        <FactoryCompletionBars />
      </DataVPanel>
      <DataVPanel class="c-water" :title="t('OEE 六大损失瀑布', 'OEE Six-Loss Waterfall')" :accessible-title="t('OEE 六大损失瀑布', 'OEE six-loss waterfall')">
        <FactoryOeeWaterfall />
      </DataVPanel>
    </div>
  </DashboardShell>
</template>

<style scoped>
/* 顶部:翻牌带(宽)+ OEE 环(窄) */
.fx-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
  margin-bottom: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .fx-top {
    grid-template-columns: 3fr 1fr;
  }
}
.fx-flops {
  min-height: 172px;
}
.fx-ring {
  min-height: 172px;
}
/* 顶部两块内容区给足高度,避免翻牌卡片顶到边框底 */
.fx-top :deep(.dvp-body) {
  min-height: 108px;
}

/* 主体三段式密铺 */
.fx-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .fx-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 200px;
    grid-template-areas:
      'matrix matrix matrix matrix matrix topo topo topo topo log log log'
      'matrix matrix matrix matrix matrix trend trend trend trend log log log'
      'orank orank orank rank rank rank rank tank tank comp comp comp'
      'orank orank orank rank rank rank rank tank tank comp comp comp'
      'water water water water water water water water water water water water';
  }
  .c-matrix { grid-area: matrix; }
  .c-topo { grid-area: topo; }
  .c-log { grid-area: log; }
  .c-trend { grid-area: trend; }
  .c-orank { grid-area: orank; }
  .c-rank { grid-area: rank; }
  .c-tank { grid-area: tank; }
  .c-comp { grid-area: comp; }
  .c-water { grid-area: water; }
}
/* 面板内容区撑满各自 grid 高度,子图表 100% 高不溢出 */
.fx-grid :deep(.dvp-body) {
  min-height: 0;
}
.fx-grid :deep(.dvp-body) > * {
  height: 100%;
}
</style>
