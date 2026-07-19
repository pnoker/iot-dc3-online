<template>
  <aside
    v-if="railEnabled"
    class="sponsor-rail"
    :aria-label="copy.railLabel"
    data-cursor-rgb="18, 150, 219"
    @mouseenter="pauseCarousel"
    @mouseleave="resumeCarousel"
    @focusin="pauseCarousel"
    @focusout="resumeCarousel"
  >
    <header class="rail-header">
      <span class="rail-status-dot" :class="`is-${adState}`" aria-hidden="true"></span>
      <span>{{ adState === 'filled' ? copy.sponsored : copy.discover }}</span>
    </header>

    <div v-if="adState !== 'fallback'" class="rail-ad-shell">
      <div class="rail-ad">
        <ins
          ref="adSlot"
          class="adsbygoogle"
          style="display:block"
          data-ad-client="ca-pub-7573143232245283"
          data-ad-slot="2006078743"
          data-ad-format="rectangle"
          data-full-width-responsive="true"
        ></ins>
      </div>

      <div v-if="adState === 'loading'" class="rail-loading" aria-live="polite">
        <span class="rail-loading-orbit" aria-hidden="true"></span>
        <strong>{{ copy.loadingTitle }}</strong>
        <span>{{ copy.loadingDescription }}</span>
      </div>
    </div>

    <div v-else class="rail-carousel">
      <Transition name="rail-slide" mode="out-in">
        <article
          :key="activeSlide"
          class="rail-slide"
          :class="{'is-cover-only': slides[activeSlide].coverOnly}"
          aria-live="off"
        >
          <a
            v-if="slides[activeSlide].coverOnly"
            :href="slides[activeSlide].link"
            class="rail-cover-feature"
            :aria-label="slides[activeSlide].action"
          >
            <span class="rail-book-page" aria-hidden="true"></span>
            <span class="rail-book-cover">
              <BookCover :english="isEnglish" />
            </span>
          </a>
          <template v-else>
            <strong>{{ slides[activeSlide].title }}</strong>
            <p>{{ slides[activeSlide].description }}</p>
            <div class="rail-actions">
              <a :href="slides[activeSlide].link" class="rail-link">
                {{ slides[activeSlide].action }}
                <span aria-hidden="true">↗</span>
              </a>
              <a
                v-if="slides[activeSlide].secondaryLink"
                :href="slides[activeSlide].secondaryLink"
                class="rail-link is-secondary"
              >
                {{ slides[activeSlide].secondaryAction }}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </template>
        </article>
      </Transition>

      <div class="rail-pagination" :aria-label="copy.paginationLabel">
        <button
          v-for="(_, index) in slides"
          :key="index"
          type="button"
          :class="{'is-active': index === activeSlide}"
          :aria-label="`${copy.slideLabel} ${index + 1}`"
          :aria-current="index === activeSlide ? 'true' : undefined"
          @click="selectSlide(index)"
        ></button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
import {useData} from 'vitepress'

type AdState = 'loading' | 'filled' | 'fallback'
type AdSenseWindow = Window & {adsbygoogle?: Record<string, never>[]}
type DataAwareNavigator = Navigator & {connection?: {saveData?: boolean}}
type Slide = {
  title: string
  description: string
  action: string
  link: string
  coverOnly?: boolean
  secondaryAction?: string
  secondaryLink?: string
}

const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7573143232245283'
const BookCover = defineAsyncComponent(() => import('./BookCover.vue'))

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))
const copy = computed(() => isEnglish.value ? {
  railLabel: 'IoT DC3 sponsor and discovery panel',
  sponsored: 'SPONSORED',
  discover: 'DISCOVER DC3',
  loadingTitle: 'Connecting sponsors',
  loadingDescription: 'Keeping the main experience uninterrupted',
  paginationLabel: 'Discovery slides',
  slideLabel: 'Show slide'
} : {
  railLabel: 'IoT DC3 赞助与探索面板',
  sponsored: '赞助内容',
  discover: '探索 IoT DC3',
  loadingTitle: '正在连接赞助网络',
  loadingDescription: '主页面体验不会因此中断',
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

const railEnabled = ref(false)
const adState = ref<AdState>('loading')
const adSlot = ref<HTMLElement | null>(null)
const activeSlide = ref(0)
let reducedMotion = false
let carouselTimer = 0
let adStatusTimer = 0
let adStatusObserver: MutationObserver | null = null

function isEligible() {
  const connection = (navigator as DataAwareNavigator).connection
  return window.innerWidth >= 1760 && window.innerHeight >= 900 && !connection?.saveData
}

function loadAdSenseScript() {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${ADSENSE_SRC}"]`)
  const adsWindow = window as AdSenseWindow
  if (existing?.dataset.loaded === 'true' || (existing && adsWindow.adsbygoogle)) return Promise.resolve()

  return new Promise<void>((resolve, reject) => {
    const script = existing ?? document.createElement('script')
    const handleLoad = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    const handleError = () => {
      script.remove()
      reject(new Error('AdSense failed to load'))
    }

    script.addEventListener('load', handleLoad, {once: true})
    script.addEventListener('error', handleError, {once: true})
    if (!existing) {
      script.async = true
      script.crossOrigin = 'anonymous'
      script.src = ADSENSE_SRC
      document.head.appendChild(script)
    }
  })
}

function stopAdWatch() {
  adStatusObserver?.disconnect()
  adStatusObserver = null
  if (adStatusTimer) window.clearTimeout(adStatusTimer)
  adStatusTimer = 0
}

function showFallback() {
  adState.value = 'fallback'
  stopAdWatch()
  resumeCarousel()
}

async function initializeAd() {
  await nextTick()
  const slot = adSlot.value
  if (!slot) return

  adStatusObserver = new MutationObserver(() => {
    if (slot.dataset.adStatus === 'filled') {
      adState.value = 'filled'
      pauseCarousel()
      stopAdWatch()
    } else if (slot.dataset.adStatus === 'unfilled') {
      showFallback()
    }
  })
  adStatusObserver.observe(slot, {attributes: true, attributeFilter: ['data-ad-status']})
  adStatusTimer = window.setTimeout(showFallback, 12000)

  try {
    await loadAdSenseScript()
    if (adState.value !== 'loading' || !slot.isConnected) return
    const adsWindow = window as AdSenseWindow
    adsWindow.adsbygoogle = adsWindow.adsbygoogle ?? []
    adsWindow.adsbygoogle.push({})
  } catch (_) {
    showFallback()
  }
}

function pauseCarousel() {
  if (carouselTimer) window.clearInterval(carouselTimer)
  carouselTimer = 0
}

function resumeCarousel() {
  if (reducedMotion || adState.value !== 'fallback' || carouselTimer) return
  carouselTimer = window.setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.value.length
  }, 7600)
}

function selectSlide(index: number) {
  activeSlide.value = index
  pauseCarousel()
  resumeCarousel()
}

onMounted(() => {
  reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (!isEligible()) return
  railEnabled.value = true
  void initializeAd()
})

onBeforeUnmount(() => {
  pauseCarousel()
  stopAdWatch()
})
</script>

<style scoped>
.sponsor-rail {
  display: none;
}

@media (min-width: 1760px) and (min-height: 900px) {
  .sponsor-rail {
    position: absolute;
    top: clamp(108px, 13vh, 156px);
    right: max(16px, calc((100vw - 1152px) / 2 - 288px));
    z-index: 4;
    display: flex;
    flex-direction: column;
    width: 272px;
    min-height: 326px;
    padding: 10px;
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
}

.rail-header {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 24px;
  padding: 0 3px 10px;
  color: var(--vp-c-text-3);
  font-size: 10px;
  font-weight: 720;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.rail-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #82909a;
  box-shadow: 0 0 0 4px rgba(130, 144, 154, 0.1);
}

.rail-status-dot.is-filled {
  background: #2fc8dc;
  box-shadow: 0 0 0 4px rgba(47, 200, 220, 0.12), 0 0 12px rgba(47, 200, 220, 0.56);
}

.rail-status-dot.is-fallback {
  background: #6673e5;
  box-shadow: 0 0 0 4px rgba(102, 115, 229, 0.11), 0 0 12px rgba(102, 115, 229, 0.42);
}

.rail-ad-shell {
  position: relative;
  flex: 1;
  min-height: 276px;
}

.rail-ad {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
}

.adsbygoogle {
  width: 100%;
  min-height: 250px;
}

.rail-loading {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 276px;
  padding: 24px;
  color: var(--vp-c-text-3);
  text-align: center;
  pointer-events: none;
}

.rail-loading strong {
  margin-top: 20px;
  color: var(--vp-c-text-1);
  font-size: 15px;
}

.rail-loading span:last-child {
  margin-top: 7px;
  font-size: 11px;
  line-height: 1.55;
}

.rail-loading-orbit {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(18, 150, 219, 0.16);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: rail-orbit 1.2s linear infinite;
}

.rail-carousel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 276px;
  overflow: hidden;
  border: 1px solid rgba(151, 219, 248, 0.18);
  border-radius: 15px;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 46%, transparent);
}

.rail-slide {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 22px 20px 16px;
}

.rail-slide strong {
  margin-top: 4px;
  color: var(--vp-c-text-1);
  font-size: 19px;
  line-height: 1.28;
  letter-spacing: -0.025em;
}

.rail-slide p {
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.7;
}

.rail-slide.is-cover-only {
  justify-content: center;
  align-items: center;
  padding: 9px 20px 12px;
}

.rail-cover-feature {
  position: relative;
  display: block;
  width: 136px;
  aspect-ratio: 2479 / 3508;
  border-radius: 7px 9px 9px 7px;
  -webkit-perspective: 900px;
  perspective: 900px;
  transform: translate3d(0, 0, 0) rotateZ(0.4deg);
  transition: transform 760ms cubic-bezier(0.2, 0.72, 0.18, 1);
}

.rail-book-page,
.rail-book-cover {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.rail-book-page {
  overflow: hidden;
  border: 1px solid rgba(111, 173, 218, 0.24);
  background:
    radial-gradient(circle at 77% 19%, rgba(38, 176, 210, 0.12), transparent 34%),
    linear-gradient(145deg, #f8fcff, #edf7fb 62%, #f8fbf4);
  box-shadow:
    -4px 4px 0 rgba(55, 102, 172, 0.11),
    0 19px 34px rgba(25, 91, 153, 0.19),
    0 5px 11px rgba(25, 91, 153, 0.1),
    inset 10px 0 18px rgba(58, 115, 169, 0.06);
}

.rail-book-page::before {
  position: absolute;
  inset: 20px 17px auto;
  height: 68px;
  background:
    radial-gradient(circle at 14% 22%, #2b73e4 0 2px, transparent 3px),
    radial-gradient(circle at 58% 8%, #18a7cb 0 2px, transparent 3px),
    radial-gradient(circle at 82% 48%, #1db88c 0 2px, transparent 3px),
    linear-gradient(32deg, transparent 48%, rgba(33, 143, 207, 0.25) 49%, rgba(33, 143, 207, 0.25) 51%, transparent 52%);
  content: '';
}

.rail-book-page::after {
  position: absolute;
  right: 18px;
  bottom: 24px;
  left: 18px;
  height: 62px;
  background: repeating-linear-gradient(to bottom, rgba(64, 100, 132, 0.16) 0 1px, transparent 1px 11px);
  content: '';
  -webkit-mask-image: linear-gradient(90deg, #000 76%, transparent);
  mask-image: linear-gradient(90deg, #000 76%, transparent);
}

.rail-book-cover {
  z-index: 2;
  box-shadow:
    -4px 4px 0 rgba(55, 102, 172, 0.13),
    0 19px 34px rgba(25, 91, 153, 0.2),
    0 5px 11px rgba(25, 91, 153, 0.12);
  transform-origin: left center;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  animation: rail-book-invite 1.25s 480ms both;
  transition: transform 760ms cubic-bezier(0.2, 0.72, 0.18, 1), box-shadow 760ms ease;
}

.rail-book-cover::before,
.rail-book-cover::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  content: '';
  pointer-events: none;
}

.rail-book-cover::before {
  border: 1px solid rgba(123, 178, 214, 0.22);
  background:
    repeating-linear-gradient(to bottom, transparent 0 13px, rgba(72, 112, 145, 0.11) 13px 14px),
    linear-gradient(145deg, #f8fcff, #edf7fb);
  box-shadow: inset -10px 0 18px rgba(58, 115, 169, 0.06);
  transform: rotateY(180deg) translateZ(1px);
}

.rail-book-cover::after {
  border: 1px solid rgba(255, 255, 255, 0.7);
  background: linear-gradient(115deg, rgba(255, 255, 255, 0.24), transparent 34%);
  transform: translateZ(2px);
}

.rail-book-cover :deep(.book-cover-art) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(1px);
}

.rail-cover-feature:hover,
.rail-cover-feature:focus-visible {
  transform: translate3d(36px, -2px, 0) rotateZ(0.4deg);
}

.rail-cover-feature:hover .rail-book-cover,
.rail-cover-feature:focus-visible .rail-book-cover {
  animation: none;
  box-shadow:
    7px 10px 20px rgba(25, 91, 153, 0.13),
    2px 4px 8px rgba(25, 91, 153, 0.1);
  transform: rotateY(-118deg);
}

.rail-cover-feature:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--vp-c-brand-1) 58%, transparent);
  outline-offset: 6px;
}

.rail-actions {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-top: auto;
}

.rail-link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  width: fit-content;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 680;
  text-decoration: none;
}

.rail-link:hover {
  color: var(--vp-c-brand-2);
}

.rail-link.is-secondary {
  color: var(--vp-c-text-3);
}

.rail-link.is-secondary:hover {
  color: var(--vp-c-text-1);
}

.rail-pagination {
  display: flex;
  gap: 6px;
  padding: 0 20px 17px;
}

.rail-pagination button {
  width: 18px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-text-3) 28%, transparent);
  transition: width 260ms ease, background-color 260ms ease;
}

.rail-pagination button.is-active {
  width: 32px;
  background: linear-gradient(90deg, #2fc8dc, #6673e5);
}

.rail-slide-enter-active,
.rail-slide-leave-active {
  transition: opacity 260ms ease, transform 260ms ease;
}

.rail-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.rail-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

:global(.dark .sponsor-rail) {
  border-color: rgba(139, 210, 250, 0.17);
  background:
    radial-gradient(circle at 18% 0%, rgba(210, 247, 255, 0.12), transparent 38%),
    linear-gradient(145deg, rgba(55, 130, 183, 0.11), rgba(21, 42, 62, 0.4) 54%, rgba(54, 55, 132, 0.15));
  box-shadow:
    0 24px 58px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(231, 251, 255, 0.1),
    inset 0 -12px 28px rgba(0, 0, 0, 0.13);
}

@keyframes rail-orbit {
  to { transform: rotate(1turn); }
}

@keyframes rail-book-invite {
  0%, 100% { transform: rotateY(0); }
  52% { transform: rotateY(-16deg); }
}

@media (prefers-reduced-motion: reduce) {
  .rail-loading-orbit {
    animation: none;
  }

  .rail-slide-enter-active,
  .rail-slide-leave-active,
  .rail-cover-feature,
  .rail-book-cover {
    animation: none;
    transition: none;
  }

  .rail-cover-feature:hover,
  .rail-cover-feature:focus-visible,
  .rail-cover-feature:hover .rail-book-cover,
  .rail-cover-feature:focus-visible .rail-book-cover {
    transform: none;
  }
}
</style>
