<script setup lang="ts">
import DashboardShell from '../dashboard/DashboardShell.vue'
import DataVPanel from '../dashboard/DataVPanel.vue'
import EvKpiFlops from '../dashboard/EvKpiFlops.vue'
import EvQualityPonds from '../dashboard/EvQualityPonds.vue'
import EvStationMap from '../dashboard/EvStationMap.vue'
import EvTransformerGauge from '../dashboard/EvTransformerGauge.vue'
import EvAlarmLog from '../dashboard/EvAlarmLog.vue'
import EvEnergySankey from '../dashboard/EvEnergySankey.vue'
import EvSessionHeatmap from '../dashboard/EvSessionHeatmap.vue'
import EvUtilizationRank from '../dashboard/EvUtilizationRank.vue'
import EvStorageSoc from '../dashboard/EvStorageSoc.vue'
import EvStationPowerCapsule from '../dashboard/EvStationPowerCapsule.vue'
import EvPowerTrend from '../dashboard/EvPowerTrend.vue'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
</script>

<template>
  <DashboardShell
    :title="t('城市新能源充电管控中心', 'City EV Charging Control Center')"
    :subtitle="t('光储充一体 · 有序充电 OBMS · 台区热模型', 'PV-Storage-Charging · Smart Charging · Thermal Model')"
  >
    <!-- 顶部:数字翻牌 KPI 带 + 充电质量达成率 -->
    <template #kpi>
      <div class="ev-top">
        <DataVPanel class="ev-flops" :title="t('核心运行指标', 'Key Metrics')" :border="8">
          <EvKpiFlops />
        </DataVPanel>
        <DataVPanel class="ev-qual" :title="t('充电质量与履约', 'Quality & Fulfillment')" :border="8">
          <EvQualityPonds />
        </DataVPanel>
      </div>
    </template>

    <!-- 主体:三段式工业大屏 -->
    <div class="ev-grid">
      <DataVPanel class="c-station" :title="t('全城充电桩 LBS 态势', 'Charger LBS Situational')" :accessible-title="t('全城充电桩地理位置与四态分布图', 'Citywide charger geo & four-state map')">
        <EvStationMap />
      </DataVPanel>
      <DataVPanel class="c-txg" :title="t('台区配变负载 · 热模型', 'Transformer · Thermal')" :accessible-title="t('台区配电变压器负载率与顶层油温热模型', 'Transformer load & top-oil thermal model')">
        <EvTransformerGauge />
      </DataVPanel>
      <DataVPanel class="c-alog" :title="t('告警事件日志', 'Alarm Log')" :accessible-title="t('充电网络告警事件滚动日志', 'EV charging alarm log')">
        <EvAlarmLog />
      </DataVPanel>
      <DataVPanel class="c-sankey" :title="t('光储充能量流', 'Energy Flow')" :accessible-title="t('光伏储能电网至充电负荷能量流桑基图', 'PV-storage-grid to charging load sankey')">
        <EvEnergySankey />
      </DataVPanel>
      <DataVPanel class="c-heat" :title="t('充电会话功率热力', 'Session Heatmap')" :accessible-title="t('充电枪会话功率密度热力图与占位识别', 'Charging-gun session power heatmap & stall detection')">
        <EvSessionHeatmap />
      </DataVPanel>
      <DataVPanel class="c-urank" :title="t('站点利用率排行', 'Utilization Rank')" :accessible-title="t('各充电站点桩位利用率滚动排行', 'Station utilization ranking')">
        <EvUtilizationRank />
      </DataVPanel>
      <DataVPanel class="c-soc" :title="t('配套储能 SOC', 'Station BESS SOC')" :accessible-title="t('充电站配套储能电池 SOC 液位', 'Station battery SOC levels')">
        <EvStorageSoc />
      </DataVPanel>
      <DataVPanel class="c-cap" :title="t('站点实时功率', 'Station Power')" :accessible-title="t('各充电站点实时充电功率胶囊图', 'Station real-time charging power')">
        <EvStationPowerCapsule />
      </DataVPanel>
      <DataVPanel class="c-trend" :title="t('24h 充电功率 · 分时电价', '24h Power · TOU Tariff')" :accessible-title="t('24 小时充电功率与分时电价阶梯', '24h charging power & TOU tariff ladder')">
        <EvPowerTrend />
      </DataVPanel>
    </div>
  </DashboardShell>
</template>

<style scoped>
/* 顶部:翻牌带(宽)+ 质量达成率(窄) */
.ev-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
  margin-bottom: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .ev-top {
    grid-template-columns: 3fr 1fr;
  }
}
.ev-flops,
.ev-qual {
  min-height: 172px;
}
.ev-top :deep(.dvp-body) {
  min-height: 108px;
}

/* 主体三段式密铺 */
.ev-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .ev-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 200px;
    grid-template-areas:
      'station station station station station txg    txg    txg    alog   alog   alog   alog'
      'station station station station station txg    txg    txg    alog   alog   alog   alog'
      'sankey  sankey  sankey  sankey  sankey  heat   heat   heat   heat   urank  urank  urank'
      'sankey  sankey  sankey  sankey  sankey  heat   heat   heat   heat   urank  urank  urank'
      'soc     soc     soc     soc     cap     cap    cap    cap    cap    cap    cap    cap'
      'trend   trend   trend   trend   trend   trend  trend  trend  trend  trend  trend  trend';
  }
  .c-station { grid-area: station; }
  .c-txg { grid-area: txg; }
  .c-alog { grid-area: alog; }
  .c-sankey { grid-area: sankey; }
  .c-heat { grid-area: heat; }
  .c-urank { grid-area: urank; }
  .c-soc { grid-area: soc; }
  .c-cap { grid-area: cap; }
  .c-trend { grid-area: trend; }
}
.ev-grid :deep(.dvp-body) {
  min-height: 0;
}
.ev-grid :deep(.dvp-body) > * {
  height: 100%;
}
</style>
