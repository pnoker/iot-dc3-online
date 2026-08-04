/**
 * 12 领域元数据(阶段 1 画廊 + 占位看板共用)。
 * 阶段 2 起,每个领域追加 XxxPanel.vue + mock/<id>.json;本 registry 是领域注册的唯一事实源。
 * demo:占位看板用来驱动一个"领域化实时数字",证明 useDomainSeries(五因子)按领域形态运行
 *  (光伏夜间 0、交通早晚双峰、矿山瓦斯偶发突涌…)。kind 由 PlaceholderPanel 映射为 FactorSpec。
 */
export type DemoKind = 'pv' | 'sin' | 'peak2' | 'occupancy' | 'evPeak' | 'steady' | 'gas'
export type VizType = 'matrix' | 'map' | 'topology' | 'profile' | 'gauge' | '3d'
export type Stage = '阶段 2' | '阶段 3a' | '阶段 3b'

export interface DomainMeta {
  id: string
  name_zh: string
  name_en: string
  tagline_zh: string
  tagline_en: string
  signature: string // 招牌可视化摘要(卡片中部)
  stage: Stage
  icon: string // 阶段 1 占位用 emoji,阶段 2 起换领域 SVG
  accent: string // 领域主题色(卡片封面 / hover 描边)
  vizType: VizType // 画廊筛选
  demo: {
    label_zh: string
    label_en: string
    baseline: number
    unit: string
    kind: DemoKind
    cycleAmp?: number
    noiseAmp?: number
  }
}

export const DOMAINS: DomainMeta[] = [
  {id: 'smart-factory', name_zh: '智慧工厂', name_en: 'Smart Factory',
    tagline_zh: '实时 OEE 驱动的离散制造产线作战室:设备状态、节拍与良率一屏尽览',
    tagline_en: 'Real-time OEE war room for discrete manufacturing',
    signature: '设备状态矩阵 + OEE 六大损失瀑布 + 工艺拓扑', stage: '阶段 2', icon: '🏭', accent: '#0a6cb2', vizType: 'matrix',
    demo: {label_zh: '设备综合效率 OEE', label_en: 'Overall Equipment Effectiveness (OEE)', baseline: 82, unit: '%', kind: 'steady', cycleAmp: 0.06, noiseAmp: 0.8}},
  {id: 'water-network', name_zh: '智慧水务', name_en: 'Water Network',
    tagline_zh: '从源头到龙头:全城供水管网的数字孪生与漏损洞察',
    tagline_en: 'From source to tap: a digital twin of the urban water network',
    signature: '管网 GIS 数字孪生 + DMA 四象限漏损 + 流量桑基', stage: '阶段 3a', icon: '🚰', accent: '#0891b2', vizType: 'map',
    demo: {label_zh: '供水压力合格率', label_en: 'Pressure Compliance Rate', baseline: 96, unit: '%', kind: 'peak2', noiseAmp: 0.3}},
  {id: 'microgrid', name_zh: '能源微电网', name_en: 'Microgrid',
    tagline_zh: '光伏储能协同,毫秒级洞悉每一度绿电的去向与碳足迹',
    tagline_en: 'PV-storage orchestrated: see where every green electron goes',
    signature: '电气单线拓扑潮流 + 储能 SOC + 功率平衡', stage: '阶段 3a', icon: '⚡', accent: '#ca8a04', vizType: 'topology',
    demo: {label_zh: '光伏实时出力', label_en: 'Live PV Active Power', baseline: 0, unit: 'kW', kind: 'pv', noiseAmp: 3}},
  {id: 'precision-agri', name_zh: '精准农业', name_en: 'Precision Agriculture',
    tagline_zh: '云端大棚,毫秒级感知每一寸墒情与微气候',
    tagline_en: 'Sense every clod and microclimate in real time',
    signature: '大棚剖面分层热力 + 墒情下渗 + 灌溉甘特', stage: '阶段 3a', icon: '🌱', accent: '#16a34a', vizType: 'gauge',
    demo: {label_zh: '土壤体积含水率', label_en: 'Soil VWC', baseline: 45, unit: '%', kind: 'sin', cycleAmp: 0.06, noiseAmp: 0.6}},
  {id: 'smart-building', name_zh: '智慧楼宇', name_en: 'Smart Building',
    tagline_zh: '楼宇会呼吸:暖通能耗安防占位一张图读懂建筑健康',
    tagline_en: 'A building that breathes: HVAC, energy, security & occupancy',
    signature: '楼层 3D 热力 + 分项能耗桑基 + 焓湿图', stage: '阶段 3a', icon: '🏢', accent: '#4f46e5', vizType: '3d',
    demo: {label_zh: '空间占用率', label_en: 'Space Occupancy', baseline: 42, unit: '%', kind: 'occupancy', noiseAmp: 1.5}},
  {id: 'smart-traffic', name_zh: '智慧交通', name_en: 'Smart Traffic',
    tagline_zh: '城市动脉实时脉动:路网拥堵热力 × 路口渠化 × 信号自适应',
    tagline_en: 'City pulse in real time: congestion heatmap & adaptive signals',
    signature: '路网拥堵热力 + 路口渠化 + 绿波时距', stage: '阶段 3a', icon: '🚦', accent: '#dc2626', vizType: 'map',
    demo: {label_zh: '拥堵指数 TPI', label_en: 'Traffic Performance Index', baseline: 4.2, unit: '', kind: 'peak2', noiseAmp: 0.15}},
  {id: 'oil-gas', name_zh: '油气管网', name_en: 'Oil & Gas',
    tagline_zh: '千里管线一览,毫帕压力可查——SCADA 实时守护每一段管存',
    tagline_en: 'A thousand kilometers of pipeline at a glance, every megapascal accountable',
    signature: '管线纵断面 + 储罐液位 + 管存调峰', stage: '阶段 3b', icon: '🛢️', accent: '#7c3aed', vizType: 'profile',
    demo: {label_zh: '管输压力', label_en: 'Line Pressure', baseline: 6.4, unit: 'MPa', kind: 'steady', cycleAmp: 0.01, noiseAmp: 0.03}},
  {id: 'smart-mine', name_zh: '智慧矿山', name_en: 'Smart Mine',
    tagline_zh: '井上下一张图:瓦斯、通风、人员、综采设备全感知,秒级预警保安全',
    tagline_en: 'One map above & below ground: gas, ventilation, personnel sensed in real time',
    signature: '巷道剖面 + 通风网络 + 三道瓦斯阈值', stage: '阶段 3b', icon: '⛏️', accent: '#a16207', vizType: '3d',
    demo: {label_zh: '瓦斯浓度 CH₄', label_en: 'Methane Concentration CH₄', baseline: 0.4, unit: '%vol', kind: 'gas', noiseAmp: 0.02}},
  {id: 'cold-chain', name_zh: '冷链物流', name_en: 'Cold Chain',
    tagline_zh: '从冷库到车门,每一度温差都在掌握——全程温湿度与轨迹可追溯',
    tagline_en: 'From warehouse to trailer door, every degree is in sight',
    signature: '运输轨迹温层 + 温层合规带 + 断链桑基', stage: '阶段 3b', icon: '❄️', accent: '#0e7490', vizType: 'map',
    demo: {label_zh: '温控合规率', label_en: 'Temperature Compliance Rate', baseline: 99.2, unit: '%', kind: 'steady', cycleAmp: 0.003, noiseAmp: 0.05}},
  {id: 'eco-monitor', name_zh: '智慧环保', name_en: 'Environmental Monitoring',
    tagline_zh: '一张图看清天、水、气:网格化感知全域污染,从超标预警到溯源问责',
    tagline_en: 'One map for air, water and emissions: grid sensing of pollution end-to-end',
    signature: '大气网格 + 污染玫瑰 + 六因子雷达', stage: '阶段 3b', icon: '🌫️', accent: '#15803d', vizType: 'map',
    demo: {label_zh: '空气质量指数 AQI', label_en: 'Air Quality Index', baseline: 65, unit: '', kind: 'peak2', noiseAmp: 3}},
  {id: 'smart-port', name_zh: '智慧港口', name_en: 'Smart Port',
    tagline_zh: '岸桥起落、堆场流转、泊位靠离——全港吞吐节拍一屏尽览',
    tagline_en: 'Quay cranes, yard flows, berth turns — the whole port cadence',
    signature: '港区俯视调度 + 堆场 3D + 泊位甘特', stage: '阶段 3b', icon: '⚓', accent: '#1d4ed8', vizType: '3d',
    demo: {label_zh: '岸桥作业效率', label_en: 'Crane Moves / Hour', baseline: 28, unit: 'moves/h', kind: 'steady', cycleAmp: 0.08, noiseAmp: 0.6}},
  {id: 'ev-charging', name_zh: '新能源充电', name_en: 'EV Charging',
    tagline_zh: '全城充电一张图:桩位分布、实时负荷与订单流转,光储充协同',
    tagline_en: 'Citywide EV Charging Atlas: stalls, live load and order flow',
    signature: '充电桩 LBS + 光储充桑基 + 单枪热力', stage: '阶段 3b', icon: '🔌', accent: '#059669', vizType: 'map',
    demo: {label_zh: '枪位利用率', label_en: 'Gun Utilization', baseline: 38, unit: '%', kind: 'evPeak', noiseAmp: 1.2}},
]

export function getDomain(id: string): DomainMeta | undefined {
  return DOMAINS.find((d) => d.id === id)
}
