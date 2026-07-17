<script lang="ts" setup>
import {onBeforeUnmount, onMounted} from 'vue'

interface P {
  ang: number; dist: number; seed: number; spin: number; vin: number; r: number; alpha: number
}

let raf = 0
let ctx: CanvasRenderingContext2D | null = null
let cv: HTMLCanvasElement | null = null
let host: HTMLElement | null = null
let dpr = 1, w = 0, h = 0
let ax = 0, ay = 0, ar = 60
let last = 0, frames = 0
let running = false, reduced = false
let ps: P[] = []

function rand(a: number, b: number) { return a + Math.random() * (b - a) }

function measureAnchor() {
  if (!host) return
  const hr = host.getBoundingClientRect()
  const logo = host.querySelector('.logo-stage') as HTMLElement | null
  if (logo) {
    const lr = logo.getBoundingClientRect()
    ax = lr.left - hr.left + lr.width / 2
    ay = lr.top - hr.top + lr.height / 2
    ar = Math.min(lr.width, lr.height) * 0.38
  } else {
    ax = w * 0.5; ay = h * 0.38; ar = Math.min(w, h) * 0.12
  }
}

function spawn(): P {
  if (h > w) {
    const d = rand(1.5, 2.4) * ar
    return { ang: rand(0, Math.PI * 2), dist: d, seed: d, spin: rand(0.2, 0.4), vin: rand(32, 60), r: rand(1.4, 3.2), alpha: 0 }
  }
  let x = 0, y = 0
  const m = 24, e = Math.random() * 4 | 0
  if (e === 0) { x = rand(0, w); y = -m }
  else if (e === 1) { x = w + m; y = rand(0, h) }
  else if (e === 2) { x = rand(0, w); y = h + m }
  else { x = -m; y = rand(0, h) }
  const dx = x - ax, dy = y - ay
  const d = Math.hypot(dx, dy)
  return { ang: Math.atan2(dy, dx), dist: d, seed: d, spin: rand(0.14, 0.3), vin: rand(70, 120), r: rand(1.4, 3.6), alpha: 0 }
}

function build() {
  const n = h > w ? 14 : Math.max(32, Math.min(70, Math.round(w * h / 12000)))
  ps = Array.from({length: n}, spawn)
  for (const p of ps) p.dist *= rand(0.4, 1)
}

function resize() {
  if (!host || !cv) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = host.clientWidth; h = host.clientHeight
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr)
  ctx = cv.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function frame(now: number) {
  if (!running || !ctx) return
  if (!last) last = now
  let dt = (now - last) / 1000
  last = now
  if (dt > 0.05) dt = 0.05
  if ((frames++ % 12) === 0) measureAnchor()
  ctx.clearRect(0, 0, w, h)
  const maxD = Math.hypot(w, h)
  for (const p of ps) {
    p.dist -= p.vin * dt
    p.ang += p.spin * dt
    if (p.dist <= ar) { Object.assign(p, spawn()); continue }
    const prox = Math.max(0, Math.min(1, 1 - p.dist / (0.6 * maxD)))
    const inF = Math.max(0, Math.min(1, (p.seed - p.dist) / 100))
    const outF = Math.max(0, Math.min(1, (p.dist - ar) / 70))
    p.alpha = (0.16 + 0.44 * prox) * inF * outF
    const x = ax + Math.cos(p.ang) * p.dist
    const y = ay + Math.sin(p.ang) * p.dist
    ctx.globalAlpha = p.alpha
    ctx.beginPath()
    ctx.fillStyle = '#1296db'
    ctx.arc(x, y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  raf = requestAnimationFrame(frame)
}

function start() { if (running) return; running = true; raf = requestAnimationFrame(frame) }
function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0 }
function onVis() { if (document.hidden) stop(); else { last = 0; start() } }

let ro: ResizeObserver | null = null

function init() {
  host = document.querySelector('.shell') as HTMLElement | null
  if (!host) return
  host.style.position = 'relative'
  host.querySelectorAll('.hero-particles-canvas').forEach(n => n.remove())
  cv = document.createElement('canvas')
  cv.className = 'hero-particles-canvas'
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none'
  host.insertBefore(cv, host.firstChild)
  resize()
  measureAnchor()
  if (reduced) return
  build()
  ro = new ResizeObserver(() => { resize(); measureAnchor() })
  ro.observe(host)
  document.addEventListener('visibilitychange', onVis)
  start()
}

onMounted(() => {
  reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  let tries = 0
  const tick = () => {
    if (document.querySelector('.shell')) { init(); return }
    if (tries++ < 20) requestAnimationFrame(tick)
  }
  tick()
})

onBeforeUnmount(() => {
  stop(); ro?.disconnect()
  document.removeEventListener('visibilitychange', onVis)
  cv?.remove(); cv = null; ctx = null; host = null
})
</script>

<template>
  <span aria-hidden="true" style="display:none"/>
</template>
