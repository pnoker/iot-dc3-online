<template>
  <div class="cardnav-root">
    <div class="cardnav-content">
      <!-- left: stacked cards -->
      <div class="cardnav-cards">
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

      <!-- right: tagline -->
      <div class="cardnav-tagline">
        <p>{{ t('tagline') }}</p>
      </div>
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

const zh: Record<string, string> = {
  tagline: '覆盖设备接入、数据采集、运营管理与智能分析。28 个多协议驱动接入异构设备，通过 Spring AI 让大模型读写设备数据、下发命令，形成"感知—决策—执行—反馈"闭环。分布式、多租户、全开源。',
}
const en: Record<string, string> = {
  tagline: 'Device connectivity, data collection, operations management, and intelligent analytics for industrial IoT. 28 multi-protocol drivers bring data up from heterogeneous devices; Spring AI lets large language models read that data and drive commands back to devices, closing the sense–decide–act–feedback loop. Distributed, multi-tenant, fully open source.',
}

function t(key: string) {
  const dict = locale.value === 'zh' ? zh : en
  return dict[key] || key
}

function onMouseMove(e: MouseEvent) {
  const card = e.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  card.style.setProperty('--mx', `${x}%`)
  card.style.setProperty('--my', `${y}%`)
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
let running = false, reduced = false
let w = 0, h = 0, dpr = 1

function genPoints(n: number, t: number, freqMul: number, ampMul: number, baseY: number): number[] {
  const pts: number[] = []
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1)
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

  const n = Math.max(60, Math.floor(w / 5))
  const top = h * 0.05
  const bot = h * 0.95
  const mid = (top + bot) / 2
  const amp = (bot - top) * 0.4

  const isDark = document.documentElement.classList.contains('dark')

  // subtle grid dots
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.04)'
  for (let i = 0; i < n; i += 5) {
    const gx = (i / (n - 1)) * w
    for (let r = 0.15; r <= 0.85; r += 0.35) {
      ctx.beginPath()
      ctx.arc(gx, top + (bot - top) * r, 0.9, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // three layered lines
  drawLine(genPoints(n, t * 0.3, 0.7, amp * 0.75, mid), n, 'rgba(18,150,219,0.05)', 0.8)
  drawLine(genPoints(n, t * 0.55, 1.0, amp * 0.88, mid), n, 'rgba(18,150,219,0.10)', 1.0)
  const mainPts = genPoints(n, t * 0.8, 1.3, amp, mid)
  drawLine(mainPts, n, 'rgba(18,150,219,0.28)', 1.4)

  // area fill
  drawArea(mainPts, n, top, bot)

  // peak dots
  for (let i = 1; i < n - 1; i++) {
    if (mainPts[i] > mainPts[i - 1] && mainPts[i] > mainPts[i + 1] && mainPts[i] < mid + amp * 0.85) {
      ctx.beginPath()
      ctx.fillStyle = 'rgba(18,150,219,0.45)'
      ctx.arc((i / (n - 1)) * w, mainPts[i], 2.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // left/right edge fade
  const fadeW = w * 0.06
  const lg = ctx.createLinearGradient(0, 0, w, 0)
  lg.addColorStop(0, 'rgba(0,0,0,0)')
  lg.addColorStop(fadeW / w, 'rgba(0,0,0,1)')
  lg.addColorStop(1 - fadeW / w, 'rgba(0,0,0,1)')
  lg.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = lg
  ctx.globalCompositeOperation = 'destination-in'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'source-over'
}

function drawLine(pts: number[], n: number, color: string, lw: number) {
  if (!ctx) return
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  for (let i = 0; i < n; i++) {
    const sx = (i / (n - 1)) * w, sy = pts[i]
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
  ctx.lineTo(w, bot); ctx.lineTo(0, bot); ctx.closePath()
  const grad = ctx.createLinearGradient(0, top, 0, bot)
  grad.addColorStop(0, 'rgba(18,150,219,0.12)')
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

function start() { if (running) return; running = true; raf = requestAnimationFrame(frame) }
function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0 }
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
/* ── root ── */
.cardnav-root {
  display: flex; flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* ── content: cards (left) + tagline (right) ── */
.cardnav-content {
  display: flex;
  align-items: flex-start;
  gap: clamp(1.5rem, 4vw, 3rem);
  max-width: 880px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.cardnav-cards {
  display: flex; flex-direction: column; gap: 0.75rem;
  flex-shrink: 0;
  width: 220px;
}

.cardnav-tagline {
  flex: 1;
  padding-top: 0.1rem;
}

.cardnav-tagline p {
  font-size: clamp(0.88rem, 1.4vw, 0.98rem);
  line-height: 1.85;
  color: var(--vp-c-text-2);
  margin: 0;
}

/* ── card ── */
.nav-card {
  --card-glow: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);

  display: flex; align-items: center; gap: 0.65rem;
  padding: 0.7rem 0.85rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid transparent;
  border-radius: 14px;
  text-decoration: none; color: var(--vp-c-text-1);
  transition: all 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: relative; overflow: hidden;
  isolation: isolate;
}

.nav-card::before {
  content: '';
  position: absolute; inset: 0; z-index: -2;
  border-radius: 14px; padding: 1px;
  background: linear-gradient(
    135deg,
    transparent 0%, transparent 35%,
    color-mix(in srgb, var(--vp-c-brand-1) 22%, transparent) 50%,
    transparent 65%, transparent 100%
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

.nav-card::after {
  content: '';
  position: absolute; inset: 0; z-index: -1;
  border-radius: 13px;
  background: radial-gradient(
    500px circle at var(--mx, 50%) var(--my, 50%),
    var(--card-glow), transparent 50%
  );
  opacity: 0;
  transition: opacity 0.5s;
}
.nav-card:hover::after { opacity: 1; }

.nav-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px rgba(18,150,219,0.05),
    inset 0 1px 0 rgba(18,150,219,0.06);
  background: color-mix(in srgb, var(--vp-c-brand-soft) 35%, var(--vp-c-bg-soft));
}
.nav-card:active { transform: translateY(-1px) scale(0.995); transition-duration: 0.08s; }

.card-icon {
  font-size: 1.15rem;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: var(--vp-c-brand-soft);
  border-radius: 10px;
  flex-shrink: 0;
  transition: all 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: relative;
}
.card-icon::after {
  content: '';
  position: absolute; inset: 0; border-radius: 10px;
  background: radial-gradient(circle at 50% 40%, rgba(18,150,219,0.15), transparent 70%);
  opacity: 0; transition: opacity 0.45s;
}
.nav-card:hover .card-icon {
  background: color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
  box-shadow: 0 0 16px rgba(18,150,219,0.12);
  transform: scale(1.05);
}
.nav-card:hover .card-icon::after { opacity: 1; }

.card-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
.card-label { font-size: 0.85rem; font-weight: 620; letter-spacing: -0.01em; transition: color 0.35s; }
.nav-card:hover .card-label { color: var(--vp-c-brand-1); }
.card-desc {
  font-size: 0.7rem; color: var(--vp-c-text-3);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color 0.35s;
}
.nav-card:hover .card-desc { color: var(--vp-c-text-2); }

.card-chevron {
  flex-shrink: 0; color: var(--vp-c-text-3);
  transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  opacity: 0.4;
}
.nav-card:hover .card-chevron { color: var(--vp-c-brand-1); transform: translateX(2px); opacity: 1; }

/* ── sparkline: full-width breakout ── */
.sparkline-wrap {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  height: clamp(80px, 12vh, 140px);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.sparkline-canvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
}

/* ── responsive ── */
/* tablet */
@media (max-width: 768px) {
  .cardnav-content {
    gap: 1.25rem;
    padding: 0 1.25rem;
  }
  .cardnav-cards {
    width: 180px;
    gap: 0.6rem;
  }
  .cardnav-tagline p {
    font-size: 0.84rem;
    line-height: 1.7;
  }
  .nav-card { padding: 0.6rem 0.75rem; }
}

/* mobile: stack */
@media (max-width: 540px) {
  .cardnav-content {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }
  .cardnav-cards {
    flex-direction: row;
    width: 100%;
    gap: 0.5rem;
  }
  .cardnav-cards .nav-card {
    flex: 1;
    min-width: 0;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0.65rem 0.4rem;
    gap: 0.35rem;
  }
  .cardnav-cards .card-text {
    align-items: center;
  }
  .cardnav-cards .card-desc {
    font-size: 0.65rem;
  }
  .cardnav-cards .card-chevron {
    display: none;
  }
  .cardnav-tagline p {
    font-size: 0.8rem;
    line-height: 1.6;
    text-align: center;
  }
}
</style>
