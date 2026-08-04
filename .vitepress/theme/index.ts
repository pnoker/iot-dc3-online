import type {Theme} from 'vitepress'
import {h} from 'vue'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import './dashboard.css'
import GlobalCursor from './GlobalCursor.vue'
import DashboardGallery from './components/panels/DashboardGallery.vue'
import PlaceholderPanel from './components/dashboard/PlaceholderPanel.vue'
import SmartFactoryPanel from './components/domains/SmartFactoryPanel.vue'
import WaterNetworkPanel from './components/domains/WaterNetworkPanel.vue'
import MicrogridPanel from './components/domains/MicrogridPanel.vue'
import PrecisionAgriPanel from './components/domains/PrecisionAgriPanel.vue'
import SmartBuildingPanel from './components/domains/SmartBuildingPanel.vue'
import SmartTrafficPanel from './components/domains/SmartTrafficPanel.vue'
import OilGasPanel from './components/domains/OilGasPanel.vue'
import SmartMinePanel from './components/domains/SmartMinePanel.vue'
import ColdChainPanel from './components/domains/ColdChainPanel.vue'
import EcoMonitorPanel from './components/domains/EcoMonitorPanel.vue'
import SmartPortPanel from './components/domains/SmartPortPanel.vue'
import EvChargingPanel from './components/domains/EvChargingPanel.vue'
import DataVPanel from './components/dashboard/DataVPanel.vue'
import FactoryKpiFlops from './components/dashboard/FactoryKpiFlops.vue'
import FactoryOeeRing from './components/dashboard/FactoryOeeRing.vue'
import FactoryEventLog from './components/dashboard/FactoryEventLog.vue'
import FactoryOutputRank from './components/dashboard/FactoryOutputRank.vue'
import FactoryTankLevels from './components/dashboard/FactoryTankLevels.vue'
import FactoryCompletionBars from './components/dashboard/FactoryCompletionBars.vue'
import HeroLogo from './HeroLogo.vue'
import HeroActionCards from './HeroActionCards.vue'
import HeroParticles from './HeroParticles.vue'
import HeroWaves from './HeroWaves.vue'
import CardNav from './CardNav.vue'

const theme: Theme = {
  extends: DefaultTheme,

  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => [h(HeroWaves), h(HeroParticles)],
      'home-hero-image': () => h(HeroLogo),
      'home-hero-actions-after': () => h(HeroActionCards),
      'home-features-after': () => h(CardNav),
      'layout-bottom': () => h(GlobalCursor),
    })
  },

  async enhanceApp({app}) {
    app.component('CardNav', CardNav)
    app.component('DashboardGallery', DashboardGallery)
    app.component('PlaceholderPanel', PlaceholderPanel)
    app.component('SmartFactoryPanel', SmartFactoryPanel)
    app.component('DataVPanel', DataVPanel)
    app.component('FactoryKpiFlops', FactoryKpiFlops)
    app.component('FactoryOeeRing', FactoryOeeRing)
    app.component('FactoryEventLog', FactoryEventLog)
    app.component('FactoryOutputRank', FactoryOutputRank)
    app.component('FactoryTankLevels', FactoryTankLevels)
    app.component('FactoryCompletionBars', FactoryCompletionBars)
    app.component('WaterNetworkPanel', WaterNetworkPanel)
    app.component('MicrogridPanel', MicrogridPanel)
    app.component('PrecisionAgriPanel', PrecisionAgriPanel)
    app.component('SmartBuildingPanel', SmartBuildingPanel)
    app.component('SmartTrafficPanel', SmartTrafficPanel)
    app.component('OilGasPanel', OilGasPanel)
    app.component('SmartMinePanel', SmartMinePanel)
    app.component('ColdChainPanel', ColdChainPanel)
    app.component('EcoMonitorPanel', EcoMonitorPanel)
    app.component('SmartPortPanel', SmartPortPanel)
    app.component('EvChargingPanel', EvChargingPanel)
    // DataV Vue3(阿里 DataV):仅客户端注册,避免 SSR 期访问 DOM 崩溃
    if (!import.meta.env.SSR) {
      const DataVVue3 = (await import('@kjgl77/datav-vue3')).default
      app.use(DataVVue3)
    }
  }
}

export default theme
