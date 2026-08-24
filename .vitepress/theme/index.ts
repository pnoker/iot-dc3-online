import {useData, type Theme} from 'vitepress'
import {defineAsyncComponent, h, type App} from 'vue'
import DefaultTheme from 'vitepress/theme'
import './style.css'

const lazy = (loader: () => Promise<any>) => defineAsyncComponent(loader)

// 站点壳只保留轻量入口。首页叙事、行业看板和 DataV 均在真正渲染时再下载。
const GlobalCursor = lazy(() => import('./GlobalCursor.vue'))
const HeroLogo = lazy(() => import('./HeroLogo.vue'))
const HeroActionCards = lazy(() => import('./HeroActionCards.vue'))
const HeroParticles = lazy(() => import('./HeroParticles.vue'))
const HeroWaves = lazy(() => import('./HeroWaves.vue'))
const WeChatQr = lazy(() => import('./WeChatQr.vue'))

function registerLazyComponents(app: App) {
  app.component('CardNav', lazy(() => import('./CardNav.vue')))
  app.component('PropositionFormula', lazy(() => import('./components/home/PropositionFormula.vue')))
  app.component('PhysicalLoop', lazy(() => import('./components/home/PhysicalLoop.vue')))
  app.component('AgentCapabilities', lazy(() => import('./components/home/AgentCapabilities.vue')))
  app.component('ArchitecturePrinciples', lazy(() => import('./components/home/ArchitecturePrinciples.vue')))
  app.component('CapabilityGrid', lazy(() => import('./components/home/CapabilityGrid.vue')))
  app.component('PositioningTimeline', lazy(() => import('./components/home/PositioningTimeline.vue')))
  app.component('HomeCta', lazy(() => import('./components/home/HomeCta.vue')))
  app.component('VisionPage', lazy(() => import('./components/vision/VisionPage.vue')))

  app.component('DashboardGallery', lazy(() => import('./components/panels/DashboardGallery.vue')))
  app.component('SmartFactoryPanel', lazy(() => import('./components/domains/SmartFactoryPanel.vue')))
  app.component('WaterNetworkPanel', lazy(() => import('./components/domains/WaterNetworkPanel.vue')))
  app.component('MicrogridPanel', lazy(() => import('./components/domains/MicrogridPanel.vue')))
  app.component('PrecisionAgriPanel', lazy(() => import('./components/domains/PrecisionAgriPanel.vue')))
  app.component('SmartBuildingPanel', lazy(() => import('./components/domains/SmartBuildingPanel.vue')))
  app.component('SmartTrafficPanel', lazy(() => import('./components/domains/SmartTrafficPanel.vue')))
  app.component('OilGasPanel', lazy(() => import('./components/domains/OilGasPanel.vue')))
  app.component('SmartMinePanel', lazy(() => import('./components/domains/SmartMinePanel.vue')))
  app.component('ColdChainPanel', lazy(() => import('./components/domains/ColdChainPanel.vue')))
  app.component('EcoMonitorPanel', lazy(() => import('./components/domains/EcoMonitorPanel.vue')))
  app.component('SmartPortPanel', lazy(() => import('./components/domains/SmartPortPanel.vue')))
  app.component('EvChargingPanel', lazy(() => import('./components/domains/EvChargingPanel.vue')))

  const dataV = () => import('@kjgl77/datav-vue3')
  app.component('DvBorderBox8', lazy(() => dataV().then((module) => module.BorderBox8)))
  app.component('DvBorderBox13', lazy(() => dataV().then((module) => module.BorderBox13)))
  app.component('DvCapsuleChart', lazy(() => dataV().then((module) => module.CapsuleChart)))
  app.component('DvDigitalFlop', lazy(() => dataV().then((module) => module.DigitalFlop)))
  app.component('DvPercentPond', lazy(() => dataV().then((module) => module.PercentPond)))
  app.component('DvScrollBoard', lazy(() => dataV().then((module) => module.ScrollBoard)))
  app.component('DvScrollRankingBoard', lazy(() => dataV().then((module) => module.ScrollRankingBoard)))
  app.component('DvWaterLevelPond', lazy(() => dataV().then((module) => module.WaterLevelPond)))
}

const theme: Theme = {
  extends: DefaultTheme,

  Layout() {
    const {page} = useData()
    const visionLayout = ['zh/index.md', 'en/index.md'].includes(page.value.relativePath)

    return h(DefaultTheme.Layout, {class: {'dc3-vision-layout': visionLayout}}, {
      'home-hero-before': () => [h(HeroWaves), h(HeroParticles)],
      'home-hero-image': () => h(HeroLogo),
      'home-hero-actions-after': () => h(HeroActionCards),
      'nav-bar-content-after': () => h(WeChatQr),
      'layout-bottom': () => h(GlobalCursor),
    })
  },

  enhanceApp({app}) {
    registerLazyComponents(app)
  }
}

export default theme
