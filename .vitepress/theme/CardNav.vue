<template>
  <div class="cardnav-root">
    <!-- horizontal cards, left-aligned with hero text -->
    <div class="cardnav-content">
      <a
        v-for="item in cards"
        :key="item.key"
        :href="item.url"
        target="_blank"
        rel="noopener"
        class="nav-card"
        @mousemove="onMouseMove"
      >
        <span class="card-icon">{{ item.icon }}</span>
        <span class="card-text">
          <span class="card-label">{{ item.label }}</span>
          <span class="card-desc">{{ item.desc }}</span>
        </span>
        <span class="card-chevron">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </span>
      </a>
    </div>

    <!-- AdSense responsive banner -->
    <div class="adsense-wrap">
      <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-7573143232245283"
        data-ad-slot=""
        data-ad-format="horizontal"
        data-full-width-responsive="false"></ins>
    </div>

    <!-- full-width sparkline -->
    <div class="sparkline-wrap">
      <canvas ref="sparkCanvas" class="sparkline-canvas" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {useData} from 'vitepress'

const {lang} = useData()

const locale = computed(() => lang.value === 'en-US' ? 'en' : 'zh')

function onMouseMove(e: MouseEvent) {
  const card = e.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
  card.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`)
}

const langData: Record<string, Record<string, {label: string; desc: string}>> = {
  zh: {
    docs: {label: '文档', desc: '快速开始 · 配置指南 · 驱动开发'},
    book: {label: '书籍', desc: '架构设计 · 最佳实践 · 深入理解'},
    demo: {label: '演示', desc: '在线体验 IoT DC3 平台功能'},
  },
  en: {
    docs: {label: 'Docs', desc: 'Quick Start · Config · Drivers'},
    book: {label: 'Book', desc: 'Architecture · Best Practices · Deep Dive'},
    demo: {label: 'Demo', desc: 'Live IoT DC3 Platform'},
  },
}

const cards = computed(() => {
  const d = langData[locale.value]
  return [
    {key: 'docs', icon: '📖', url: 'https://docs.dc3.site', label: d.docs.label, desc: d.docs.desc},
    {key: 'book', icon: '📚', url: 'https://book.dc3.site', label: d.book.label, desc: d.book.desc},
    {key: 'demo', icon: '🎮', url: 'https://demo.dc3.site', label: d.demo.label, desc: d.demo.desc},
  ]
})

/* ── sparkline ── */
const sparkCanvas = ref<HTMLCanvasElement | null>(null)
let raf = 0, ctx: CanvasRenderingContext2D | null = null
let running = false, reduced = false, w = 0, h = 0, dpr = 1

function genPts(n: number, t: number, fm: number, am: number, by: number): number[] {
  const pts: number[] = []
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1)
    let y = Math.sin(x * Math.PI * 1.7 * fm + t * 0.7) * 0.5
      + Math.cos(x * Math.PI * 2.3 * fm + t * 1.1) * 0.25
      + Math.sin(x * Math.PI * 4.1 * fm + t * 0.5) * 0.15
    pts.push(y * am + by)
  }
  return pts
}

function paint(t: number) {
  if (!ctx || !w || !h) return
  ctx.clearRect(0, 0, w, h)
  const n = Math.max(60, Math.floor(w / 5)), top = h * 0.08, bot = h * 0.92
  const mid = (top + bot) / 2, amp = (bot - top) * 0.4
  const isDark = document.documentElement.classList.contains('dark')

  // grid
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.035)'
  for (let i = 0; i < n; i += 5) {
    const gx = (i / (n - 1)) * w
    for (let r = 0.15; r <= 0.85; r += 0.35) {
      ctx.beginPath(); ctx.arc(gx, top + (bot - top) * r, 0.9, 0, Math.PI * 2); ctx.fill()
    }
  }

  // 3 layered lines
  const draw = (pts: number[], n_: number, c: string, lw: number) => {
    if (!ctx) return
    ctx.beginPath(); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'
    for (let i = 0; i < n_; i++) { const sx = (i / (n_ - 1)) * w, sy = pts[i]; i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy) }
    ctx.stroke()
  }
  draw(genPts(n, t * 0.3, 0.7, amp * 0.72, mid), n, 'rgba(18,150,219,0.05)', 0.8)
  draw(genPts(n, t * 0.55, 1.0, amp * 0.86, mid), n, 'rgba(18,150,219,0.10)', 1.0)
  const main = genPts(n, t * 0.8, 1.3, amp, mid)
  draw(main, n, 'rgba(18,150,219,0.26)', 1.4)

  // area
  ctx.beginPath()
  for (let i = 0; i < n; i++) { const sx = (i / (n - 1)) * w; i === 0 ? ctx.moveTo(sx, main[i]) : ctx.lineTo(sx, main[i]) }
  ctx.lineTo(w, bot); ctx.lineTo(0, bot); ctx.closePath()
  const g = ctx.createLinearGradient(0, top, 0, bot)
  g.addColorStop(0, 'rgba(18,150,219,0.10)'); g.addColorStop(0.35, 'rgba(18,150,219,0.03)'); g.addColorStop(1, 'rgba(18,150,219,0)')
  ctx.fillStyle = g; ctx.fill()

  // peaks
  for (let i = 1; i < n - 1; i++) {
    if (main[i] > main[i - 1] && main[i] > main[i + 1] && main[i] < mid + amp * 0.85) {
      ctx.beginPath(); ctx.fillStyle = 'rgba(18,150,219,0.42)'
      ctx.arc((i / (n - 1)) * w, main[i], 2.4, 0, Math.PI * 2); ctx.fill()
    }
  }

  // edge fade
  const fw = w * 0.05, lg = ctx.createLinearGradient(0, 0, w, 0)
  lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(fw / w, 'rgba(0,0,0,1)')
  lg.addColorStop(1 - fw / w, 'rgba(0,0,0,1)'); lg.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = lg; ctx.globalCompositeOperation = 'destination-in'; ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'source-over'
}

function frame(now: number) { if (!running || !ctx) return; paint(now / 1000); raf = requestAnimationFrame(frame) }
function resize() {
  const el = sparkCanvas.value; if (!el) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  const p = el.parentElement; if (!p) return
  w = p.clientWidth; h = p.clientHeight
  el.width = Math.round(w * dpr); el.height = Math.round(h * dpr)
  el.style.width = w + 'px'; el.style.height = h + 'px'
  ctx = el.getContext('2d'); if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}
function start() { if (running) return; running = true; raf = requestAnimationFrame(frame) }
function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0 }
function onVis() { document.hidden ? stop() : start() }
let ro: ResizeObserver | null = null

onMounted(() => {
  reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  resize(); if (reduced) { paint(0); return }
  ro = new ResizeObserver(resize)
  const p = sparkCanvas.value?.parentElement; if (p) ro.observe(p)
  document.addEventListener('visibilitychange', onVis); start()
  // AdSense manual placement
  try { (window as any).adsbygoogle?.push({}) } catch (_) { /* ad-blocker or not loaded */ }
})
onBeforeUnmount(() => {
  stop(); ro?.disconnect(); document.removeEventListener('visibilitychange', onVis); ctx = null
})
</script>

<style scoped>
.cardnav-root {
  display: flex; flex-direction: column;
}

/* ── cards: horizontal row, left-aligned with hero ── */
.cardnav-content {
  display: flex; gap: 0.9rem;
  max-width: 680px;
  width: calc(100% - 3rem);
  margin: 0 auto;
  padding: 0.25rem 0 1rem;
}

.nav-card {
  --card-glow: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
  flex: 1; min-width: 0;
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.75rem 0.9rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid transparent;
  border-radius: 14px;
  text-decoration: none; color: var(--vp-c-text-1);
  transition: all 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: relative; overflow: hidden; isolation: isolate;
}

/* border sweep */
.nav-card::before {
  content: ''; position: absolute; inset: 0; z-index: -2; border-radius: 14px; padding: 1px;
  background: linear-gradient(120deg, transparent 30%, color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent) 50%, transparent 70%);
  background-size: 300% 300%;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  animation: sweep 5s ease-in-out infinite;
  opacity: 0; transition: opacity 0.5s;
}
.nav-card:hover::before { opacity: 1; }
@keyframes sweep { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

/* inner shimmer */
.nav-card::after {
  content: ''; position: absolute; inset: 0; z-index: -1; border-radius: 13px;
  background: radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), var(--card-glow), transparent 50%);
  opacity: 0; transition: opacity 0.5s;
}
.nav-card:hover::after { opacity: 1; }
.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(18,150,219,0.05), inset 0 1px 0 rgba(18,150,219,0.06);
  background: color-mix(in srgb, var(--vp-c-brand-soft) 35%, var(--vp-c-bg-soft));
}
.nav-card:active { transform: translateY(-1px) scale(0.995); transition-duration: 0.08s; }

.card-icon {
  font-size: 1.2rem; width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  background: var(--vp-c-brand-soft); border-radius: 10px;
  flex-shrink: 0; transition: all 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.nav-card:hover .card-icon {
  background: color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
  box-shadow: 0 0 16px rgba(18,150,219,0.12); transform: scale(1.05);
}

.card-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
.card-label { font-size: 0.88rem; font-weight: 620; letter-spacing: -0.01em; transition: color 0.35s; }
.nav-card:hover .card-label { color: var(--vp-c-brand-1); }
.card-desc { font-size: 0.72rem; color: var(--vp-c-text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.35s; }
.nav-card:hover .card-desc { color: var(--vp-c-text-2); }

.card-chevron { flex-shrink: 0; color: var(--vp-c-text-3); transition: all 0.4s; opacity: 0.4; }
.nav-card:hover .card-chevron { color: var(--vp-c-brand-1); transform: translateX(2px); opacity: 1; }

/* ── adsense ── */
.adsense-wrap {
  max-width: 680px;
  width: calc(100% - 3rem);
  margin: 0 auto;
  padding: 0.5rem 0 0.75rem;
  display: flex; justify-content: center;
  opacity: 0.55;
  transition: opacity 0.35s;
}
.adsense-wrap:hover { opacity: 1; }

/* ── sparkline: full-width breakout ── */
.sparkline-wrap {
  width: 100vw; margin-left: calc(-50vw + 50%);
  height: clamp(90px, 14vh, 150px);
  position: relative; overflow: hidden;
}
.sparkline-canvas { position: absolute; inset: 0; width: 100%; height: 100%; }

/* ── responsive ── */
@media (max-width: 640px) {
  .cardnav-content { flex-direction: column; gap: 0.5rem; width: calc(100% - 2rem); padding-bottom: 0.75rem; }
  .nav-card { padding: 0.65rem 0.8rem; }
  .sparkline-wrap { height: 80px; }
}
</style>
