<template>
  <div class="cardnav-section">
    <nav class="nav-grid">
      <a v-for="item in row1" :key="item.key" :href="item.url" target="_blank" rel="noopener" class="nav-card" @mousemove="onMouseMove">
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
import {computed, ref} from 'vue'
import {useData} from 'vitepress'

const {lang} = useData()

function onMouseMove(e: MouseEvent) {
  const card = e.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  card.style.setProperty('--mx', `${x}%`)
  card.style.setProperty('--my', `${y}%`)
}

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
/* ── section ── */
.cardnav-section {
  display: flex; flex-direction: column; align-items: center;
  padding: 0.5rem 1.5rem 3rem;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 720px;
  width: 100%;
}

/* ── card ── */
.nav-card {
  --card-glow: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);

  display: flex; align-items: center; gap: 0.85rem;
  padding: 1rem 1.1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid transparent;
  border-radius: 16px;
  text-decoration: none; color: var(--vp-c-text-1);
  transition: all 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: relative; overflow: hidden;
  isolation: isolate;
}

/* ── animated gradient border ── */
.nav-card::before {
  content: '';
  position: absolute; inset: -1px; z-index: -2;
  border-radius: 17px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent) 90deg,
    transparent 180deg,
    color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent) 270deg,
    transparent 360deg
  );
  animation: border-rotate 6s linear infinite;
  opacity: 0;
  transition: opacity 0.5s;
}
.nav-card:hover::before { opacity: 1; }

@keyframes border-rotate {
  to { transform: rotate(360deg); }
}

/* ── inner shimmer ── */
.nav-card::after {
  content: '';
  position: absolute; inset: 0; z-index: -1;
  border-radius: 15px;
  background: radial-gradient(
    600px circle at var(--mx, 50%) var(--my, 50%),
    var(--card-glow),
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.5s;
}
.nav-card:hover::after { opacity: 1; }

/* ── hover state ── */
.nav-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 12px 32px rgba(18,150,219,0.06),
    0 4px 8px rgba(18,150,219,0.04),
    inset 0 1px 0 rgba(18,150,219,0.06);
  background: color-mix(in srgb, var(--vp-c-brand-soft) 35%, var(--vp-c-bg-soft));
}
.nav-card:active {
  transform: translateY(-1px) scale(0.995);
  transition-duration: 0.08s;
}

/* ── icon ── */
.card-icon {
  font-size: 1.3rem;
  width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  background: var(--vp-c-brand-soft);
  border-radius: 12px;
  flex-shrink: 0;
  transition: all 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: relative;
}
.card-icon::after {
  content: '';
  position: absolute; inset: 0; border-radius: 12px;
  background: radial-gradient(circle at 50% 40%, rgba(18,150,219,0.15), transparent 70%);
  opacity: 0;
  transition: opacity 0.45s;
}
.nav-card:hover .card-icon {
  background: color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
  box-shadow: 0 0 20px rgba(18,150,219,0.14);
  transform: scale(1.06);
}
.nav-card:hover .card-icon::after { opacity: 1; }

/* ── text ── */
.card-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }
.card-label {
  font-size: 0.92rem; font-weight: 620; letter-spacing: -0.01em;
  transition: color 0.35s;
}
.nav-card:hover .card-label { color: var(--vp-c-brand-1); }

.card-desc {
  font-size: 0.76rem; color: var(--vp-c-text-3);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color 0.35s;
}
.nav-card:hover .card-desc { color: var(--vp-c-text-2); }

/* ── chevron ── */
.card-chevron {
  flex-shrink: 0; color: var(--vp-c-text-3);
  transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  opacity: 0.4;
}
.nav-card:hover .card-chevron {
  color: var(--vp-c-brand-1);
  transform: translateX(3px);
  opacity: 1;
}

/* ── responsive ── */
@media (max-width: 600px) {
  .nav-grid { grid-template-columns: 1fr; max-width: 380px; }
  .nav-card { padding: 0.9rem 1rem; }
}
</style>
