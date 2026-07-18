<template>
  <div class="cardnav-root">
    <!-- AdSense responsive banner -->
    <div class="adsense-wrap">
      <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-7573143232245283"
        data-ad-slot="2006078743"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    </div>

    <!-- full-width sparkline -->
    <div class="sparkline-wrap">
      <canvas ref="sparkCanvas" class="sparkline-canvas" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'

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

@media (max-width: 640px) {
  .sparkline-wrap { height: 80px; }
}
</style>
