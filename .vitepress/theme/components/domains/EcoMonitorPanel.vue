<script setup lang="ts">
/**
 * 智慧环保 DataV 科技大屏(阶段 3b,复用智慧工厂/水务范式)。
 * 顶部:AQI/PM2.5/水质WQI/CEMS达标率/在线率/优良天 数字翻牌 + 生态健康指数概览。
 * 中部:三段式密铺 ——
 *   招牌①大气网格 GIS 监测(SVG:城市底图+三类站分层+风场流线粒子+超标涟漪)
 *   招牌②污染玫瑰(极坐标 16 方向×浓度 + 西北风向指示)
 *   招牌③6 因子空气雷达(SO₂/NO₂/PM2.5/PM10/CO/O₃ 国标限值参考)
 *   + 辅图(CEMS 排放排行/水质断面 WQI 仪表) + DataV(超标告警/排污排行/在线优良天/断面达标)。
 * 底部:24h AQI 与 PM2.5 时序(全宽,等级带 + 良/轻度警戒线)。
 */
import DashboardShell from '../dashboard/DashboardShell.vue'
import DataVPanel from '../dashboard/DataVPanel.vue'
import EcoKpiFlops from '../dashboard/EcoKpiFlops.vue'
import EcoOverview from '../dashboard/EcoOverview.vue'
import EcoAirGridGis from '../dashboard/EcoAirGridGis.vue'
import EcoPollutionRose from '../dashboard/EcoPollutionRose.vue'
import EcoAirRadar from '../dashboard/EcoAirRadar.vue'
import EcoCemsRank from '../dashboard/EcoCemsRank.vue'
import EcoAlertLog from '../dashboard/EcoAlertLog.vue'
import EcoPolluterRank from '../dashboard/EcoPolluterRank.vue'
import EcoWaterSection from '../dashboard/EcoWaterSection.vue'
import EcoStationOnline from '../dashboard/EcoStationOnline.vue'
import EcoAqiTrend from '../dashboard/EcoAqiTrend.vue'
import {useI18n} from '../../composables/useI18n'

const {t} = useI18n()
</script>

<template>
  <DashboardShell
    :title="t('智慧环保监测中心', 'Eco-Monitor Control Center')"
    :subtitle="t('大气网格化 · 污染源 CEMS · 水质断面作战室', 'Atmospheric grid · CEMS sources · water-section war room')"
  >
    <!-- 顶部:数字翻牌 KPI 带 + 生态健康概览 -->
    <template #kpi>
      <div class="eco-top">
        <DataVPanel class="eco-flops" :title="t('核心环境指标', 'Core Eco Metrics')" :border="8">
          <EcoKpiFlops />
        </DataVPanel>
        <DataVPanel class="eco-over" :title="t('生态健康指数', 'Eco Health Index')" :border="8">
          <EcoOverview />
        </DataVPanel>
      </div>
    </template>

    <!-- 主体:三段式工业大屏 -->
    <div class="eco-grid">
      <DataVPanel class="c-gis" :title="t('大气网格 GIS 监测', 'Atmospheric Grid GIS')" :accessible-title="t('城市大气网格监测站三类分层与风场流线', 'City air grid stations with wind streamlines')">
        <EcoAirGridGis />
      </DataVPanel>
      <DataVPanel class="c-rose" :title="t('污染玫瑰 16 方位', 'Pollution Rose')" :accessible-title="t('16 风向污染浓度玫瑰图 含西北风向', '16-direction pollution rose with NW wind')">
        <EcoPollutionRose />
      </DataVPanel>
      <DataVPanel class="c-alert" :title="t('超标告警日志', 'Over-limit Alert Log')" :accessible-title="t('大气水质排放超标滚动告警', 'Air water emission over-limit alert log')">
        <EcoAlertLog />
      </DataVPanel>
      <DataVPanel class="c-radar" :title="t('6 因子空气雷达', '6-Factor Air Radar')" :accessible-title="t('6 因子空气质量雷达含国标限值参考', '6-factor air quality radar with national standard limits')">
        <EcoAirRadar />
      </DataVPanel>
      <DataVPanel class="c-cems" :title="t('CEMS 排放排行', 'CEMS Emission Rank')" :accessible-title="t('重点源 CEMS 排放浓度排行含许可红线', 'CEMS emission ranking with permit limit')">
        <EcoCemsRank />
      </DataVPanel>
      <DataVPanel class="c-poll" :title="t('排污企业排行', 'Top Polluters')" :accessible-title="t('排污企业排放负荷滚动排行', 'Polluter emission load ranking')">
        <EcoPolluterRank />
      </DataVPanel>
      <DataVPanel class="c-water" :title="t('水质断面 WQI', 'Water Section WQI')" :accessible-title="t('监测断面水质指数仪表 Ⅰ至劣Ⅴ 类', 'Section WQI gauges class I to worse-V')">
        <EcoWaterSection />
      </DataVPanel>
      <DataVPanel class="c-online" :title="t('在线率与断面达标', 'Online & Compliance')" :accessible-title="t('站点在线率优良天比例与断面达标率', 'Station online good-day ratio and section compliance')">
        <EcoStationOnline />
      </DataVPanel>
      <DataVPanel class="c-trend" :title="t('24h AQI 与 PM2.5', '24h AQI & PM2.5')" :accessible-title="t('24 小时 AQI 与 PM2.5 时序 含等级带', '24h AQI and PM2.5 with level bands')">
        <EcoAqiTrend />
      </DataVPanel>
    </div>
  </DashboardShell>
</template>

<style scoped>
/* 顶部:翻牌带(宽)+ 概览(窄) */
.eco-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
  margin-bottom: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .eco-top {
    grid-template-columns: 3fr 1fr;
  }
}
.eco-flops,
.eco-over {
  min-height: 172px;
}
.eco-top :deep(.dvp-body) {
  min-height: 108px;
}

/* 主体三段式密铺 */
.eco-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 1024px) {
  .eco-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 200px;
    grid-template-areas:
      'gis    gis    gis    gis    gis    rose   rose   rose   alert  alert  alert  alert'
      'gis    gis    gis    gis    gis    rose   rose   rose   alert  alert  alert  alert'
      'gis    gis    gis    gis    gis    rose   rose   rose   alert  alert  alert  alert'
      'radar  radar  radar  radar  cems   cems   cems   cems   poll   poll   poll   poll'
      'water  water  water  water  water  water  online online online online online online'
      'trend  trend  trend  trend  trend  trend  trend  trend  trend  trend  trend  trend';
  }
  .c-gis { grid-area: gis; }
  .c-rose { grid-area: rose; }
  .c-alert { grid-area: alert; }
  .c-radar { grid-area: radar; }
  .c-cems { grid-area: cems; }
  .c-poll { grid-area: poll; }
  .c-water { grid-area: water; }
  .c-online { grid-area: online; }
  .c-trend { grid-area: trend; }
}
.eco-grid :deep(.dvp-body) {
  min-height: 0;
}
.eco-grid :deep(.dvp-body) > * {
  height: 100%;
}
</style>
