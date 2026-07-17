<template>
  <div class="cardnav-section">
    <nav class="nav-grid">
      <a v-for="item in row1" :key="item.key" :href="item.url" target="_blank" rel="noopener" class="nav-card">
        <span class="card-icon">{{ item.icon }}</span>
        <span class="card-text">
          <span class="card-label">{{ item.label }}</span>
          <span class="card-desc">{{ item.desc }}</span>
        </span>
        <span class="card-chevron">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </span>
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {lang} = useData()

const t = computed(() => lang.value === 'en-US' ? 'en' : 'zh')

const data: Record<string, {label: string; desc: string}> = {
  zh: {
    docs: {label: '文档', desc: '快速开始 · 配置指南 · 驱动开发'},
    book: {label: '书籍', desc: '架构设计 · 最佳实践 · 深入理解'},
    demo: {label: '演示', desc: '在线体验 IoT DC3 平台功能'},
  },
  en: {
    docs: {label: 'Docs', desc: 'Quick Start · Config · Drivers'},
    book: {label: 'Book', desc: 'Architecture · Best Practices · Deep Dive'},
    demo: {label: 'Demo', desc: 'Live IoT DC3 Platform'},
  }
}

const d = computed(() => data[t.value])

const row1 = computed(() => [
  {key: 'docs', icon: '📖', url: 'https://docs.dc3.site', label: d.value.docs.label, desc: d.value.docs.desc},
  {key: 'book', icon: '📚', url: 'https://book.dc3.site', label: d.value.book.label, desc: d.value.book.desc},
  {key: 'demo', icon: '🎮', url: 'https://demo.dc3.site', label: d.value.demo.label, desc: d.value.demo.desc},
])

</script>

<style scoped>
.cardnav-section {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.75rem;
  padding: 0 1.5rem 3rem;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  max-width: 680px;
  width: 100%;
}

.nav-card {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  text-decoration: none; color: var(--vp-c-text-1);
  transition: all 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: relative; overflow: hidden;
}
.nav-card:hover {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 28%, transparent);
  transform: translateY(-2px) scale(1.014);
  box-shadow: 0 8px 28px rgba(18,150,219,0.05);
}
.nav-card:active { transform: translateY(0) scale(0.995); transition-duration: 0.08s; }

.card-icon {
  font-size: 1.25rem;
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  background: var(--vp-c-brand-soft);
  border-radius: 10px;
  flex-shrink: 0;
  transition: all 0.35s;
}
.nav-card:hover .card-icon {
  opacity: 0.85;
  box-shadow: 0 0 16px rgba(18,150,219,0.1);
}

.card-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
.card-label { font-size: 0.9rem; font-weight: 600; letter-spacing: -0.01em; }
.card-desc  { font-size: 0.74rem; color: var(--vp-c-text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-chevron { flex-shrink: 0; color: var(--vp-c-text-3); transition: all 0.35s; }
.nav-card:hover .card-chevron { color: var(--vp-c-brand-1); transform: translateX(2px); }

@media (max-width: 600px) {
  .nav-grid { grid-template-columns: 1fr; max-width: 360px; }
}
</style>
