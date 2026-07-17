<template>
  <div class="cosmic-bg">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="grid-overlay"></div>
  </div>

  <div class="page">
    <header class="hero">
      <div class="logo-glow">
        <div class="logo-icon">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="72" height="72" rx="18" stroke="currentColor" stroke-width="3" fill="none"/>
            <circle cx="28" cy="28" r="8" fill="currentColor" opacity="0.9"/>
            <circle cx="52" cy="28" r="8" fill="currentColor" opacity="0.9"/>
            <circle cx="40" cy="52" r="8" fill="currentColor" opacity="0.9"/>
            <line x1="28" y1="36" x2="36" y2="46" stroke="currentColor" stroke-width="2" opacity="0.6"/>
            <line x1="52" y1="36" x2="44" y2="46" stroke="currentColor" stroke-width="2" opacity="0.6"/>
            <line x1="28" y1="28" x2="52" y2="28" stroke="currentColor" stroke-width="2" opacity="0.6"/>
          </svg>
        </div>
      </div>
      <h1 class="title">IoT <span class="accent">DC3</span></h1>
      <p class="subtitle">开源、分布式的物联网平台</p>
    </header>

    <nav class="nav-grid">
      <a
        v-for="item in links"
        :key="item.label"
        :href="item.url"
        :target="item.external ? '_blank' : '_self'"
        :rel="item.external ? 'noopener' : undefined"
        class="nav-card"
      >
        <div class="card-icon">{{ item.icon }}</div>
        <div class="card-body">
          <span class="card-label">{{ item.label }}</span>
          <span class="card-desc">{{ item.desc }}</span>
        </div>
        <div class="card-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </a>
    </nav>

    <footer class="footer">
      <span>© {{ year }} IoT DC3 · </span>
      <a href="https://github.com/pnoker/iot-dc3" target="_blank" rel="noopener">GitHub</a>
      <span> · </span>
      <a href="https://gitee.com/pnoker/iot-dc3" target="_blank" rel="noopener">Gitee</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()

const links = [
  {
    icon: '📖',
    label: '文档',
    desc: '快速开始、配置指南、驱动开发',
    url: 'https://docs.dc3.site',
    external: true,
  },
  {
    icon: '🎮',
    label: '演示',
    desc: '在线体验 IoT DC3 平台功能',
    url: 'https://demo.dc3.site',
    external: true,
  },
  {
    icon: '📚',
    label: '手册',
    desc: '深入理解架构与最佳实践',
    url: 'https://book.dc3.site',
    external: true,
  },
  {
    icon: '🐱',
    label: 'GitHub',
    desc: 'pnoker/iot-dc3 · Star & Fork',
    url: 'https://github.com/pnoker/iot-dc3',
    external: true,
  },
  {
    icon: '🔴',
    label: 'Gitee',
    desc: 'pnoker/iot-dc3 · 国内镜像',
    url: 'https://gitee.com/pnoker/iot-dc3',
    external: true,
  },
]
</script>

<style scoped>
.page {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 2.5rem;
}

/* ── cosmic background ── */
.cosmic-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: radial-gradient(ellipse at 20% 50%, #1a1040 0%, transparent 55%),
              radial-gradient(ellipse at 80% 20%, #0f1a30 0%, transparent 55%),
              radial-gradient(ellipse at 50% 80%, #1a0f2e 0%, transparent 55%),
              #0a0a0f;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 20s ease-in-out infinite;
}
.orb-1 { width: 400px; height: 400px; background: #6c5ce7; top: 10%; left: 10%; animation-delay: 0s; }
.orb-2 { width: 300px; height: 300px; background: #00cec9; top: 50%; right: 10%; animation-delay: -7s; }
.orb-3 { width: 350px; height: 350px; background: #a29bfe; bottom: 10%; left: 40%; animation-delay: -14s; }

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.08); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(-30px, -20px) scale(1.05); }
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
}

/* ── hero ── */
.hero {
  text-align: center;
  animation: fadeUp 0.8s ease-out;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.logo-glow {
  display: inline-flex;
  margin-bottom: 1.5rem;
  position: relative;
}
.logo-glow::after {
  content: '';
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: var(--accent-glow);
  filter: blur(40px);
  z-index: -1;
  animation: pulse 3s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.15); }
}

.logo-icon {
  width: 80px;
  height: 80px;
  color: var(--accent);
}

.title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.title .accent {
  background: linear-gradient(135deg, #6c5ce7, #00cec9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin-top: 0.75rem;
  font-size: 1.15rem;
  color: var(--text-secondary);
  font-weight: 400;
  letter-spacing: 0.05em;
}

/* ── nav grid ── */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  max-width: 640px;
  width: 100%;
  animation: fadeUp 0.8s ease-out 0.15s both;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 14px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}

.nav-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  opacity: 0;
  transition: opacity 0.3s;
  background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(108,92,231,0.12), transparent 50%);
}

.nav-card:hover {
  border-color: rgba(108, 92, 231, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(108, 92, 231, 0.15);
}
.nav-card:hover::before { opacity: 1; }

.card-icon {
  font-size: 1.6rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(108, 92, 231, 0.1);
  border-radius: 12px;
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.card-label {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.card-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-arrow {
  flex-shrink: 0;
  color: var(--text-secondary);
  transition: all 0.3s;
}
.nav-card:hover .card-arrow {
  color: var(--accent);
  transform: translateX(4px);
}

/* ── footer ── */
.footer {
  font-size: 0.8rem;
  color: var(--text-secondary);
  animation: fadeUp 0.8s ease-out 0.3s both;
}
.footer a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}
.footer a:hover { color: var(--accent); }
</style>
