<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'

const DEFAULT_CURSOR_RGB = '18, 150, 219'
const INTERACTIVE_SELECTOR = 'a, button, summary, label, select, [role="button"], [tabindex]:not([tabindex="-1"]), input, textarea'
const TEXT_INPUT_SELECTOR = 'textarea, [contenteditable="true"], input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"])'

const cursorRing = ref<HTMLElement | null>(null)
const cursorDot = ref<HTMLElement | null>(null)
const cursorEnabled = ref(false)
const cursorVisible = ref(false)
const cursorPressed = ref(false)
const cursorPulse = ref(false)
const cursorInteractive = ref(false)
const cursorText = ref(false)
const cursorRgb = ref(DEFAULT_CURSOR_RGB)

let targetX = 0
let targetY = 0
let ringX = 0
let ringY = 0
let hasPosition = false
let cursorFrame = 0
let pulseFrame = 0
let pulseTimer = 0
let pointerQuery: MediaQueryList | null = null
let motionQuery: MediaQueryList | null = null

function placeCursor(element: HTMLElement | null, x: number, y: number) {
  element?.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0)`)
}

function animateCursor() {
  ringX += (targetX - ringX) * 0.2
  ringY += (targetY - ringY) * 0.2
  placeCursor(cursorRing.value, ringX, ringY)

  const distance = Math.abs(targetX - ringX) + Math.abs(targetY - ringY)
  if (cursorVisible.value || distance > 0.1) {
    cursorFrame = requestAnimationFrame(animateCursor)
  } else {
    cursorFrame = 0
  }
}

function startCursorAnimation() {
  if (!cursorFrame) cursorFrame = requestAnimationFrame(animateCursor)
}

function updateCursorMode(target: EventTarget | null) {
  const element = target instanceof Element ? target : null
  const accentElement = element?.closest<HTMLElement>('[data-cursor-rgb]')

  cursorRgb.value = accentElement?.dataset.cursorRgb || DEFAULT_CURSOR_RGB
  cursorInteractive.value = Boolean(element?.closest(INTERACTIVE_SELECTOR))
  cursorText.value = Boolean(element?.closest(TEXT_INPUT_SELECTOR))
}

function trackPointer(event: PointerEvent) {
  if (!cursorEnabled.value || event.pointerType === 'touch') return

  targetX = event.clientX
  targetY = event.clientY
  if (!hasPosition) {
    ringX = targetX
    ringY = targetY
    hasPosition = true
    placeCursor(cursorRing.value, ringX, ringY)
    document.documentElement.classList.add('dc3-custom-cursor')
  }

  placeCursor(cursorDot.value, targetX, targetY)
  cursorVisible.value = true
  updateCursorMode(event.target)
  startCursorAnimation()
}

function hideCursor() {
  cursorVisible.value = false
  cursorPressed.value = false
}

function handlePointerOut(event: PointerEvent) {
  if (!event.relatedTarget) hideCursor()
}

function pressCursor(event: PointerEvent) {
  if (cursorEnabled.value && event.pointerType !== 'touch') cursorPressed.value = true
}

function releaseCursor(event: PointerEvent) {
  if (!cursorEnabled.value || event.pointerType === 'touch') return

  cursorPressed.value = false
  cursorPulse.value = false
  if (pulseFrame) cancelAnimationFrame(pulseFrame)
  if (pulseTimer) window.clearTimeout(pulseTimer)
  pulseFrame = requestAnimationFrame(() => {
    cursorPulse.value = true
    pulseTimer = window.setTimeout(() => {
      cursorPulse.value = false
      pulseTimer = 0
    }, 420)
  })
}

function syncCursorCapability() {
  const enabled = Boolean(pointerQuery?.matches && !motionQuery?.matches)
  cursorEnabled.value = enabled
  document.documentElement.classList.toggle('dc3-custom-cursor', enabled && hasPosition)
  if (!enabled) {
    hasPosition = false
    hideCursor()
  }
}

onMounted(() => {
  pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncCursorCapability()

  pointerQuery.addEventListener('change', syncCursorCapability)
  motionQuery.addEventListener('change', syncCursorCapability)
  window.addEventListener('pointermove', trackPointer, {passive: true})
  window.addEventListener('pointerout', handlePointerOut, {passive: true})
  window.addEventListener('pointerdown', pressCursor, {passive: true})
  window.addEventListener('pointerup', releaseCursor, {passive: true})
  window.addEventListener('pointercancel', hideCursor, {passive: true})
  window.addEventListener('blur', hideCursor)
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('dc3-custom-cursor')
  pointerQuery?.removeEventListener('change', syncCursorCapability)
  motionQuery?.removeEventListener('change', syncCursorCapability)
  window.removeEventListener('pointermove', trackPointer)
  window.removeEventListener('pointerout', handlePointerOut)
  window.removeEventListener('pointerdown', pressCursor)
  window.removeEventListener('pointerup', releaseCursor)
  window.removeEventListener('pointercancel', hideCursor)
  window.removeEventListener('blur', hideCursor)
  if (cursorFrame) cancelAnimationFrame(cursorFrame)
  if (pulseFrame) cancelAnimationFrame(pulseFrame)
  if (pulseTimer) window.clearTimeout(pulseTimer)
})
</script>

<template>
  <span
    v-if="cursorEnabled"
    ref="cursorRing"
    class="dc3-cursor-position dc3-cursor-ring-position"
    :class="{
      'is-visible': cursorVisible,
      'is-pressed': cursorPressed,
      'is-pulsing': cursorPulse,
      'is-interactive': cursorInteractive,
      'is-text': cursorText
    }"
    :style="{'--cursor-rgb': cursorRgb}"
    aria-hidden="true"
  >
    <span class="dc3-cursor-ring"></span>
  </span>
  <span
    v-if="cursorEnabled"
    ref="cursorDot"
    class="dc3-cursor-position dc3-cursor-dot-position"
    :class="{
      'is-visible': cursorVisible,
      'is-pressed': cursorPressed,
      'is-interactive': cursorInteractive,
      'is-text': cursorText
    }"
    :style="{'--cursor-rgb': cursorRgb}"
    aria-hidden="true"
  >
    <span class="dc3-cursor-dot"></span>
  </span>
</template>

<style>
@media (hover: hover) and (pointer: fine) {
  html.dc3-custom-cursor,
  html.dc3-custom-cursor body,
  html.dc3-custom-cursor body * {
    cursor: none !important;
  }
}

.dc3-cursor-position {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2147483646;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
  will-change: transform;
  transition: opacity 140ms ease;
}

.dc3-cursor-position.is-visible {
  opacity: 1;
}

.dc3-cursor-ring,
.dc3-cursor-dot {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    height 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 180ms ease,
    border-radius 220ms ease;
}

.dc3-cursor-ring {
  width: 38px;
  height: 38px;
  border: 1px solid rgba(var(--cursor-rgb), 0.5);
  background: radial-gradient(circle, rgba(var(--cursor-rgb), 0.07), transparent 66%);
  box-shadow:
    0 0 22px rgba(var(--cursor-rgb), 0.2),
    inset 0 0 12px rgba(var(--cursor-rgb), 0.08);
  backdrop-filter: blur(1.5px);
}

.dc3-cursor-ring::before {
  content: '';
  position: absolute;
  inset: -2px;
  padding: 1px;
  border-radius: inherit;
  background: conic-gradient(
    from 30deg,
    rgba(var(--cursor-rgb), 0.95),
    rgba(var(--cursor-rgb), 0.12) 82deg,
    transparent 145deg,
    transparent 300deg,
    rgba(var(--cursor-rgb), 0.95)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: dc3-cursor-orbit 2.6s linear infinite;
}

.dc3-cursor-ring::after {
  content: '';
  position: absolute;
  inset: -1px;
  border: 1px solid rgba(var(--cursor-rgb), 0.62);
  border-radius: inherit;
  opacity: 0;
}

.dc3-cursor-dot {
  width: 7px;
  height: 7px;
  background: rgb(var(--cursor-rgb));
  box-shadow:
    0 0 0 3px rgba(var(--cursor-rgb), 0.12),
    0 0 14px rgba(var(--cursor-rgb), 0.72);
}

.dc3-cursor-ring-position.is-interactive .dc3-cursor-ring {
  width: 52px;
  height: 52px;
  background: radial-gradient(circle, rgba(var(--cursor-rgb), 0.13), transparent 68%);
}

.dc3-cursor-dot-position.is-interactive .dc3-cursor-dot {
  transform: translate(-50%, -50%) scale(1.2);
}

.dc3-cursor-ring-position.is-text .dc3-cursor-ring {
  width: 2px;
  height: 28px;
  border: 0;
  border-radius: 2px;
  background: rgb(var(--cursor-rgb));
  box-shadow: 0 0 10px rgba(var(--cursor-rgb), 0.5);
  backdrop-filter: none;
}

.dc3-cursor-ring-position.is-text .dc3-cursor-ring::before {
  display: none;
}

.dc3-cursor-dot-position.is-text .dc3-cursor-dot {
  opacity: 0;
}

.dc3-cursor-ring-position.is-pressed .dc3-cursor-ring {
  transform: translate(-50%, -50%) scale(0.78);
}

.dc3-cursor-dot-position.is-pressed .dc3-cursor-dot {
  transform: translate(-50%, -50%) scale(1.7);
}

.dc3-cursor-ring-position.is-pulsing .dc3-cursor-ring::after {
  animation: dc3-cursor-pulse 420ms ease-out;
}

@keyframes dc3-cursor-orbit {
  to {
    transform: rotate(1turn);
  }
}

@keyframes dc3-cursor-pulse {
  0% {
    opacity: 0.72;
    transform: scale(0.82);
  }
  100% {
    opacity: 0;
    transform: scale(1.85);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dc3-cursor-position {
    display: none;
  }
}
</style>
