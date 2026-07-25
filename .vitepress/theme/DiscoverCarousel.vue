<template>
  <section
    class="discover-card"
    data-cursor-rgb="18, 150, 219"
    @mouseenter="pause"
    @mouseleave="resume"
    @focusin="pause"
    @focusout="resume"
  >
    <div class="discover-carousel">
      <Transition name="discover-slide" mode="out-in">
        <article
          :key="active"
          class="discover-slide"
          :class="{'is-cover-only': slides[active].coverOnly}"
          aria-live="off"
        >
          <a
            v-if="slides[active].coverOnly"
            :href="slides[active].link"
            class="discover-cover-feature"
            :aria-label="slides[active].action"
          >
            <BookCover :english="isEnglish" />
          </a>
          <template v-else>
            <strong>{{ slides[active].title }}</strong>
            <p>{{ slides[active].description }}</p>
            <div class="discover-actions">
              <a :href="slides[active].link" class="discover-link">
                {{ slides[active].action }}
                <span aria-hidden="true">↗</span>
              </a>
              <a
                v-if="slides[active].secondaryLink"
                :href="slides[active].secondaryLink"
                class="discover-link is-secondary"
              >
                {{ slides[active].secondaryAction }}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </template>
        </article>
      </Transition>

      <div class="discover-pagination" :aria-label="copy.paginationLabel">
        <button
          v-for="(_, index) in slides"
          :key="index"
          type="button"
          :class="{'is-active': index === active}"
          :aria-label="`${copy.slideLabel} ${index + 1}`"
          :aria-current="index === active ? 'true' : undefined"
          @click="select(index)"
        ></button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref} from 'vue'
import {useData} from 'vitepress'

type Slide = {
  title: string
  description: string
  action: string
  link: string
  coverOnly?: boolean
  secondaryAction?: string
  secondaryLink?: string
}

const BookCover = defineAsyncComponent(() => import('./BookCover.vue'))

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))
const copy = computed(() => isEnglish.value ? {
  paginationLabel: 'Discovery slides',
  slideLabel: 'Show slide'
} : {
  paginationLabel: '探索内容分页',
  slideLabel: '显示第'
})
const slides = computed<Slide[]>(() => isEnglish.value ? [
  {
    title: 'AIoT Technology & Practice',
    description: 'From IoT platforms to LLM agents and IoT DC3 practice.',
    action: 'Read the book',
    link: 'https://book.dc3.site',
    coverOnly: true
  },
  {
    title: 'AIoT Technology & Practice',
    description: 'A five-layer journey from IoT platform foundations to LLMs, agents, MCP and intelligent operations.',
    action: 'Read the book',
    link: 'https://book.dc3.site'
  },
  {
    title: 'Connect everything, build in the open',
    description: 'Connect industrial devices with 28 multi-protocol drivers, then follow and shape IoT DC3 in the open.',
    action: 'Explore docs',
    link: 'https://docs.dc3.site',
    secondaryAction: 'GitHub',
    secondaryLink: 'https://github.com/pnoker/iot-dc3'
  }
] : [
  {
    title: 'AIoT 技术与实践',
    description: '贯通物联网平台、大模型、Agent 与 IoT DC3 智能体实战。',
    action: '阅读书籍',
    link: 'https://book.dc3.site',
    coverOnly: true
  },
  {
    title: 'AIoT 技术与实践',
    description: '以五层架构与 IoT DC3 为主线，从物联网平台底座延伸至大模型、Agent、MCP 与智能运维实践。',
    action: '阅读书籍',
    link: 'https://book.dc3.site'
  },
  {
    title: '连接万物，开放共建',
    description: '以 28 个多协议驱动连接异构工业设备，并通过开放源码与社区协作持续推动 IoT DC3 演进。',
    action: '探索文档',
    link: 'https://docs.dc3.site',
    secondaryAction: 'GitHub',
    secondaryLink: 'https://github.com/pnoker/iot-dc3'
  }
])

const active = ref(0)
let reducedMotion = false
let carouselTimer = 0

function pause() {
  if (carouselTimer) window.clearInterval(carouselTimer)
  carouselTimer = 0
}

function resume() {
  if (reducedMotion || carouselTimer) return
  carouselTimer = window.setInterval(() => {
    active.value = (active.value + 1) % slides.value.length
  }, 7600)
}

function select(index: number) {
  active.value = index
  pause()
  resume()
}

onMounted(() => {
  reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  resume()
})

onBeforeUnmount(() => {
  pause()
})
</script>

<style scoped>
.discover-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;
  border: 1px solid rgba(148, 216, 246, 0.3);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.76), transparent 38%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(115, 205, 241, 0.12) 54%, rgba(75, 88, 210, 0.07));
  box-shadow:
    0 22px 54px rgba(12, 89, 153, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.84),
    inset 0 -12px 28px rgba(55, 131, 203, 0.05);
  backdrop-filter: blur(22px) saturate(1.4);
  -webkit-backdrop-filter: blur(22px) saturate(1.4);
}

.discover-carousel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border: 1px solid rgba(151, 219, 248, 0.18);
  border-radius: 15px;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 46%, transparent);
}

.discover-slide {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 18px 14px;
}

.discover-slide strong {
  margin-top: 4px;
  color: var(--vp-c-text-1);
  font-size: 19px;
  line-height: 1.28;
  letter-spacing: -0.025em;
}

.discover-slide p {
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.7;
}

.discover-slide.is-cover-only {
  justify-content: center;
  align-items: center;
  padding: 6px 14px 10px;
}

.discover-cover-feature {
  position: relative;
  display: block;
  width: 136px;
  aspect-ratio: 2479 / 3508;
  border-radius: 7px 9px 9px 7px;
  -webkit-perspective: 900px;
  perspective: 900px;
  transform: translate3d(0, 0, 0) rotateZ(0.4deg);
  transition: transform 320ms ease;
}

.discover-cover-feature:hover,
.discover-cover-feature:focus-visible {
  transform: translate3d(42px, -2px, 0) rotateZ(0.4deg);
}

.discover-cover-feature:hover :deep(.book-front),
.discover-cover-feature:focus-visible :deep(.book-front) {
  animation: none;
  box-shadow:
    7px 10px 20px rgba(25, 91, 153, 0.13),
    2px 4px 8px rgba(25, 91, 153, 0.1);
  transform: rotateY(-118deg);
}

.discover-cover-feature:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--vp-c-brand-1) 58%, transparent);
  outline-offset: 6px;
}

.discover-actions {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-top: auto;
}

.discover-link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  width: fit-content;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 680;
  text-decoration: none;
}

.discover-link:hover {
  color: var(--vp-c-brand-2);
}

.discover-link.is-secondary {
  color: var(--vp-c-text-3);
}

.discover-link.is-secondary:hover {
  color: var(--vp-c-text-1);
}

.discover-pagination {
  display: flex;
  gap: 6px;
  padding: 0 18px 12px;
}

.discover-pagination button {
  width: 18px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-text-3) 28%, transparent);
  transition: width 260ms ease, background-color 260ms ease;
}

.discover-pagination button.is-active {
  width: 32px;
  background: linear-gradient(90deg, #2fc8dc, #6673e5);
}

.discover-slide-enter-active,
.discover-slide-leave-active {
  transition: opacity 260ms ease, transform 260ms ease;
}

.discover-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.discover-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

:global(.dark .discover-card) {
  border-color: rgba(139, 210, 250, 0.17);
  background:
    radial-gradient(circle at 18% 0%, rgba(210, 247, 255, 0.12), transparent 38%),
    linear-gradient(145deg, rgba(55, 130, 183, 0.11), rgba(21, 42, 62, 0.4) 54%, rgba(54, 55, 132, 0.15));
  box-shadow:
    0 24px 58px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(231, 251, 255, 0.1),
    inset 0 -12px 28px rgba(0, 0, 0, 0.13);
}

@media (prefers-reduced-motion: reduce) {
  .discover-slide-enter-active,
  .discover-slide-leave-active,
  .discover-cover-feature {
    animation: none;
    transition: none;
  }

  .discover-cover-feature:hover,
  .discover-cover-feature:focus-visible {
    transform: none;
  }

  .discover-cover-feature:hover :deep(.book-front),
  .discover-cover-feature:focus-visible :deep(.book-front) {
    transform: none;
  }
}
</style>
