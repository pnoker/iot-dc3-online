<template>
  <!-- wave dot-matrix background (deepest layer) -->
  <div class="shell" :class="{ light: isLight }">
    <HeroWaves />

    <!-- particles converging toward logo -->
    <HeroParticles />

    <!-- theme + lang controls (top-right) -->
    <div class="controls">
      <button class="ctrl-btn" :title="lang === 'zh' ? 'Switch to English' : '切换到中文'" @click="toggleLang">
        {{ lang === 'zh' ? 'EN' : '中文' }}
      </button>
      <button class="ctrl-btn" :title="isLight ? '切换暗色' : '切换亮色'" @click="toggleTheme">
        {{ isLight ? '🌙' : '☀️' }}
      </button>
    </div>

    <!-- center content -->
    <div class="page">
      <div class="logo-stage">
        <HeroLogo />
      </div>

      <h1 class="title">
        IoT <span class="gradient">DC3</span>
      </h1>
      <p class="subtitle">{{ t('subtitle') }}</p>

      <nav class="nav-grid">
        <a v-for="item in row1" :key="item.key" :href="item.url" target="_blank" rel="noopener" class="nav-card">
          <span class="card-icon">{{ item.icon }}</span>
          <span class="card-text">
            <span class="card-label">{{ t(item.key) }}</span>
            <span class="card-desc">{{ t(item.key + 'Desc') }}</span>
          </span>
          <span class="card-chevron">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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

// ── i18n ──
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
function t(key: string) {
  return lang.value === 'zh' ? (zh[key] || key) : (en[key] || key)
}
function toggleLang() {
  lang.value = lang.value === 'zh' ? 'en' : 'zh'
  localStorage.setItem('dc3-lang', lang.value)
}

// ── theme ──
const isLight = ref(false)
function applyTheme(light: boolean) {
  isLight.value = light
  document.documentElement.classList.toggle('light', light)
  localStorage.setItem('dc3-theme', light ? 'light' : 'dark')
}
function toggleTheme() {
  applyTheme(!isLight.value)
}

// ── data ──
const row1 = [
  { key: 'docs',   icon: '📖', url: 'https://docs.dc3.site' },
  { key: 'book',   icon: '📚', url: 'https://book.dc3.site' },
  { key: 'demo',   icon: '🎮', url: 'https://demo.dc3.site' },
]
const row2 = [
  { key: 'github', icon: '🐱', url: 'https://github.com/pnoker/iot-dc3' },
  { key: 'gitee',  icon: '🔴', url: 'https://gitee.com/pnoker/iot-dc3' },
]

onMounted(() => {
  // restore lang
  const saved = localStorage.getItem('dc3-lang')
  if (saved === 'en' || saved === 'zh') lang.value = saved
  // restore theme; default dark
  const savedTheme = localStorage.getItem('dc3-theme')
  applyTheme(savedTheme === 'light')
})
</script>

<style scoped>
.shell {
  --bg: #0f1620;
  --bg-card: rgba(255,255,255,0.035);
  --border-card: rgba(200,216,234,0.08);
  --text: #e8eef6;
  --text-dim: rgba(232,238,246,0.45);
  --text-card-dim: rgba(255,255,255,0.35);
  --brand: #1296db;
  --brand-glow: rgba(18,150,219,0.08);
  --brand-hover-bg: rgba(18,150,219,0.05);
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
  --bg-card: rgba(255,255,255,0.7);
  --border-card: rgba(10,108,178,0.1);
  --text: #1b2733;
  --text-dim: #6b7a89;
  --text-card-dim: #8a98a8;
  --brand: #0a6cb2;
  --brand-glow: rgba(10,108,178,0.06);
  --brand-hover-bg: rgba(10,108,178,0.04);
  --brand-hover-border: rgba(10,108,178,0.2);
  --chevron: rgba(10,108,178,0.2);
  --ctrl-bg: rgba(0,0,0,0.05);
  --ctrl-text: rgba(0,0,0,0.45);
}

/* ── controls ── */
.controls {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  display: flex;
  gap: 0.5rem;
}

.ctrl-btn {
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-card);
  background: var(--ctrl-bg);
  color: var(--ctrl-text);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.25s;
  font-family: inherit;
}

.ctrl-btn:hover {
  border-color: var(--brand);
  color: var(--brand);
}

/* ── page ── */
.page {
  position: relative;
  z-index: 2;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
  gap: 1.5rem;
  padding-top: 3.5rem;
}

/* ── logo ── */
.logo-stage {
  width: min(240px, 50vw);
  aspect-ratio: 1;
  animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(36px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── text ── */
.title {
  font-size: clamp(2.6rem, 9vw, 5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--text);
  animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.06s both;
}

.gradient {
  background: linear-gradient(120deg, #0a6cb2 30%, #16a6dd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.05rem;
  color: var(--text-dim);
  font-weight: 400;
  letter-spacing: 0.05em;
  animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

/* ── cards ── */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
  max-width: 720px;
  width: 100%;
  animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.16s both;
  margin-top: 0.5rem;
}

.nav-grid.row2 {
  grid-template-columns: repeat(2, 1fr);
  max-width: 480px;
  animation-delay: 0.22s;
  margin-top: 0;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.15rem;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 16px;
  text-decoration: none;
  color: var(--text);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1.2);
  overflow: hidden;
  position: relative;
}

.nav-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.4s;
  background: radial-gradient(500px circle at 50% 0%, var(--brand-glow), transparent 60%);
}

.nav-card:hover {
  border-color: var(--brand-hover-border);
  transform: translateY(-3px) scale(1.018);
  background: var(--brand-hover-bg);
  box-shadow: 0 12px 40px rgba(18,150,219,0.06), 0 0 0 1px rgba(18,150,219,0.04) inset;
}

.nav-card:hover::after { opacity: 1; }
.nav-card:active { transform: translateY(-1px) scale(0.996); transition-duration: 0.1s; }

.card-icon {
  font-size: 1.4rem;
  width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(18,150,219,0.07);
  border-radius: 12px;
  flex-shrink: 0;
  transition: all 0.4s;
}
.nav-card:hover .card-icon {
  background: rgba(18,150,219,0.14);
  box-shadow: 0 0 20px rgba(18,150,219,0.12);
}

.card-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }
.card-label { font-size: 0.95rem; font-weight: 600; letter-spacing: -0.01em; }
.card-desc  { font-size: 0.78rem; color: var(--text-card-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-chevron { flex-shrink: 0; color: var(--chevron); transition: all 0.4s; }
.nav-card:hover .card-chevron { color: var(--brand); transform: translateX(3px); }

/* ── responsive ── */
@media (max-width: 640px) {
  .nav-grid, .nav-grid.row2 { grid-template-columns: 1fr; max-width: 400px; }
  .logo-stage { width: min(170px, 56vw); }
}
@media (min-width: 641px) and (max-width: 780px) {
  .nav-grid.row2 { grid-template-columns: repeat(2, 1fr); max-width: 480px; }
}
</style>
