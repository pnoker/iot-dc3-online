<script setup lang="ts">
import DashboardShell from '../dashboard/DashboardShell.vue'
import DataVPanel from '../dashboard/DataVPanel.vue'
import MineKpiFlops from '../dashboard/MineKpiFlops.vue'
import MineOverview from '../dashboard/MineOverview.vue'
import MineTunnelProfile from '../dashboard/MineTunnelProfile.vue'
import MineVentilationTopology from '../dashboard/MineVentilationTopology.vue'
import MineGasTrend from '../dashboard/MineGasTrend.vue'
import MineEquipmentMatrix from '../dashboard/MineEquipmentMatrix.vue'
import MineMainFanGauge from '../dashboard/MineMainFanGauge.vue'
import MineTunnelingRate from '../dashboard/MineTunnelingRate.vue'
import MinePersonnelDist from '../dashboard/MinePersonnelDist.vue'
import MineEventLog from '../dashboard/MineEventLog.vue'
import MineOutputRank from '../dashboard/MineOutputRank.vue'
import MineSumpLevel from '../dashboard/MineSumpLevel.vue'
import MineVentilationPercent from '../dashboard/MineVentilationPercent.vue'
import MineTimeline from '../dashboard/MineTimeline.vue'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
</script>

<template>
  <DashboardShell
    :title="t('智慧矿山安全监控中心', 'Smart Mine Safety Control Center')"
    :subtitle="t('通防监控 + 人员定位 + 综采掘进一体化作战室', 'Ventilation-gas-personnel integrated war room')"
  >
    <!-- 顶部:数字翻牌 KPI 带 + 瓦斯安全态势 -->
    <template #kpi>
      <div class="sm-top">
        <DataVPanel class="sm-flops" :title="t('关键生产安全指标', 'Key Production & Safety Metrics')" :border="8">
          <MineKpiFlops />
        </DataVPanel>
        <DataVPanel class="sm-overview" :title="t('瓦斯安全态势', 'Gas Safety Posture')" :border="8">
          <MineOverview />
        </DataVPanel>
      </div>
    </template>

    <!-- 主体:三段式工业大屏密铺(招牌主图跨多行多列) -->
    <div class="sm-grid">
      <DataVPanel class="m-tunnel" :title="t('矿井巷道剖面与人员定位', 'Tunnel Profile & Personnel Location')" :accessible-title="t('巷道平面剖面 UWB 人员散点与禁入区', 'Tunnel plan, UWB personnel and forbidden zones')">
        <MineTunnelProfile />
      </DataVPanel>
      <DataVPanel class="m-vent" :title="t('通风网络拓扑', 'Ventilation Network Topology')" :accessible-title="t('有向风路与风门短路漏风', 'Directed airflow and door short-circuit')">
        <MineVentilationTopology />
      </DataVPanel>
      <DataVPanel class="m-event" :title="t('安全事件日志', 'Safety Event Log')" :accessible-title="t('瓦斯超限断电人员禁入事件', 'Gas over-limit, power-cut, intrusion events')">
        <MineEventLog />
      </DataVPanel>
      <DataVPanel class="m-gas" :title="t('瓦斯浓度多测点时序', 'Multi-point Gas Trend')" :accessible-title="t('三测点瓦斯体积比与法定阈值', 'Gas %vol at 3 sensors with legal thresholds')">
        <MineGasTrend />
      </DataVPanel>
      <DataVPanel class="m-equip" :title="t('综采设备矩阵', 'Longwall Equipment Matrix')" :accessible-title="t('三机一架负载健康热力', 'Shearer-AFC-support load heatmap')">
        <MineEquipmentMatrix />
      </DataVPanel>
      <DataVPanel class="m-output" :title="t('采区产量排行', 'Panel Output Ranking')" :accessible-title="t('各采区当班产量排行', 'Mining panel shift output ranking')">
        <MineOutputRank />
      </DataVPanel>
      <DataVPanel class="m-fan" :title="t('主扇工况', 'Main Fan Condition')" :accessible-title="t('主扇风量负压温度振动', 'Main fan flow, pressure, temp, vibration')">
        <MineMainFanGauge />
      </DataVPanel>
      <DataVPanel class="m-person" :title="t('井下人员分布', 'Personnel Distribution')" :accessible-title="t('各区域井下人员胶囊', 'Personnel by area capsules')">
        <MinePersonnelDist />
      </DataVPanel>
      <DataVPanel class="m-sump" :title="t('水仓水位', 'Sump Water Level')" :accessible-title="t('主副水仓沉淀池水位', 'Main/aux sump and settling pond levels')">
        <MineSumpLevel />
      </DataVPanel>
      <DataVPanel class="m-pct" :title="t('通防系统达成率', 'Ventilation Compliance')" :accessible-title="t('通风合格率与传感器在线率', 'Ventilation compliance and sensor online rates')">
        <MineVentilationPercent />
      </DataVPanel>
      <DataVPanel class="m-tunneling" :title="t('掘进进尺', 'Tunneling Advance')" :accessible-title="t('近十四日掘进进尺与目标', 'Daily advance vs target')">
        <MineTunnelingRate />
      </DataVPanel>
      <DataVPanel class="m-timeline" :title="t('实时瓦斯与主扇风量', 'Real-time Gas & Fan Flow')" :accessible-title="t('实时瓦斯风量双轴时序', 'Real-time gas and fan flow dual axis')">
        <MineTimeline />
      </DataVPanel>
    </div>
  </DashboardShell>
</template>

<style scoped>
/* 顶部:翻牌带(宽)+ 瓦斯态势(窄) */
.sm-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
  margin-bottom: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .sm-top {
    grid-template-columns: 3fr 1fr;
  }
}
.sm-flops,
.sm-overview {
  min-height: 172px;
}
.sm-top :deep(.dvp-body) {
  min-height: 108px;
}

/* 主体三段式密铺:招牌巷道剖面/瓦斯时序跨 6 列 2 行 */
.sm-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .sm-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 200px;
    grid-template-areas:
      'tunnel tunnel tunnel tunnel tunnel tunnel vent  vent  vent  event event event'
      'tunnel tunnel tunnel tunnel tunnel tunnel vent  vent  vent  event event event'
      'gas    gas    gas    gas    gas    gas    equip equip equip output output output'
      'gas    gas    gas    gas    gas    gas    equip equip equip output output output'
      'fan    fan    fan    person person person sump  sump  pct    pct    tunneling tunneling'
      'timeline timeline timeline timeline timeline timeline timeline timeline timeline timeline timeline timeline';
  }
  .m-tunnel { grid-area: tunnel; }
  .m-vent { grid-area: vent; }
  .m-event { grid-area: event; }
  .m-gas { grid-area: gas; }
  .m-equip { grid-area: equip; }
  .m-output { grid-area: output; }
  .m-fan { grid-area: fan; }
  .m-person { grid-area: person; }
  .m-sump { grid-area: sump; }
  .m-pct { grid-area: pct; }
  .m-tunneling { grid-area: tunneling; }
  .m-timeline { grid-area: timeline; }
}
.sm-grid :deep(.dvp-body) {
  min-height: 0;
}
.sm-grid :deep(.dvp-body) > * {
  height: 100%;
}
</style>
