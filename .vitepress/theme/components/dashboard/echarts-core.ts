/**
 * ECharts 按需注册(集中注册,全 12 领域共享)。
 * 决策(见 docs/iiot-dashboards/architecture.md §3.1 / index.md §4.2):集中注册最简,
 * 代价是首次进入任意看板即下载共享 core chunk。
 * 注册表按全仓实际使用收紧(2026-10 审计):仅保留在用的 10 图型 + 8 组件,
 * pie/map/lines/themeRiver/effectScatter 与 dataZoom/dataset/markPoint 等全仓 0 引用,不注册;
 * 新图型入册前先确认 echarts-core 注册表,避免全站 chunk 静默膨胀。
 */
import * as echarts from 'echarts/core'
import {
  LineChart,
  BarChart,
  GaugeChart,
  GraphChart,
  HeatmapChart,
  SankeyChart,
  PictorialBarChart,
  ScatterChart,
  RadarChart,
  CustomChart,
} from 'echarts/charts'
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  VisualMapComponent,
  GraphicComponent,
  MarkLineComponent,
  MarkAreaComponent,
  PolarComponent,
} from 'echarts/components'
import {SVGRenderer} from 'echarts/renderers'

echarts.use([
  LineChart, BarChart, GaugeChart, GraphChart,
  HeatmapChart, SankeyChart, PictorialBarChart, ScatterChart,
  RadarChart, CustomChart,
  TooltipComponent, GridComponent, LegendComponent,
  VisualMapComponent, GraphicComponent,
  MarkLineComponent, MarkAreaComponent, PolarComponent,
  SVGRenderer,
])

export {echarts}
export type ECharts = echarts.ECharts
