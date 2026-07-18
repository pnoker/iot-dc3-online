<template>
  <div class="cardnav-root">
    <section class="signal-section" :aria-label="content.title" data-cursor-rgb="18, 150, 219">
      <div class="signal-copy">
        <div class="signal-heading">
          <span class="signal-kicker">
            <span class="signal-live-dot" aria-hidden="true"></span>
            {{ content.kicker }}
          </span>
          <h2>{{ content.title }}</h2>
          <p>{{ content.description }}</p>
        </div>

        <div class="signal-tags" :aria-label="content.capabilitiesLabel">
          <span v-for="capability in content.capabilities" :key="capability" class="signal-tag">
            <span class="signal-tag-mark" aria-hidden="true"></span>
            {{ capability }}
          </span>
        </div>
      </div>

      <div class="sparkline-wrap" aria-hidden="true">
        <canvas ref="sparkCanvas" class="sparkline-canvas"></canvas>
        <span class="signal-scan"></span>
      </div>

      <div class="signal-footer">
        <span class="signal-footer-brand">
          <span class="signal-footer-dot" aria-hidden="true"></span>
          IoT DC3
        </span>
        <span class="signal-footer-copy">{{ content.footer }}</span>
        <span class="signal-footer-year">© 2016–2026</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))
const content = computed(() => isEnglish.value ? {
  kicker: 'LIVE INDUSTRIAL DATA FLOW',
  title: 'Keep devices, data and intelligence in motion',
  description: 'From heterogeneous device access to AI-driven decisions, IoT DC3 turns every data change into a visible and controllable real-time loop.',
  capabilitiesLabel: 'Platform capabilities',
  capabilities: ['28 multi-protocol drivers', 'Spring AI intelligence loop', 'Distributed · Multi-tenant · Open source'],
  footer: 'Distributed Industrial IoT Platform'
} : {
  kicker: 'LIVE INDUSTRIAL DATA FLOW',
  title: '让设备、数据与智能持续流动',
  description: '从异构设备接入到 AI 决策执行，IoT DC3 将每一次数据变化汇入可感知、可控制的实时闭环。',
  capabilitiesLabel: '平台能力',
  capabilities: ['28 个多协议驱动', 'Spring AI 智能闭环', '分布式 · 多租户 · 全开源'],
  footer: '分布式工业物联网平台'
})

const sparkCanvas = ref<HTMLCanvasElement | null>(null)
let raf = 0
let ctx: CanvasRenderingContext2D | null = null
let running = false
let reduced = false
let width = 0
let height = 0
let dpr = 1

function genPoints(count: number, time: number, frequency: number, amplitude: number, baseline: number): number[] {
  const points: number[] = []
  for (let index = 0; index < count; index++) {
    const x = index / (count - 1)
    const y = Math.sin(x * Math.PI * 1.7 * frequency + time * 0.7) * 0.5
      + Math.cos(x * Math.PI * 2.3 * frequency + time * 1.1) * 0.25
      + Math.sin(x * Math.PI * 4.1 * frequency + time * 0.5) * 0.15
    points.push(y * amplitude + baseline)
  }
  return points
}

function drawLine(points: number[], stroke: string | CanvasGradient, lineWidth: number) {
  if (!ctx) return
  ctx.beginPath()
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  points.forEach((point, index) => {
    const x = (index / (points.length - 1)) * width
    if (index === 0) ctx?.moveTo(x, point)
    else ctx?.lineTo(x, point)
  })
  ctx.stroke()
}

function pointOnLine(points: number[], progress: number) {
  const position = progress * (points.length - 1)
  const index = Math.floor(position)
  const nextIndex = Math.min(points.length - 1, index + 1)
  const fraction = position - index
  return points[index] + (points[nextIndex] - points[index]) * fraction
}

function paint(time: number) {
  if (!ctx || !width || !height) return
  ctx.clearRect(0, 0, width, height)

  const count = Math.max(90, Math.floor(width / 4))
  const top = height * 0.08
  const bottom = height * 0.94
  const middle = (top + bottom) / 2
  const amplitude = (bottom - top) * 0.34
  const isDark = document.documentElement.classList.contains('dark')

  const gridGradient = ctx.createLinearGradient(0, top, 0, bottom)
  gridGradient.addColorStop(0, isDark ? 'rgba(116, 206, 255, 0)' : 'rgba(18, 150, 219, 0)')
  gridGradient.addColorStop(0.5, isDark ? 'rgba(116, 206, 255, 0.08)' : 'rgba(18, 150, 219, 0.07)')
  gridGradient.addColorStop(1, isDark ? 'rgba(116, 206, 255, 0)' : 'rgba(18, 150, 219, 0)')
  ctx.strokeStyle = gridGradient
  ctx.lineWidth = 1
  for (let column = 0; column <= 24; column++) {
    const x = (column / 24) * width
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke()
  }
  for (let row = 1; row < 5; row++) {
    const y = top + ((bottom - top) / 5) * row
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }

  const rear = genPoints(count, time * 0.24, 0.68, amplitude * 0.58, middle - amplitude * 0.12)
  const secondary = genPoints(count, time * 0.42, 0.96, amplitude * 0.76, middle + amplitude * 0.04)
  const main = genPoints(count, time * 0.72, 1.28, amplitude, middle)
  const echo = genPoints(count, time * 0.52, 1.64, amplitude * 0.43, middle + amplitude * 0.22)

  drawLine(rear, isDark ? 'rgba(110, 210, 255, 0.1)' : 'rgba(18, 150, 219, 0.08)', 1)
  drawLine(secondary, isDark ? 'rgba(77, 223, 218, 0.17)' : 'rgba(27, 178, 165, 0.14)', 1.2)
  drawLine(echo, isDark ? 'rgba(164, 169, 255, 0.14)' : 'rgba(91, 116, 235, 0.12)', 1)

  const mainGradient = ctx.createLinearGradient(0, 0, width, 0)
  mainGradient.addColorStop(0, 'rgba(18, 150, 219, 0.08)')
  mainGradient.addColorStop(0.2, isDark ? 'rgba(98, 205, 255, 0.78)' : 'rgba(18, 150, 219, 0.68)')
  mainGradient.addColorStop(0.52, isDark ? 'rgba(80, 226, 215, 0.82)' : 'rgba(27, 178, 165, 0.72)')
  mainGradient.addColorStop(0.78, isDark ? 'rgba(169, 173, 255, 0.76)' : 'rgba(91, 116, 235, 0.66)')
  mainGradient.addColorStop(1, 'rgba(91, 116, 235, 0.08)')

  ctx.beginPath()
  main.forEach((point, index) => {
    const x = (index / (main.length - 1)) * width
    if (index === 0) ctx?.moveTo(x, point)
    else ctx?.lineTo(x, point)
  })
  ctx.lineTo(width, bottom)
  ctx.lineTo(0, bottom)
  ctx.closePath()
  const area = ctx.createLinearGradient(0, top, 0, bottom)
  area.addColorStop(0, isDark ? 'rgba(48, 183, 242, 0.14)' : 'rgba(18, 150, 219, 0.13)')
  area.addColorStop(0.42, isDark ? 'rgba(37, 157, 211, 0.05)' : 'rgba(18, 150, 219, 0.04)')
  area.addColorStop(1, 'rgba(18, 150, 219, 0)')
  ctx.fillStyle = area
  ctx.fill()

  const stemStep = Math.max(12, Math.floor(count / 15))
  ctx.strokeStyle = isDark ? 'rgba(116, 212, 255, 0.12)' : 'rgba(18, 150, 219, 0.09)'
  ctx.lineWidth = 1
  for (let index = stemStep; index < count - stemStep; index += stemStep) {
    const x = (index / (count - 1)) * width
    ctx.beginPath(); ctx.moveTo(x, main[index]); ctx.lineTo(x, bottom); ctx.stroke()
  }

  ctx.save()
  ctx.shadowColor = isDark ? 'rgba(78, 201, 255, 0.42)' : 'rgba(18, 150, 219, 0.28)'
  ctx.shadowBlur = 18
  drawLine(main, mainGradient, 2)
  ctx.restore()

  for (const offset of [0, 0.34, 0.68]) {
    const progress = (time * 0.045 + offset) % 1
    const x = progress * width
    const y = pointOnLine(main, progress)
    const halo = ctx.createRadialGradient(x, y, 0, x, y, 14)
    halo.addColorStop(0, 'rgba(229, 253, 255, 0.95)')
    halo.addColorStop(0.22, 'rgba(80, 215, 241, 0.72)')
    halo.addColorStop(1, 'rgba(18, 150, 219, 0)')
    ctx.beginPath(); ctx.fillStyle = halo; ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.fillStyle = isDark ? '#dcfbff' : '#ffffff'; ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill()
  }

  for (let index = 1; index < count - 1; index++) {
    if (main[index] > main[index - 1] && main[index] > main[index + 1] && index % 3 === 0) {
      const x = (index / (count - 1)) * width
      ctx.beginPath()
      ctx.fillStyle = isDark ? 'rgba(153, 231, 255, 0.56)' : 'rgba(18, 150, 219, 0.46)'
      ctx.arc(x, main[index], 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const fadeWidth = width * 0.025
  const edgeFade = ctx.createLinearGradient(0, 0, width, 0)
  edgeFade.addColorStop(0, 'rgba(0,0,0,0)')
  edgeFade.addColorStop(fadeWidth / width, 'rgba(0,0,0,1)')
  edgeFade.addColorStop(1 - fadeWidth / width, 'rgba(0,0,0,1)')
  edgeFade.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = edgeFade
  ctx.globalCompositeOperation = 'destination-in'
  ctx.fillRect(0, 0, width, height)
  ctx.globalCompositeOperation = 'source-over'
}

function frame(now: number) {
  if (!running || !ctx) return
  paint(now / 1000)
  raf = requestAnimationFrame(frame)
}

function resize() {
  const canvas = sparkCanvas.value
  const parent = canvas?.parentElement
  if (!canvas || !parent) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = parent.clientWidth
  height = parent.clientHeight
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx = canvas.getContext('2d')
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

function handleVisibility() {
  document.hidden ? stop() : start()
}

let resizeObserver: ResizeObserver | null = null
let themeObserver: MutationObserver | null = null

onMounted(() => {
  reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  resize()
  resizeObserver = new ResizeObserver(() => {
    resize()
    if (!running) paint(0)
  })
  const parent = sparkCanvas.value?.parentElement
  if (parent) resizeObserver.observe(parent)
  themeObserver = new MutationObserver(() => {
    if (reduced) paint(0)
  })
  themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['class']})

  if (reduced) paint(0)
  else {
    document.addEventListener('visibilitychange', handleVisibility)
    start()
  }

})

onBeforeUnmount(() => {
  stop()
  resizeObserver?.disconnect()
  themeObserver?.disconnect()
  document.removeEventListener('visibilitychange', handleVisibility)
  ctx = null
})
</script>

<style scoped>
.cardnav-root {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
}

.signal-section {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  width: 100vw;
  min-height: 340px;
  margin-left: calc(-50vw + 50%);
  padding: 58px 32px 0;
  overflow: hidden;
  border-top: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  background:
    radial-gradient(circle at 18% 18%, rgba(18, 150, 219, 0.1), transparent 28%),
    radial-gradient(circle at 82% 34%, rgba(91, 116, 235, 0.08), transparent 30%),
    linear-gradient(180deg, transparent, color-mix(in srgb, var(--vp-c-bg-alt) 76%, transparent));
}

.signal-section::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 12%;
  width: 76%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(102, 217, 255, 0.68), rgba(159, 164, 255, 0.56), transparent);
  box-shadow: 0 0 24px rgba(18, 150, 219, 0.34);
}

.signal-copy {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
  gap: 56px;
  align-items: end;
  width: min(1152px, 100%);
  margin: 0 auto;
}

.signal-kicker {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 720;
  letter-spacing: 0.16em;
}

.signal-live-dot,
.signal-footer-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2fc8dc;
  box-shadow: 0 0 0 4px rgba(47, 200, 220, 0.12), 0 0 14px rgba(47, 200, 220, 0.66);
  animation: signal-pulse 2.4s ease-in-out infinite;
}

.signal-heading h2 {
  margin: 14px 0 12px;
  color: var(--vp-c-text-1);
  font-size: clamp(28px, 3vw, 42px);
  line-height: 1.16;
  letter-spacing: -0.035em;
}

.signal-heading p {
  max-width: 680px;
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.75;
}

.signal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.signal-tag {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  min-height: 42px;
  padding: 9px 14px;
  border: 1px solid rgba(151, 219, 248, 0.24);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.68), transparent 42%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(18, 150, 219, 0.08) 56%, rgba(91, 116, 235, 0.06));
  box-shadow: 0 12px 30px rgba(16, 96, 161, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px) saturate(1.3);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 620;
}

.signal-tag-mark {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #29c5df, #6773e5);
  box-shadow: 0 0 10px rgba(41, 197, 223, 0.54);
}

.sparkline-wrap {
  position: relative;
  flex: 1 0 clamp(190px, 25vh, 280px);
  width: calc(100% + 64px);
  min-height: clamp(190px, 25vh, 280px);
  margin: 28px -32px 0;
  overflow: hidden;
}

.sparkline-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.signal-scan {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -24%;
  width: 24%;
  background: linear-gradient(90deg, transparent, rgba(117, 225, 255, 0.08), rgba(255, 255, 255, 0.2), transparent);
  filter: blur(6px);
  transform: skewX(-10deg);
  animation: signal-scan 8s linear infinite;
}

.signal-footer {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 18px;
  align-items: center;
  width: min(1152px, 100%);
  margin: 0 auto;
  padding: 20px 0 28px;
  border-top: 1px solid color-mix(in srgb, var(--vp-c-divider) 72%, transparent);
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.signal-footer-brand {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 720;
}

.signal-footer-copy {
  letter-spacing: 0.04em;
}

.signal-footer-year {
  font-variant-numeric: tabular-nums;
}

:global(.dark .signal-section) {
  border-top-color: rgba(108, 206, 250, 0.1);
  background:
    radial-gradient(circle at 18% 18%, rgba(21, 142, 211, 0.13), transparent 28%),
    radial-gradient(circle at 82% 34%, rgba(91, 95, 208, 0.12), transparent 30%),
    linear-gradient(180deg, transparent, rgba(8, 15, 24, 0.82));
}

:global(.dark .signal-tag) {
  border-color: rgba(143, 216, 250, 0.14);
  background:
    radial-gradient(circle at 16% 0%, rgba(205, 245, 255, 0.11), transparent 42%),
    linear-gradient(135deg, rgba(22, 113, 169, 0.1), rgba(17, 35, 52, 0.3) 58%, rgba(61, 62, 143, 0.11));
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(232, 251, 255, 0.08);
}

@keyframes signal-pulse {
  0%, 100% { opacity: 0.72; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.08); }
}

@keyframes signal-scan {
  to { left: 112%; }
}

@media (max-width: 900px) {
  .signal-copy {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .signal-tags {
    justify-content: flex-start;
  }
}

@media (min-width: 960px) {
  .signal-section {
    padding-top: clamp(28px, calc(6.25vh - 17px), 58px);
  }

  .signal-copy {
    gap: clamp(28px, calc(5.833vh - 14px), 56px);
  }

  .signal-kicker {
    font-size: clamp(11px, calc(0.208vh + 9.5px), 12px);
  }

  .signal-heading h2 {
    margin: clamp(8px, calc(1.25vh - 1px), 14px) 0 clamp(8px, calc(0.833vh + 2px), 12px);
    font-size: clamp(27px, calc(3.125vh + 4.5px), 42px);
  }

  .signal-heading p {
    font-size: clamp(14px, calc(0.417vh + 11px), 16px);
    line-height: clamp(22px, calc(1.25vh + 13px), 28px);
  }

  .signal-tags {
    gap: clamp(8px, calc(0.417vh + 5px), 10px);
  }

  .signal-tag {
    min-height: clamp(36px, calc(1.25vh + 27px), 42px);
    padding: clamp(7px, calc(0.417vh + 4px), 9px) clamp(12px, calc(0.417vh + 9px), 14px);
    font-size: clamp(12px, calc(0.208vh + 10.5px), 13px);
  }

  .sparkline-wrap {
    flex-basis: clamp(150px, 17vh, 240px);
    min-height: clamp(150px, 17vh, 240px);
    margin-top: clamp(-28px, calc(11vh - 110px), 20px);
  }

  .signal-footer {
    padding-top: clamp(13px, calc(1.458vh + 2.5px), 20px);
    padding-bottom: clamp(18px, calc(2.083vh + 3px), 28px);
  }
}

@media (max-width: 640px) {
  .signal-section {
    padding: 42px 20px 0;
  }

  .signal-heading h2 {
    font-size: 28px;
  }

  .signal-heading p {
    font-size: 15px;
  }

  .signal-tags {
    display: grid;
    grid-template-columns: 1fr;
  }

  .signal-tag {
    width: 100%;
  }

  .sparkline-wrap {
    width: calc(100% + 40px);
    flex-basis: 180px;
    min-height: 180px;
    margin: 22px -20px 0;
  }

  .signal-footer {
    grid-template-columns: 1fr auto;
    gap: 8px 14px;
    padding-bottom: 22px;
  }

  .signal-footer-copy {
    grid-column: 1 / -1;
    grid-row: 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .signal-live-dot,
  .signal-footer-dot,
  .signal-scan {
    animation: none;
  }
}
</style>
