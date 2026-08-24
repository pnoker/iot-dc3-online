<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {LOGO_POINTS} from '../../logo-points'

interface NodePoint {
  x: number
  y: number
  phase: number
  size: number
}

interface LogoParticle {
  x: number
  y: number
}

const canvas = ref<HTMLCanvasElement | null>(null)

let context: CanvasRenderingContext2D | null = null
let observer: ResizeObserver | null = null
let viewportObserver: IntersectionObserver | null = null
let animationFrame = 0
let lastPaintAt = 0
let width = 0
let height = 0
let dpr = 1
let startedAt = 0
let reducedMotion = false
let nodes: NodePoint[] = []
let logoParticles: LogoParticle[] = []
let host: HTMLElement | null = null
let pointerX = 0
let pointerY = 0
let pointerTargetX = 0
let pointerTargetY = 0
let pointerStrength = 0
let pointerTargetStrength = 0
let inViewport = true

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 9283.17 + salt * 431.41) * 43758.5453
  return value - Math.floor(value)
}

function rebuildNodes() {
  const count = Math.max(26, Math.min(48, Math.round(width / 28)))
  nodes = Array.from({length: count}, (_, index) => ({
    x: seeded(index, 1),
    y: 0.1 + seeded(index, 2) * 0.76,
    phase: seeded(index, 3) * Math.PI * 2,
    size: 0.7 + seeded(index, 4) * 1.5
  }))
}

function rebuildLogoParticles() {
  const particles: LogoParticle[] = []
  const spacing = 15

  // 用同一张规则点阵填充 Logo 的 54 个圆形区域，形成干净、连续的粒子剪影。
  for (let y = -520; y <= 520; y += spacing) {
    for (let x = -560; x <= 540; x += spacing) {
      const insideLogo = LOGO_POINTS.some((point) => {
        const dx = x - point.x
        const dy = y - point.y
        return dx * dx + dy * dy <= (point.r - 2) ** 2
      })
      if (insideLogo) particles.push({x, y})
    }
  }
  logoParticles = particles
}

function resize() {
  const element = canvas.value
  if (!element) return

  const rect = element.getBoundingClientRect()
  width = rect.width
  height = rect.height
  dpr = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.25 : 1.5)
  element.width = Math.round(width * dpr)
  element.height = Math.round(height * dpr)
  context = element.getContext('2d')
  context?.setTransform(dpr, 0, 0, dpr, 0, 0)
  rebuildNodes()
  if (!pointerX && !pointerY) {
    pointerX = pointerTargetX = width * 0.5
    pointerY = pointerTargetY = height * 0.38
  }
  if (reducedMotion) requestAnimationFrame(draw)
}

function pointerRadius() {
  return Math.min(190, Math.max(120, width * 0.145))
}

function warpPoint(x: number, y: number, time: number) {
  if (pointerStrength < 0.001) return {x, y}

  let dx = x - pointerX
  let dy = y - pointerY
  let distance = Math.hypot(dx, dy)
  const radius = pointerRadius()
  if (distance >= radius) return {x, y}
  if (distance < 0.001) {
    dx = 0.001
    distance = 0.001
  }

  const influence = 1 - distance / radius
  const pressure = Math.sin(influence * Math.PI * 0.5) ** 2
  const ripple = Math.sin(distance * 0.06 - time * 2.1) * 2.1 * influence
  const push = (pressure * 38 + ripple) * pointerStrength

  return {
    x: x + dx / distance * push,
    y: y + dy / distance * push
  }
}

function drawWarpedGrid(time: number) {
  if (!context) return

  const spacing = width < 640 ? 46 : 62
  const segment = width < 640 ? 12 : 15
  const offsetX = (width % spacing) * 0.5
  const offsetY = 4

  if (pointerStrength > 0.01) {
    const radius = pointerRadius()
    const field = context.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, radius)
    field.addColorStop(0, `rgba(115, 232, 255, ${0.11 * pointerStrength})`)
    field.addColorStop(0.36, `rgba(41, 197, 223, ${0.055 * pointerStrength})`)
    field.addColorStop(1, 'rgba(41, 197, 223, 0)')
    context.fillStyle = field
    context.fillRect(pointerX - radius, pointerY - radius, radius * 2, radius * 2)
  }

  context.save()
  context.strokeStyle = 'rgba(18, 150, 219, 0.13)'
  context.lineWidth = 0.68

  for (let baseX = offsetX; baseX <= width + spacing; baseX += spacing) {
    context.beginPath()
    for (let y = -segment; y <= height + segment; y += segment) {
      const point = warpPoint(baseX, y, time)
      if (y === -segment) context.moveTo(point.x, point.y)
      else context.lineTo(point.x, point.y)
    }
    context.stroke()
  }

  for (let baseY = offsetY; baseY <= height + spacing; baseY += spacing) {
    context.beginPath()
    for (let x = -segment; x <= width + segment; x += segment) {
      const point = warpPoint(x, baseY, time)
      if (x === -segment) context.moveTo(point.x, point.y)
      else context.lineTo(point.x, point.y)
    }
    context.stroke()
  }

  if (pointerStrength > 0.01) {
    context.beginPath()
    context.arc(pointerX, pointerY, 18 + pointerStrength * 5, 0, Math.PI * 2)
    context.strokeStyle = `rgba(111, 232, 255, ${0.2 * pointerStrength})`
    context.lineWidth = 0.8
    context.stroke()
  }
  context.restore()
}

function drawParticleLogo(time: number) {
  if (!context || !logoParticles.length) return

  const compact = width < 700
  const logoRadius = compact
    ? Math.min(width * 0.36, height * 0.13)
    : Math.min(width * 0.17, height * 0.23)
  const breath = reducedMotion ? 1 : 1 + Math.sin(time * 0.42) * 0.006
  const scale = logoRadius / 540 * breath
  const centerX = compact ? width * 0.78 : width * 0.8
  const centerY = compact ? height * 0.15 : height * 0.27
  const isDark = document.documentElement.classList.contains('dark')
  const radius = compact ? 0.72 : 1.18
  const opacity = (isDark ? 0.5 : 0.38) * (0.97 + Math.sin(time * 0.45) * 0.03)

  context.save()
  context.beginPath()
  for (const particle of logoParticles) {
    const phase = particle.x * 0.014 + particle.y * 0.009
    const driftX = reducedMotion ? 0 : Math.sin(time * 0.72 + phase) * 1.25
    const driftY = reducedMotion ? 0 : Math.cos(time * 0.58 + phase * 1.21) * 1.05
    const baseX = centerX + particle.x * scale + driftX
    const baseY = centerY + particle.y * scale + driftY
    const point = warpPoint(baseX, baseY, time)
    context.moveTo(point.x + radius, point.y)
    context.arc(point.x, point.y, radius, 0, Math.PI * 2)
  }
  context.fillStyle = isDark
    ? `rgba(112, 222, 245, ${opacity})`
    : `rgba(18, 150, 219, ${opacity})`
  context.fill()
  context.restore()
}

function draw(now: number) {
  animationFrame = 0
  if (!context) return
  if (!reducedMotion && (document.hidden || !inViewport)) return

  const frameInterval = pointerStrength > 0.01 || pointerTargetStrength > 0.01 ? 20 : 28
  if (!reducedMotion && lastPaintAt && now - lastPaintAt < frameInterval) {
    animationFrame = requestAnimationFrame(draw)
    return
  }
  lastPaintAt = now
  if (!startedAt) startedAt = now

  const time = (now - startedAt) / 1000
  context.clearRect(0, 0, width, height)

  pointerX += (pointerTargetX - pointerX) * 0.115
  pointerY += (pointerTargetY - pointerY) * 0.115
  pointerStrength += (pointerTargetStrength - pointerStrength) * 0.085
  drawWarpedGrid(time)

  const points = nodes.map((node) => {
    const point = warpPoint(
      node.x * width + Math.sin(time * 0.18 + node.phase) * 8,
      node.y * height + Math.cos(time * 0.15 + node.phase) * 6,
      time
    )
    return {...point, size: node.size, phase: node.phase}
  })

  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const dx = points[i].x - points[j].x
      const dy = points[i].y - points[j].y
      const distance = Math.hypot(dx, dy)
      const limit = Math.min(170, width * 0.16)
      if (distance > limit) continue

      const alpha = (1 - distance / limit) * 0.13
      context.beginPath()
      context.moveTo(points[i].x, points[i].y)
      context.lineTo(points[j].x, points[j].y)
      context.strokeStyle = `rgba(18, 150, 219, ${alpha})`
      context.lineWidth = 0.65
      context.stroke()
    }
  }

  const flowGradient = context.createLinearGradient(0, 0, width, 0)
  flowGradient.addColorStop(0, 'rgba(18, 150, 219, 0)')
  flowGradient.addColorStop(0.28, 'rgba(18, 150, 219, 0.16)')
  flowGradient.addColorStop(0.56, 'rgba(41, 197, 223, 0.3)')
  flowGradient.addColorStop(0.78, 'rgba(91, 116, 235, 0.17)')
  flowGradient.addColorStop(1, 'rgba(91, 116, 235, 0)')

  for (let lane = 0; lane < 3; lane += 1) {
    context.beginPath()
    for (let x = -20; x <= width + 20; x += 18) {
      const progress = x / Math.max(width, 1)
      const base = height * (0.22 + lane * 0.24)
      const y = base
        + Math.sin(progress * Math.PI * (2.2 + lane * 0.28) + time * (0.22 + lane * 0.04)) * (15 + lane * 4)
        + Math.cos(progress * Math.PI * 5.2 - time * 0.15) * 5
      const point = warpPoint(x, y, time)
      if (x === -20) context.moveTo(point.x, point.y)
      else context.lineTo(point.x, point.y)
    }
    context.strokeStyle = flowGradient
    context.lineWidth = lane === 1 ? 1.15 : 0.75
    context.stroke()
  }

  for (const point of points) {
    const pulse = 0.7 + Math.sin(time * 0.8 + point.phase) * 0.3
    context.beginPath()
    context.fillStyle = `rgba(18, 150, 219, ${0.18 + pulse * 0.2})`
    context.arc(point.x, point.y, point.size + pulse, 0, Math.PI * 2)
    context.fill()
  }

  const signalProgress = (time * 0.055) % 1
  const signalX = signalProgress * width
  const signalY = height * 0.46 + Math.sin(signalProgress * Math.PI * 3.2 + time * 0.24) * 22
  const glow = context.createRadialGradient(signalX, signalY, 0, signalX, signalY, 32)
  glow.addColorStop(0, 'rgba(119, 235, 255, 0.8)')
  glow.addColorStop(0.2, 'rgba(41, 197, 223, 0.32)')
  glow.addColorStop(1, 'rgba(41, 197, 223, 0)')
  context.fillStyle = glow
  context.fillRect(signalX - 32, signalY - 32, 64, 64)

  // 最后绘制，避免环境连线和流光穿过 Logo，保持粒子剪影干净完整。
  drawParticleLogo(time)

  if (!reducedMotion && inViewport && !document.hidden) animationFrame = requestAnimationFrame(draw)
}

function startAnimation() {
  if (reducedMotion || document.hidden || !inViewport || animationFrame) return
  lastPaintAt = 0
  animationFrame = requestAnimationFrame(draw)
}

function stopAnimation() {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = 0
}

function handleVisibility() {
  if (document.hidden) {
    stopAnimation()
    return
  }
  startAnimation()
}

function handlePointerMove(event: PointerEvent) {
  if (reducedMotion || event.pointerType === 'touch' || !host) return
  const rect = host.getBoundingClientRect()
  pointerTargetX = event.clientX - rect.left
  pointerTargetY = event.clientY - rect.top
  pointerTargetStrength = 1
}

function handlePointerLeave() {
  pointerTargetStrength = 0
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  rebuildLogoParticles()
  resize()
  host = canvas.value?.closest('.vision-hero') as HTMLElement | null
  observer = new ResizeObserver(resize)
  if (canvas.value) observer.observe(canvas.value)
  viewportObserver = new IntersectionObserver(([entry]) => {
    inViewport = entry?.isIntersecting ?? true
    if (inViewport) startAnimation()
    else stopAnimation()
  }, {rootMargin: '160px 0px', threshold: 0.01})
  if (host) viewportObserver.observe(host)
  document.addEventListener('visibilitychange', handleVisibility)
  host?.addEventListener('pointermove', handlePointerMove, {passive: true})
  host?.addEventListener('pointerleave', handlePointerLeave)
  if (reducedMotion) animationFrame = requestAnimationFrame(draw)
  else startAnimation()
})

onBeforeUnmount(() => {
  stopAnimation()
  observer?.disconnect()
  viewportObserver?.disconnect()
  document.removeEventListener('visibilitychange', handleVisibility)
  host?.removeEventListener('pointermove', handlePointerMove)
  host?.removeEventListener('pointerleave', handlePointerLeave)
  host = null
})
</script>

<template>
  <div class="vision-atmosphere" aria-hidden="true">
    <span class="vision-atmosphere-orb vision-atmosphere-orb-left" />
    <span class="vision-atmosphere-orb vision-atmosphere-orb-right" />
    <canvas ref="canvas" />
  </div>
</template>

<style scoped>
.vision-atmosphere {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  mask-image: linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.9) 58%, transparent 100%);
}

.vision-atmosphere canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.78;
}

.vision-atmosphere-orb {
  position: absolute;
  width: min(64vw, 900px);
  aspect-ratio: 1.65;
  border-radius: 50%;
  filter: blur(78px);
  opacity: 0.34;
  animation: atmosphere-drift 15s ease-in-out infinite alternate;
}

.vision-atmosphere-orb-left {
  top: -16%;
  left: -18%;
  background: radial-gradient(ellipse, rgba(41, 197, 223, 0.34), rgba(18, 150, 219, 0.07) 54%, transparent 74%);
}

.vision-atmosphere-orb-right {
  top: 2%;
  right: -20%;
  background: radial-gradient(ellipse, rgba(91, 116, 235, 0.3), rgba(106, 91, 216, 0.07) 56%, transparent 75%);
  animation-delay: -7s;
  animation-direction: alternate-reverse;
}

@keyframes atmosphere-drift {
  from { transform: translate3d(-2%, -2%, 0) rotate(-3deg) scale(0.96); }
  to { transform: translate3d(6%, 8%, 0) rotate(4deg) scale(1.08); }
}

@media (prefers-reduced-motion: reduce) {
  .vision-atmosphere-orb { animation: none; }
}

@media (max-width: 640px) {
  .vision-atmosphere canvas { opacity: 0.52; }
  .vision-atmosphere-orb { width: 130vw; filter: blur(58px); }
}
</style>
