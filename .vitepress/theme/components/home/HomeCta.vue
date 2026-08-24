<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))

const copy = computed(() => isEnglish.value ? {
  title: 'Build your physical AI loop',
  description: 'Open source, free and self-hostable. From the docs quick start to a one-line Docker Compose, connect your devices to agents today.',
  github: 'GitHub',
  start: 'Quick Start',
  startLink: 'https://docs.dc3.site/en/',
  visionLink: 'Read the full vision →',
  visionHref: '/en/'
} : {
  title: '开始构建你的物理智能闭环',
  description: '开源、免费、可私有化部署。从文档的快速开始到一条 Docker Compose 命令，今天就能把设备接入智能体。',
  github: 'GitHub',
  start: '快速开始',
  startLink: 'https://docs.dc3.site/zh/',
  visionLink: '阅读完整愿景 →',
  visionHref: '/zh/'
})
</script>

<template>
  <section class="cta-section" :aria-label="copy.title">
    <div class="cta-inner">
      <h2 class="cta-title">{{ copy.title }}</h2>
      <p class="cta-description">{{ copy.description }}</p>

      <div class="cta-actions">
        <a class="cta-button cta-button-brand" :href="copy.startLink">
          {{ copy.start }}
          <span aria-hidden="true">→</span>
        </a>
        <a class="cta-button cta-button-alt" href="https://github.com/pnoker/iot-dc3">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.75a9.25 9.25 0 0 0-2.93 18.03c.46.09.63-.2.63-.45v-1.6c-2.57.56-3.11-1.24-3.11-1.24-.42-1.07-1.03-1.35-1.03-1.35-.84-.58.06-.57.06-.57.93.07 1.42.96 1.42.96.83 1.42 2.18 1.01 2.71.77.08-.6.32-1.01.59-1.24-2.06-.23-4.22-1.03-4.22-4.59 0-1.01.36-1.84.96-2.49-.1-.24-.42-1.18.09-2.45 0 0 .78-.25 2.55.95a8.87 8.87 0 0 1 4.64 0c1.77-1.2 2.55-.95 2.55-.95.51 1.27.19 2.21.09 2.45.6.65.96 1.48.96 2.49 0 3.57-2.17 4.36-4.24 4.59.33.29.63.85.63 1.72v2.55c0 .25.17.54.64.45A9.25 9.25 0 0 0 12 2.75z" />
          </svg>
          {{ copy.github }}
        </a>
      </div>

      <p class="cta-vision">
        <a :href="copy.visionHref">{{ copy.visionLink }}</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.cta-section {
  position: relative;
  width: 100vw;
  margin-top: 128px;
  margin-left: calc(-50vw + 50%);
  padding: 112px 32px 120px;
  overflow: hidden;
  border-top: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  background:
    radial-gradient(circle at 50% 130%, rgba(24, 191, 220, 0.24), transparent 55%),
    radial-gradient(circle at 8% 10%, rgba(18, 150, 219, 0.1), transparent 34%),
    radial-gradient(circle at 92% 16%, rgba(91, 116, 235, 0.12), transparent 34%),
    linear-gradient(180deg, transparent, color-mix(in srgb, var(--vp-c-bg-alt) 80%, transparent));
}

.cta-inner {
  width: min(var(--dc3-container), 100%);
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  margin: 0;
  border: none;
  color: var(--vp-c-text-1);
  font-size: clamp(34px, 4vw, 54px);
  font-weight: 760;
  line-height: 1.12;
  letter-spacing: -0.035em;
}

.cta-description {
  max-width: 640px;
  margin: 16px auto 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.75;
}

.cta-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  margin-top: 34px;
}

.cta-button {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  min-height: 48px;
  padding: 12px 26px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 680;
  text-decoration: none;
  transition: transform 240ms ease, box-shadow 240ms ease, background-color 240ms ease, border-color 240ms ease;
}

.cta-button:hover {
  text-decoration: none;
  transform: translateY(-2px);
}

.cta-button:focus-visible {
  outline: 3px solid rgba(18, 150, 219, 0.3);
  outline-offset: 3px;
}

.cta-button-brand {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: linear-gradient(150deg, #07549a, #0d8fd0 52%, #4f52bf 120%);
  box-shadow: 0 14px 34px rgba(13, 114, 180, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.26);
  color: #ffffff;
}

.cta-button-brand:hover {
  box-shadow: 0 20px 42px rgba(13, 114, 180, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.34);
  color: #ffffff;
}

.cta-button-alt {
  display: inline-flex;
  gap: 10px;
  border: 1px solid rgba(151, 219, 248, 0.3);
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.7), transparent 42%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.44), rgba(18, 150, 219, 0.09) 56%, rgba(91, 116, 235, 0.06));
  box-shadow: 0 14px 34px rgba(16, 96, 161, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px) saturate(1.3);
  color: var(--vp-c-text-1);
}

.cta-button-alt:hover {
  border-color: rgba(18, 150, 219, 0.42);
  box-shadow: 0 18px 40px rgba(16, 96, 161, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  color: var(--vp-c-text-1);
}

.cta-button svg {
  width: 19px;
  height: 19px;
  fill: currentColor;
}

:global(.dark .cta-button-alt) {
  border-color: rgba(143, 216, 250, 0.16);
  background:
    radial-gradient(circle at 16% 0%, rgba(205, 245, 255, 0.11), transparent 42%),
    linear-gradient(135deg, rgba(22, 113, 169, 0.1), rgba(17, 35, 52, 0.3) 58%, rgba(61, 62, 143, 0.11));
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(232, 251, 255, 0.08);
}

.cta-vision {
  margin: 22px 0 0;
}

.cta-vision a {
  color: var(--vp-c-brand-1);
  font-size: 14px;
  font-weight: 640;
  text-decoration: none;
  transition: opacity 220ms ease;
}

.cta-vision a:hover {
  text-decoration: none;
  opacity: 0.78;
}

@media (max-width: 640px) {
  .cta-section {
    margin-top: 96px;
    padding: 80px 20px 88px;
  }

  .cta-actions {
    flex-direction: column;
    align-items: center;
  }

  .cta-button {
    width: min(320px, 100%);
    justify-content: center;
  }
}
</style>
