import type {Theme} from 'vitepress'
import {h} from 'vue'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import HeroLogo from './HeroLogo.vue'
import HeroParticles from './HeroParticles.vue'
import HeroWaves from './HeroWaves.vue'
import CardNav from './CardNav.vue'

const theme: Theme = {
  extends: DefaultTheme,

  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => [h(HeroWaves), h(HeroParticles)],
      'home-hero-image': () => h(HeroLogo),
      'home-features-after': () => h(CardNav),
    })
  },

  enhanceApp({app}) {
    app.component('CardNav', CardNav)
  }
}

export default theme
