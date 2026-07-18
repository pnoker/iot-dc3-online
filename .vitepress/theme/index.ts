import type {Theme} from 'vitepress'
import {h} from 'vue'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import GlobalCursor from './GlobalCursor.vue'
import HeroLogo from './HeroLogo.vue'
import HeroActionCards from './HeroActionCards.vue'
import HeroParticles from './HeroParticles.vue'
import HeroWaves from './HeroWaves.vue'
import CardNav from './CardNav.vue'
import SponsorRail from './SponsorRail.vue'

const theme: Theme = {
  extends: DefaultTheme,

  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => [h(HeroWaves), h(HeroParticles)],
      'home-hero-image': () => h(HeroLogo),
      'home-hero-actions-after': () => h(HeroActionCards),
      'home-hero-after': () => h(SponsorRail),
      'home-features-after': () => h(CardNav),
      'layout-bottom': () => h(GlobalCursor),
    })
  },

  enhanceApp({app}) {
    app.component('CardNav', CardNav)
  }
}

export default theme
