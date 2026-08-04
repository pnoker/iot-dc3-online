/**
 * ECharts 按需注册(集中注册,全 12 领域共享)。
 * 决策(见 docs/iiot-dashboards/architecture.md §3.1 / index.md §4.2):集中注册最简,
 * 代价是首次进入任意看板即下载含全部图型的共享 core chunk(gzip ≈350–450KB,size-limit 门禁)。
 */
import * as echarts from 'echarts/core'
import {
  LineChart,
  BarChart,
  PieChart,
  GaugeChart,
  GraphChart,
  HeatmapChart,
  MapChart,
  LinesChart,
  SankeyChart,
  ThemeRiverChart,
  PictorialBarChart,
  ScatterChart,
  RadarChart,
  EffectScatterChart,
  CustomChart,
} from 'echarts/charts'
import {
  TooltipComponent,
  GridComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  GeoComponent,
  GraphicComponent,
  DatasetComponent,
  MarkLineComponent,
  MarkPointComponent,
  AriaComponent,
  CalendarComponent,
  PolarComponent,
  MarkAreaComponent,
} from 'echarts/components'
import {SVGRenderer} from 'echarts/renderers'

echarts.use([
  LineChart, BarChart, PieChart, GaugeChart, GraphChart,
  HeatmapChart, MapChart, LinesChart, SankeyChart,
  ThemeRiverChart, PictorialBarChart, ScatterChart, RadarChart,
  EffectScatterChart, CustomChart,
  TooltipComponent, GridComponent, TitleComponent, LegendComponent,
  DataZoomComponent, VisualMapComponent, GeoComponent, GraphicComponent,
  DatasetComponent, MarkLineComponent, MarkPointComponent, AriaComponent,
  CalendarComponent, PolarComponent, MarkAreaComponent,
  SVGRenderer,
])

export {echarts}
export type ECharts = echarts.ECharts
