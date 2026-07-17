<template>
  <div class="shell">
    <!-- Particle convergence layer (behind everything) -->
    <HeroParticles />

    <!-- Center content -->
    <div class="page">
      <!-- Animated logo (pure canvas, no img) -->
      <div class="logo-stage">
        <HeroLogo />
      </div>

      <h1 class="title">
        IoT <span class="gradient">DC3</span>
      </h1>
      <p class="subtitle">分布式工业物联网平台</p>

      <nav class="nav-grid">
        <a v-for="item in row1" :key="item.label" :href="item.url" target="_blank" rel="noopener" class="nav-card">
          <span class="card-icon">{{ item.icon }}</span>
          <span class="card-text">
            <span class="card-label">{{ item.label }}</span>
            <span class="card-desc">{{ item.desc }}</span>
          </span>
          <span class="card-chevron">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </span>
        </a>
      </nav>

      <nav class="nav-grid row2">
        <a v-for="item in row2" :key="item.label" :href="item.url" target="_blank" rel="noopener" class="nav-card">
          <span class="card-icon">{{ item.icon }}</span>
          <span class="card-text">
            <span class="card-label">{{ item.label }}</span>
            <span class="card-desc">{{ item.desc }}</span>
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
import HeroParticles from './HeroParticles.vue'
import HeroLogo from './HeroLogo.vue'

const row1 = [
  { icon: '📖', label: '文档',     desc: '快速开始 · 配置指南 · 驱动开发',   url: 'https://docs.dc3.site' },
  { icon: '📚', label: '书籍',     desc: '架构设计 · 最佳实践 · 深入理解',   url: 'https://book.dc3.site' },
  { icon: '🎮', label: '演示',     desc: '在线体验 IoT DC3 平台功能',        url: 'https://demo.dc3.site' },
]

const row2 = [
  { icon: '🐱', label: 'GitHub',   desc: 'pnoker/iot-dc3',                  url: 'https://github.com/pnoker/iot-dc3' },
  { icon: '🔴', label: 'Gitee',    desc: 'pnoker/iot-dc3',                  url: 'https://gitee.com/pnoker/iot-dc3' },
]
</script>

<style scoped>
.shell {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: #0f1620;
}

.page {
  position: relative;
  z-index: 2;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  gap: 1.5rem;
}

/* ── logo stage ── */
.logo-stage {
  width: min(240px, 50vw);
  aspect-ratio: 1;
  animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(36px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── hero text ── */
.title {
  font-size: clamp(2.6rem, 9vw, 5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  color: #e8eef6;
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
  color: rgba(232, 238, 246, 0.45);
  font-weight: 400;
  letter-spacing: 0.05em;
  animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

/* ── nav cards ── */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
  max-width: 720px;
  width: 100%;
  animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.16s both;
  margin-top: 1rem;
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
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(200, 216, 234, 0.08);
  border-radius: 16px;
  text-decoration: none;
  color: #e8eef6;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1.2);
  overflow: hidden;
}

.nav-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.4s;
  background: radial-gradient(500px circle at 50% 0%, rgba(18,150,219,0.08), transparent 60%);
}

.nav-card:hover {
  border-color: rgba(18,150,219,0.28);
  transform: translateY(-3px) scale(1.018);
  background: rgba(18,150,219,0.05);
  box-shadow: 0 12px 40px rgba(18,150,219,0.08), 0 0 0 1px rgba(18,150,219,0.06) inset;
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

.card-text {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 0.15rem;
}

.card-label { font-size: 0.95rem; font-weight: 600; letter-spacing: -0.01em; }
.card-desc  { font-size: 0.78rem; color: rgba(255,255,255,0.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-chevron { flex-shrink: 0; color: rgba(255,255,255,0.15); transition: all 0.4s; }
.nav-card:hover .card-chevron { color: #1296db; transform: translateX(3px); }

/* ── responsive ── */
@media (max-width: 640px) {
  .nav-grid, .nav-grid.row2 { grid-template-columns: 1fr; max-width: 400px; }
  .logo-stage { width: min(170px, 56vw); }
}
@media (min-width: 641px) and (max-width: 780px) {
  .nav-grid.row2 { grid-template-columns: repeat(2, 1fr); max-width: 480px; }
}
</style>
