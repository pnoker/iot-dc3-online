<template>
  <canvas ref="canvas" class="particles"></canvas>

  <div class="page">
    <header class="hero">
      <div class="logo-wrap">
        <img src="/logo.svg" alt="IoT DC3" class="logo" />
        <div class="logo-aura"></div>
      </div>
      <h1 class="title">
        IoT <span class="gradient">DC3</span>
      </h1>
      <p class="subtitle">开源、分布式的物联网平台</p>
    </header>

    <nav class="nav-grid">
      <a
        v-for="item in row1"
        :key="item.label"
        :href="item.url"
        target="_blank"
        rel="noopener"
        class="nav-card"
      >
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
      <a
        v-for="item in row2"
        :key="item.label"
        :href="item.url"
        target="_blank"
        rel="noopener"
        class="nav-card"
      >
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
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement>()

const row1 = [
  { icon: '📖', label: '文档', desc: '快速开始 · 配置指南 · 驱动开发', url: 'https://docs.dc3.site' },
  { icon: '📚', label: '书籍', desc: '架构设计 · 最佳实践 · 深入理解', url: 'https://book.dc3.site' },
  { icon: '🎮', label: '演示', desc: '在线体验 IoT DC3 平台功能', url: 'https://demo.dc3.site' },
]

const row2 = [
  { icon: '🐱', label: 'GitHub', desc: 'pnoker/iot-dc3', url: 'https://github.com/pnoker/iot-dc3' },
  { icon: '🔴', label: 'Gitee', desc: 'pnoker/iot-dc3', url: 'https://gitee.com/pnoker/iot-dc3' },
]

onMounted(() => {
  const c = canvas.value!
  const ctx = c.getContext('2d')!
  let w = 0, h = 0
  let animId = 0

  interface Node {
    x: number; y: number; vx: number; vy: number; r: number; opacity: number
  }

  const nodes: Node[] = []
  const N = 50

  const resize = () => {
    w = window.innerWidth
    h = window.innerHeight
    c.width = w * devicePixelRatio
    c.height = h * devicePixelRatio
    c.style.width = w + 'px'
    c.style.height = h + 'px'
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
  }

  const seed = () => {
    nodes.length = 0
    for (let i = 0; i < N; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.4 + 0.15,
      })
    }
  }

  const draw = () => {
    ctx.clearRect(0, 0, w, h)
    const connectionDist = 150

    // connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.12
          ctx.beginPath()
          ctx.moveTo(nodes[i].x, nodes[i].y)
          ctx.lineTo(nodes[j].x, nodes[j].y)
          ctx.strokeStyle = `rgba(18,150,219,${alpha})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    // nodes
    for (const n of nodes) {
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(18,150,219,${n.opacity})`
      ctx.fill()

      // glow
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4)
      glow.addColorStop(0, `rgba(18,150,219,${n.opacity * 0.6})`)
      glow.addColorStop(1, 'rgba(18,150,219,0)')
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()
    }

    // move
    for (const n of nodes) {
      n.x += n.vx
      n.y += n.vy
      if (n.x < 0) n.x = w
      if (n.x > w) n.x = 0
      if (n.y < 0) n.y = h
      if (n.y > h) n.y = 0
    }

    animId = requestAnimationFrame(draw)
  }

  resize()
  seed()
  draw()
  window.addEventListener('resize', () => { resize(); seed() })

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', () => {})
  })
})
</script>

<style scoped>
.page {
  position: relative;
  z-index: 2;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  gap: 2rem;
}

/* ── particle canvas ── */
.particles {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* ── hero ── */
.hero {
  text-align: center;
  animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(36px); }
  to   { opacity: 1; transform: translateY(0); }
}

.logo-wrap {
  position: relative;
  display: inline-flex;
  margin-bottom: 1.25rem;
}

.logo {
  width: 88px;
  height: 88px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 24px rgba(18,150,219,0.35));
}

.logo-aura {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(18,150,219,0.2) 0%, transparent 70%);
  animation: auraPulse 4s ease-in-out infinite;
}

@keyframes auraPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50%      { transform: scale(1.25); opacity: 0.85; }
}

.title {
  font-size: clamp(2.6rem, 9vw, 5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  color: #e8e8ed;
}

.gradient {
  background: linear-gradient(135deg, #1296db 0%, #22c5e8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin-top: 0.6rem;
  font-size: 1.05rem;
  color: rgba(255,255,255,0.45);
  font-weight: 400;
  letter-spacing: 0.06em;
}

/* ── nav grid ── */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
  max-width: 720px;
  width: 100%;
  animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both;
}

.nav-grid.row2 {
  grid-template-columns: repeat(2, 1fr);
  max-width: 480px;
  animation-delay: 0.24s;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.15rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  text-decoration: none;
  color: #e8e8ed;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1.2);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.nav-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.35s;
  background: radial-gradient(500px circle at 50% 0%, rgba(18,150,219,0.08), transparent 60%);
}

.nav-card:hover {
  border-color: rgba(18,150,219,0.3);
  transform: translateY(-3px) scale(1.015);
  box-shadow: 0 12px 40px rgba(18,150,219,0.1), 0 0 0 1px rgba(18,150,219,0.1) inset;
  background: rgba(18,150,219,0.06);
}

.nav-card:hover::after { opacity: 1; }

.nav-card:active {
  transform: translateY(-1px) scale(0.995);
  transition-duration: 0.1s;
}

.card-icon {
  font-size: 1.45rem;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(18,150,219,0.08);
  border-radius: 12px;
  flex-shrink: 0;
  transition: all 0.35s;
}

.nav-card:hover .card-icon {
  background: rgba(18,150,219,0.16);
  box-shadow: 0 0 20px rgba(18,150,219,0.15);
}

.card-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.card-label {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.card-desc {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-chevron {
  flex-shrink: 0;
  color: rgba(255,255,255,0.2);
  transition: all 0.35s;
}

.nav-card:hover .card-chevron {
  color: #1296db;
  transform: translateX(3px);
}

/* ── responsive ── */
@media (max-width: 640px) {
  .nav-grid, .nav-grid.row2 {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
}

@media (min-width: 641px) and (max-width: 780px) {
  .nav-grid.row2 { grid-template-columns: repeat(2, 1fr); max-width: 480px; }
}
</style>
