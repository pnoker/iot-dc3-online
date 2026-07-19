<script lang="ts" setup>
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath === 'en/index.md')
const isLocalizedHome = computed(() => ['zh/index.md', 'en/index.md'].includes(page.value.relativePath))

const actions = computed(() => isEnglish.value ? [
  {
    title: 'Documentation',
    description: 'Explore architecture, deployment, and driver development to get started with IoT DC3',
    link: 'https://docs.dc3.site',
    icon: 'document',
    cursorRgb: '18, 150, 219'
  },
  {
    title: 'Book',
    description: 'AIoT Technology & Practice: from IoT platforms to intelligent agent applications',
    link: 'https://book.dc3.site',
    icon: 'book',
    cursorRgb: '27, 178, 165'
  },
  {
    title: 'Demo',
    description: 'Try device connectivity, data collection, and intelligent management online',
    link: 'https://demo.dc3.site',
    icon: 'demo',
    cursorRgb: '91, 116, 235'
  }
] : [
  {
    title: '文档',
    description: '从架构、部署到驱动开发，快速掌握 IoT DC3',
    link: 'https://docs.dc3.site',
    icon: 'document',
    cursorRgb: '18, 150, 219'
  },
  {
    title: '书籍',
    description: '《AIoT 技术与实践》：从物联网平台到智能体应用',
    link: 'https://book.dc3.site',
    icon: 'book',
    cursorRgb: '27, 178, 165'
  },
  {
    title: '演示',
    description: '在线体验设备接入、数据采集与智能管理',
    link: 'https://demo.dc3.site',
    icon: 'demo',
    cursorRgb: '91, 116, 235'
  }
])

function trackPointer(event: PointerEvent) {
  if (event.pointerType === 'touch') return

  const card = event.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const rotateX = ((y / rect.height) - 0.5) * -7
  const rotateY = ((x / rect.width) - 0.5) * 7

  card.style.setProperty('--glow-x', `${x}px`)
  card.style.setProperty('--glow-y', `${y}px`)
  card.style.setProperty('--rotate-x', `${rotateX}deg`)
  card.style.setProperty('--rotate-y', `${rotateY}deg`)
}

function resetPointer(event: PointerEvent) {
  const card = event.currentTarget as HTMLElement
  card.style.setProperty('--rotate-x', '0deg')
  card.style.setProperty('--rotate-y', '0deg')
}
</script>

<template>
  <nav v-if="isLocalizedHome" class="hero-action-grid" :aria-label="isEnglish ? 'Quick links' : '快速入口'">
    <a
      v-for="action in actions"
      :key="action.link"
      class="hero-action-card"
      :href="action.link"
      :data-cursor-rgb="action.cursorRgb"
      :aria-label="`${action.title}${isEnglish ? ': ' : '：'}${action.description}`"
      @pointermove="trackPointer"
      @pointerleave="resetPointer"
    >
      <span class="card-aurora" aria-hidden="true"></span>

      <span class="card-icon" aria-hidden="true">
        <svg v-if="action.icon === 'document'" viewBox="0 0 24 24">
          <path d="M7 3.75h7.2L18 7.55v12.7H7z" />
          <path d="M14 3.75v4h4M9.75 11h5.5M9.75 14.25h5.5M9.75 17.5h3.5" />
        </svg>
        <svg v-else-if="action.icon === 'book'" viewBox="0 0 24 24">
          <path d="M4.75 5.5A2.75 2.75 0 0 1 7.5 2.75H12v16.5H7.5a2.75 2.75 0 0 0-2.75 2.75z" />
          <path d="M19.25 5.5a2.75 2.75 0 0 0-2.75-2.75H12v16.5h4.5A2.75 2.75 0 0 1 19.25 22z" />
        </svg>
        <svg v-else viewBox="0 0 24 24">
          <rect x="3.5" y="4.25" width="17" height="15.5" rx="3" />
          <path d="m10 8.75 5 3.25-5 3.25zM7 2.25v2M17 2.25v2" />
        </svg>
      </span>

      <span class="card-copy">
        <span class="card-title">{{ action.title }}</span>
        <span class="card-description">{{ action.description }}</span>
      </span>

      <span class="card-arrow" aria-hidden="true">
        <svg viewBox="0 0 20 20">
          <path d="M4 10h11M11 6l4 4-4 4" />
        </svg>
      </span>
    </a>
  </nav>
</template>

<style scoped>
.hero-action-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  padding-top: 30px;
  perspective: 1200px;
}

.hero-action-card {
  --card-rgb: 18, 150, 219;
  --glow-x: 50%;
  --glow-y: 50%;
  --rotate-x: 0deg;
  --rotate-y: 0deg;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 164px;
  padding: 20px;
  overflow: hidden;
  border: 1px solid rgba(151, 219, 248, 0.28);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.74), transparent 40%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.44), rgba(var(--card-rgb), 0.1) 52%, rgba(77, 83, 199, 0.07));
  color: var(--vp-c-text-1);
  text-decoration: none;
  box-shadow:
    0 20px 46px rgba(16, 96, 161, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.84),
    inset 0 -12px 28px rgba(57, 119, 196, 0.05);
  backdrop-filter: blur(20px) saturate(1.35);
  -webkit-backdrop-filter: blur(20px) saturate(1.35);
  transform: translateY(0) rotateX(var(--rotate-x)) rotateY(var(--rotate-y));
  transform-style: preserve-3d;
  transition:
    transform 180ms ease-out,
    border-color 360ms ease,
    box-shadow 360ms ease;
}

.hero-action-card:nth-child(2) {
  --card-rgb: 27, 178, 165;
}

.hero-action-card:nth-child(3) {
  --card-rgb: 91, 116, 235;
}

.hero-action-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  z-index: 0;
  padding: 1px;
  border-radius: inherit;
  background: conic-gradient(
    from 180deg at 50% 50%,
    transparent 0deg,
    rgba(var(--card-rgb), 0.08) 70deg,
    rgba(var(--card-rgb), 0.82) 116deg,
    transparent 152deg,
    transparent 360deg
  );
  opacity: 0.36;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: border-orbit 7s linear infinite;
  pointer-events: none;
}

.hero-action-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background: radial-gradient(
    220px circle at var(--glow-x) var(--glow-y),
    rgba(var(--card-rgb), 0.2),
    rgba(var(--card-rgb), 0.06) 38%,
    transparent 72%
  );
  opacity: 0;
  transition: opacity 320ms ease;
  pointer-events: none;
}

.hero-action-card:hover {
  border-color: rgba(var(--card-rgb), 0.32);
  color: var(--vp-c-text-1);
  box-shadow:
    0 26px 58px rgba(16, 96, 161, 0.15),
    0 10px 28px rgba(var(--card-rgb), 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    inset 0 -12px 28px rgba(var(--card-rgb), 0.07);
  transform: translateY(-7px) rotateX(var(--rotate-x)) rotateY(var(--rotate-y));
}

.hero-action-card:hover::after {
  opacity: 1;
}

.hero-action-card:active {
  transform: translateY(-3px) scale(0.985);
  transition-duration: 80ms;
}

.hero-action-card:focus-visible {
  outline: 3px solid rgba(var(--card-rgb), 0.28);
  outline-offset: 4px;
}

.card-aurora {
  position: absolute;
  top: -76px;
  right: -64px;
  z-index: 0;
  width: 170px;
  height: 150px;
  border-radius: 50%;
  background: rgba(var(--card-rgb), 0.18);
  filter: blur(44px);
  opacity: 0.62;
  transform: translate3d(0, 0, 0);
  transition: opacity 360ms ease, transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.hero-action-card:hover .card-aurora {
  opacity: 1;
  transform: translate3d(-18px, 18px, 0) scale(1.2);
}

.card-icon,
.card-copy,
.card-arrow {
  position: relative;
  z-index: 1;
  transform: translateZ(22px);
}

.card-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  margin-bottom: 15px;
  border: 1px solid rgba(var(--card-rgb), 0.2);
  border-radius: 12px;
  background:
    radial-gradient(circle at 25% 10%, rgba(255, 255, 255, 0.64), transparent 42%),
    linear-gradient(145deg, rgba(var(--card-rgb), 0.17), rgba(var(--card-rgb), 0.06));
  color: rgb(var(--card-rgb));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.56);
  transition: transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 420ms ease;
}

.card-icon svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.hero-action-card:hover .card-icon {
  box-shadow: 0 10px 22px rgba(var(--card-rgb), 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.72);
  transform: translateY(-2px) rotate(-4deg) translateZ(28px);
}

.card-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  padding-right: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 720;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.card-description {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.55;
  transition: color 320ms ease;
}

.hero-action-card:hover .card-description {
  color: color-mix(in srgb, var(--vp-c-text-1) 78%, rgb(var(--card-rgb)));
}

.card-arrow {
  position: absolute;
  right: 17px;
  bottom: 18px;
  display: grid;
  place-items: center;
  width: 27px;
  height: 27px;
  border: 1px solid rgba(var(--card-rgb), 0.16);
  border-radius: 50%;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 84%, transparent);
  color: rgb(var(--card-rgb));
  opacity: 0.72;
  transition: transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 360ms ease, background-color 360ms ease;
}

.card-arrow svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.hero-action-card:hover .card-arrow {
  background: rgba(var(--card-rgb), 0.12);
  opacity: 1;
  transform: translateX(3px) translateZ(28px);
}

:global(.dark .hero-action-card) {
  border-color: rgba(143, 216, 250, 0.16);
  background:
    radial-gradient(circle at 16% 0%, rgba(205, 245, 255, 0.13), transparent 40%),
    linear-gradient(135deg, rgba(var(--card-rgb), 0.11), rgba(17, 35, 52, 0.3) 52%, rgba(61, 62, 143, 0.12));
  box-shadow:
    0 22px 50px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(232, 251, 255, 0.1),
    inset 0 -12px 28px rgba(0, 0, 0, 0.12);
}

:global(.dark .hero-action-card:hover) {
  border-color: rgba(var(--card-rgb), 0.42);
  box-shadow:
    0 26px 58px rgba(0, 0, 0, 0.34),
    0 8px 28px rgba(var(--card-rgb), 0.12),
    inset 0 1px 0 rgba(232, 251, 255, 0.15),
    inset 0 -12px 28px rgba(var(--card-rgb), 0.07);
}

:global(.dark .hero-action-card .card-icon) {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

@keyframes border-orbit {
  to {
    transform: rotate(1turn);
  }
}

@media (max-width: 1080px) and (min-width: 641px) {
  .hero-action-grid {
    max-width: 680px;
    margin-right: auto;
    margin-left: auto;
  }
}

@media (min-width: 960px) {
  .hero-action-grid {
    gap: clamp(10px, calc(0.417vh + 7px), 12px);
    padding-top: clamp(18px, 2.5vh, 30px);
  }

  .hero-action-card {
    min-height: clamp(140px, calc(5vh + 104px), 164px);
    padding: clamp(14px, calc(1.25vh + 5px), 20px);
  }

  .card-icon {
    width: clamp(34px, calc(1.25vh + 25px), 40px);
    height: clamp(34px, calc(1.25vh + 25px), 40px);
    margin-bottom: clamp(8px, calc(1.458vh - 2.5px), 15px);
  }

  .card-icon svg {
    width: clamp(19px, calc(0.625vh + 14.5px), 22px);
    height: clamp(19px, calc(0.625vh + 14.5px), 22px);
  }

  .card-copy {
    gap: clamp(4px, calc(0.417vh + 1px), 6px);
  }

  .card-title {
    font-size: clamp(16.5px, calc(0.313vh + 14.25px), 18px);
  }

  .card-description {
    font-size: clamp(12px, calc(0.208vh + 10.5px), 13px);
  }

  .card-arrow {
    right: clamp(14px, calc(0.625vh + 9.5px), 17px);
    bottom: clamp(14px, calc(0.833vh + 8px), 18px);
    width: clamp(25px, calc(0.417vh + 22px), 27px);
    height: clamp(25px, calc(0.417vh + 22px), 27px);
  }
}

@media (max-width: 640px) {
  .hero-action-grid {
    grid-template-columns: 1fr;
    gap: 10px;
    padding-top: 24px;
  }

  .hero-action-card {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) 30px;
    column-gap: 14px;
    align-items: center;
    min-height: 108px;
    padding: 18px;
    text-align: left;
  }

  .card-icon {
    margin-bottom: 0;
  }

  .card-copy {
    gap: 4px;
    padding-right: 0;
  }

  .card-arrow {
    position: static;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-action-card,
  .card-aurora,
  .card-icon,
  .card-arrow {
    transition-duration: 0.01ms !important;
  }

  .hero-action-card,
  .hero-action-card:hover,
  .hero-action-card:active {
    transform: none;
  }

  .hero-action-card::before {
    animation: none;
  }
}
</style>
