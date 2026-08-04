<script setup lang="ts">
import {provide, ref, computed, onMounted, onBeforeUnmount} from 'vue'
import {useData, useRouter} from 'vitepress'
import {useI18n} from '../../composables/useI18n'

defineProps<{title: string; subtitle?: string}>()

const {en, t} = useI18n()
const {page} = useData()
const router = useRouter()
const backTo = computed(() => (en.value ? '/en/demo/' : '/zh/demo/'))
function goBack() {
  router.go(backTo.value)
}

// 中英切换:手写 relativePath 语言前缀互换(cleanUrls 去 .md 不加 .html),zh/demo/xxx ↔ en/demo/xxx
const otherLink = computed(() => {
  const rel = page.value.relativePath // e.g. zh/demo/smart-factory.md
  const swapped = rel.startsWith('en/') ? rel.replace(/^en\//, 'zh/') : rel.replace(/^zh\//, 'en/')
  return '/' + swapped.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
})
function switchLang() {
  router.go(otherLink.value)
}

// 保留 dc3d-paused provide(恒 false),子组件 inject 不报错;不再提供暂停按钮
provide('dc3d-paused', ref(false))

// 实时时钟(SSR 安全)
const time = ref('')
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  const upd = () => {
    time.value = new Date().toLocaleString(en.value ? 'en-US' : 'zh-CN', {hour12: false})
  }
  upd()
  timer = setInterval(upd, 1000)
})
onBeforeUnmount(() => timer && clearInterval(timer))
</script>

<template>
  <div class="dc3d-stage">
    <header class="dc3d-hero">
      <div class="dc3d-hero-deco" />
      <div class="dc3d-hero-center">
        <h1 class="dc3d-hero-title">{{ title }}</h1>
        <p v-if="subtitle" class="dc3d-hero-sub">{{ subtitle }}</p>
      </div>
      <div class="dc3d-hero-deco" />
      <div class="dc3d-hero-meta">
        <span class="dc3d-hero-time">{{ time }}</span>
        <span class="dc3d-hero-live"><i />{{ t('数据在线', 'LIVE') }}</span>
      </div>
    </header>

    <div class="dc3d-toolbar">
      <button class="dc3d-back" @click="goBack" aria-keyshortcuts="Alt+Left">
        ‹ {{ t('返回看板画廊', 'Back to gallery') }}
      </button>
      <button
        class="dc3d-back dc3d-lang"
        @click="switchLang"
        :title="t('切换语言', 'Switch language')"
      >
        🌐 {{ en ? '中文' : 'English' }}
      </button>
    </div>

    <slot name="kpi" />
    <main><slot /></main>
    <slot name="footer" />
  </div>
</template>
