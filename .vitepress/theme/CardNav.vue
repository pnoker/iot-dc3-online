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

    <!-- sparkline chart -->
    <div class="sparkline-container">
      <canvas ref="sparkCanvas" class="sparkline-canvas" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
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

/* ── sparkline canvas ── */
const sparkCanvas = ref<HTMLCanvasElement | null>(null)
let raf = 0, ctx: CanvasRenderingContext2D | null = null
let running = false, reduced = false
let w = 0, h = 0, dpr = 1
let phase = 0

// Generate smooth data points using layered sine waves
function genPoints(n: number, t: number, freqMul: number, ampMul: number, baseY: number): number[] {
  const pts: number[] = []
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1)
    // combine multiple sine waves for a natural-looking signal
    let y = 0
    y += Math.sin(x * Math.PI * 1.7 * freqMul + t * 0.7) * 0.5
    y += Math.cos(x * Math.PI * 2.3 * freqMul + t * 1.1) * 0.25
    y += Math.sin(x * Math.PI * 4.1 * freqMul + t * 0.5) * 0.15
    y = y * ampMul + baseY
    pts.push(y)
  }
  return pts
}

function paint(t: number) {
  if (!ctx || !w || !h) return
  ctx.clearRect(0, 0, w, h)

  const n = Math.max(40, Math.floor(w / 6))
  const top = h * 0.05
  const bot = h * 0.95
  const mid = (top + bot) / 2
  const amp = (bot - top) * 0.42

  // draw subtle grid dots
  const isDark = document.documentElement.classList.contains('dark')
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
  for (let i = 0; i < n; i += 6) {
    const gx = (i / (n - 1)) * w
    for (let r = 0.2; r <= 0.8; r += 0.3) {
      ctx.beginPath()
      ctx.arc(gx, top + (bot - top) * r, 0.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // ── background line (more transparent, slower) ──
  drawLine(genPoints(n, t * 0.3, 0.7, amp * 0.8, mid), n, 'rgba(18,150,219,0.06)', 0.8)

  // ── middle line ──
  drawLine(genPoints(n, t * 0.55, 1.0, amp * 0.9, mid), n, 'rgba(18,150,219,0.10)', 1.0)

  // ── main line ──
  const mainPts = genPoints(n, t * 0.8, 1.3, amp, mid)
  drawLine(mainPts, n, 'rgba(18,150,219,0.28)', 1.4)

  // ── area fill under main line ──
  drawArea(mainPts, n, top, bot)

  // ── highlight dots at peaks ──
  for (let i = 1; i < n - 1; i++) {
    if (mainPts[i] > mainPts[i-1] && mainPts[i] > mainPts[i+1] && mainPts[i] < mid + amp * 0.85) {
      ctx.beginPath()
      ctx.fillStyle = 'rgba(18,150,219,0.42)'
      ctx.arc((i / (n - 1)) * w, mainPts[i], 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawLine(pts: number[], n: number, color: string, lw: number) {
  if (!ctx) return
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  for (let i = 0; i < n; i++) {
    const sx = (i / (n - 1)) * w
    const sy = pts[i]
    if (i === 0) ctx.moveTo(sx, sy)
    else ctx.lineTo(sx, sy)
  }
  ctx.stroke()
}

function drawArea(pts: number[], n: number, top: number, bot: number) {
  if (!ctx) return
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const sx = (i / (n - 1)) * w
    if (i === 0) ctx.moveTo(sx, pts[i])
    else ctx.lineTo(sx, pts[i])
  }
  ctx.lineTo(w, bot)
  ctx.lineTo(0, bot)
  ctx.closePath()
  const grad = ctx.createLinearGradient(0, top, 0, bot)
  grad.addColorStop(0, 'rgba(18,150,219,0.10)')
  grad.addColorStop(0.35, 'rgba(18,150,219,0.04)')
  grad.addColorStop(1, 'rgba(18,150,219,0.00)')
  ctx.fillStyle = grad
  ctx.fill()
}

function frame(now: number) {
  if (!running || !ctx) return
  paint(now / 1000)
  raf = requestAnimationFrame(frame)
}

function resize() {
  const el = sparkCanvas.value
  if (!el) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  const parent = el.parentElement
  if (!parent) return
  w = parent.clientWidth
  h = parent.clientHeight
  el.width = Math.round(w * dpr)
  el.height = Math.round(h * dpr)
  el.style.width = w + 'px'
  el.style.height = h + 'px'
  ctx = el.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function start() {
  if (running) return
  running = true
  raf = requestAnimationFrame(frame)
}
function stop() {
  running = false
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}
function onVis() { if (document.hidden) stop(); else start() }

let ro: ResizeObserver | null = null

onMounted(() => {
  reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  resize()
  if (reduced) { paint(0); return }
  ro = new ResizeObserver(resize)
  const parent = sparkCanvas.value?.parentElement
  if (parent) ro.observe(parent)
  document.addEventListener('visibilitychange', onVis)
  start()
})

onBeforeUnmount(() => {
  stop()
  ro?.disconnect()
  document.removeEventListener('visibilitychange', onVis)
  ctx = null
})
</script>

<style scoped>
/* ── section ── */
.cardnav-section {
  display: flex; flex-direction: column; align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem 0;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 780px;
  width: 100%;
}

/* ── card ── */
.nav-card {
  --card-glow: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);

  display: flex; align-items: center; gap: 0.85rem;
  padding: 1.2rem 1.15rem;
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
  position: absolute; inset: 0; z-index: -2;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 35%,
    color-mix(in srgb, var(--vp-c-brand-1) 22%, transparent) 50%,
    transparent 65%,
    transparent 100%
  );
  background-size: 300% 300%;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: border-sweep 5s ease-in-out infinite;
  opacity: 0;
  transition: opacity 0.5s;
}
.nav-card:hover::before { opacity: 1; }

@keyframes border-sweep {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
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
  font-size: 1.35rem;
  width: 44px; height: 44px;
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
  font-size: 0.95rem; font-weight: 620; letter-spacing: -0.01em;
  transition: color 0.35s;
}
.nav-card:hover .card-label { color: var(--vp-c-brand-1); }

.card-desc {
  font-size: 0.78rem; color: var(--vp-c-text-3);
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

/* ── sparkline ── */
.sparkline-container {
  width: 100%;
  max-width: 900px;
  height: 140px;
  position: relative;
  overflow: hidden;
}
.sparkline-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* ── responsive ── */
@media (max-width: 600px) {
  .nav-grid { grid-template-columns: 1fr; max-width: 380px; }
  .nav-card { padding: 1rem 1.05rem; }
  .sparkline-container { height: 100px; }
}
</style>
