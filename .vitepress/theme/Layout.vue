<template>
  <div class="shell" :class="{ light: isLight }">
    <HeroWaves />
    <HeroParticles />

    <div class="controls">
      <button class="ctrl-btn" :title="lang === 'zh' ? 'Switch to English' : '切换到中文'" @click="toggleLang">
        {{ lang === 'zh' ? 'EN' : '中文' }}
      </button>
      <button class="ctrl-btn" :title="isLight ? '切换暗色' : '切换亮色'" @click="toggleTheme">
        {{ isLight ? '🌙' : '☀️' }}
      </button>
    </div>

    <div class="page">
      <div class="brand">
        <div class="logo-stage">
          <HeroLogo />
        </div>
        <h1 class="title">
          IoT <span class="gradient">DC3</span>
        </h1>
        <p class="subtitle">{{ t('subtitle') }}</p>
      </div>

      <nav class="nav-grid">
        <a v-for="item in row1" :key="item.key" :href="item.url" target="_blank" rel="noopener" class="nav-card">
          <span class="card-icon">{{ item.icon }}</span>
          <span class="card-text">
            <span class="card-label">{{ t(item.key) }}</span>
            <span class="card-desc">{{ t(item.key + 'Desc') }}</span>
          </span>
          <span class="card-chevron">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </span>
        </a>
      </nav>

      <nav class="nav-grid row2">
        <a v-for="item in row2" :key="item.key" :href="item.url" target="_blank" rel="noopener" class="nav-card">
          <span class="card-icon">{{ item.icon }}</span>
          <span class="card-text">
            <span class="card-label">{{ t(item.key) }}</span>
            <span class="card-desc">pnoker/iot-dc3</span>
          </span>
          <span class="card-chevron">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </span>
        </a>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HeroWaves from './HeroWaves.vue'
import HeroParticles from './HeroParticles.vue'
import HeroLogo from './HeroLogo.vue'

const zh: Record<string, string> = {
  subtitle: '分布式工业物联网平台',
  docs: '文档',
  docsDesc: '快速开始 · 配置指南 · 驱动开发',
  book: '书籍',
  bookDesc: '架构设计 · 最佳实践 · 深入理解',
  demo: '演示',
  demoDesc: '在线体验 IoT DC3 平台功能',
  github: 'GitHub',
  githubDesc: 'pnoker/iot-dc3',
  gitee: 'Gitee',
  giteeDesc: 'pnoker/iot-dc3',
}
const en: Record<string, string> = {
  subtitle: 'Distributed Industrial IoT Platform',
  docs: 'Docs',
  docsDesc: 'Quick Start · Config · Drivers',
  book: 'Book',
  bookDesc: 'Architecture · Best Practices · Deep Dive',
  demo: 'Demo',
  demoDesc: 'Live IoT DC3 Platform',
  github: 'GitHub',
  githubDesc: 'pnoker/iot-dc3',
  gitee: 'Gitee',
  giteeDesc: 'pnoker/iot-dc3',
}

const lang = ref<'zh' | 'en'>('zh')
function t(key: string) { return lang.value === 'zh' ? (zh[key] || key) : (en[key] || key) }
function toggleLang() {
  lang.value = lang.value === 'zh' ? 'en' : 'zh'
  localStorage.setItem('dc3-lang', lang.value)
}

const isLight = ref(false)
function applyTheme(light: boolean) {
  isLight.value = light
  document.documentElement.classList.toggle('light', light)
  localStorage.setItem('dc3-theme', light ? 'light' : 'dark')
}
function toggleTheme() { applyTheme(!isLight.value) }

const row1 = [
  { key: 'docs', icon: '📖', url: 'https://docs.dc3.site' },
  { key: 'book', icon: '📚', url: 'https://book.dc3.site' },
  { key: 'demo', icon: '🎮', url: 'https://demo.dc3.site' },
]
const row2 = [
  { key: 'github', icon: '🐱', url: 'https://github.com/pnoker/iot-dc3' },
  { key: 'gitee', icon: '🔴', url: 'https://gitee.com/pnoker/iot-dc3' },
]

onMounted(() => {
  const saved = localStorage.getItem('dc3-lang')
  if (saved === 'en' || saved === 'zh') lang.value = saved
  const savedTheme = localStorage.getItem('dc3-theme')
  applyTheme(savedTheme === 'light')
})
</script>

<style scoped>
/* ── shell ── */
.shell {
  --bg: #0f1620;
  --text: #e8eef6;
  --text-dim: rgba(232,238,246,0.45);
  --card-bg: rgba(255,255,255,0.035);
  --card-border: rgba(200,216,234,0.08);
  --card-dim: rgba(255,255,255,0.35);
  --brand: #1296db;
  --brand-dim: rgba(18,150,219,0.07);
  --brand-hover: rgba(18,150,219,0.05);
  --brand-hover-border: rgba(18,150,219,0.28);
  --chevron: rgba(255,255,255,0.15);
  --ctrl-bg: rgba(255,255,255,0.06);
  --ctrl-text: rgba(255,255,255,0.5);

  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  transition: background 0.5s, color 0.5s;
}
.shell.light {
  --bg: #f5f7fa;
  --text: #1b2733;
  --text-dim: #6b7a89;
  --card-bg: rgba(255,255,255,0.7);
  --card-border: rgba(10,108,178,0.1);
  --card-dim: #8a98a8;
  --brand: #0a6cb2;
  --brand-dim: rgba(10,108,178,0.06);
  --brand-hover: rgba(10,108,178,0.04);
  --brand-hover-border: rgba(10,108,178,0.2);
  --chevron: rgba(10,108,178,0.2);
  --ctrl-bg: rgba(0,0,0,0.05);
  --ctrl-text: rgba(0,0,0,0.45);
}

/* ── controls ── */
.controls {
  position: fixed; top: 1rem; right: 1rem; z-index: 10;
  display: flex; gap: 0.4rem;
}
.ctrl-btn {
  padding: 0.35rem 0.65rem;
  border-radius: 7px;
  border: 1px solid var(--card-border);
  background: var(--ctrl-bg);
  color: var(--ctrl-text);
  font-size: 0.72rem; font-weight: 600; cursor: pointer;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  transition: all 0.25s; font-family: inherit; line-height: 1.4;
}
.ctrl-btn:hover { border-color: var(--brand); color: var(--brand); }

/* ── page ── */
.page {
  position: relative; z-index: 2;
  min-height: 100dvh;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  gap: 1.75rem;
}

/* ── brand ── */
.brand {
  display: flex; flex-direction: column; align-items: center;
  animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.logo-stage {
  width: 112px;
  aspect-ratio: 1;
  margin-bottom: 0.25rem;
}

.title {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--text);
}

.gradient {
  background: linear-gradient(120deg, #0a6cb2 30%, #16a6dd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin-top: 0.35rem;
  font-size: 0.88rem;
  color: var(--text-dim);
  font-weight: 400;
  letter-spacing: 0.04em;
}

/* ── cards ── */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  max-width: 680px;
  width: 100%;
  animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}
.nav-grid.row2 {
  grid-template-columns: repeat(2, 1fr);
  max-width: 456px;
  animation-delay: 0.16s;
  margin-top: -0.5rem;
}

.nav-card {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  text-decoration: none; color: var(--text);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  transition: all 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: relative; overflow: hidden;
}
.nav-card::after {
  content: ''; position: absolute; inset: 0; border-radius: 14px;
  opacity: 0; transition: opacity 0.35s;
  background: radial-gradient(400px circle at 50% 0%, var(--brand-dim), transparent 60%);
}
.nav-card:hover {
  border-color: var(--brand-hover-border);
  transform: translateY(-2px) scale(1.014);
  background: var(--brand-hover);
  box-shadow: 0 8px 28px rgba(18,150,219,0.05), 0 0 0 1px rgba(18,150,219,0.03) inset;
}
.nav-card:hover::after { opacity: 1; }
.nav-card:active { transform: translateY(0) scale(0.995); transition-duration: 0.08s; }

.card-icon {
  font-size: 1.25rem;
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  background: var(--brand-dim);
  border-radius: 10px;
  flex-shrink: 0;
  transition: all 0.35s;
}
.nav-card:hover .card-icon {
  background: rgba(18,150,219,0.13);
  box-shadow: 0 0 16px rgba(18,150,219,0.1);
}

.card-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
.card-label { font-size: 0.9rem; font-weight: 600; letter-spacing: -0.01em; }
.card-desc  { font-size: 0.74rem; color: var(--card-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-chevron { flex-shrink: 0; color: var(--chevron); transition: all 0.35s; }
.nav-card:hover .card-chevron { color: var(--brand); transform: translateX(2px); }

/* ── responsive ── */
@media (max-width: 600px) {
  .page { padding: 2rem 1.25rem; gap: 1.25rem; }
  .logo-stage { width: 88px; }
  .title { font-size: 1.75rem; }
  .subtitle { font-size: 0.8rem; }
  .nav-grid, .nav-grid.row2 { grid-template-columns: 1fr; max-width: 360px; }
}
@media (min-width: 601px) and (max-width: 740px) {
  .nav-grid.row2 { grid-template-columns: repeat(2, 1fr); max-width: 440px; }
}
</style>
