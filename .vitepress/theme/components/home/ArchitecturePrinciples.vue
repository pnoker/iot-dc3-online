<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))

const copy = computed(() => isEnglish.value ? {
  kicker: 'Architecture Principles',
  title: 'Two principles, from sensing to execution',
  description: 'Keep the surface simple. Keep every execution observable.',
  visionLink: 'Why these two? Read the full vision →',
  visionHref: '/en/',
  principles: [
    {
      label: 'Everything is a Tool.',
      local: '一切皆工具',
      chips: ['Device', 'Point', 'Command', 'API']
    },
    {
      label: 'Every Action is Traceable.',
      local: '每次执行皆可追溯',
      chips: ['Auth', 'Risk', 'Execute', 'Audit', 'Feedback']
    }
  ]
} : {
  kicker: '架构原则',
  title: '两条原则，贯穿从感知到执行的整个闭环',
  description: '接口保持简单，执行全程可观测。',
  visionLink: '为什么是这两条？阅读完整愿景 →',
  visionHref: '/zh/',
  principles: [
    {
      label: 'Everything is a Tool.',
      local: '一切皆工具',
      chips: ['设备', '点位', '指令', 'API']
    },
    {
      label: 'Every Action is Traceable.',
      local: '每次执行皆可追溯',
      chips: ['授权', '风险', '执行', '审计', '反馈']
    }
  ]
})
</script>

<template>
  <section class="principles-section" :aria-label="copy.kicker">
    <div class="principles-inner">
      <div class="principles-head">
        <span class="principles-kicker">
          <span class="principles-kicker-dot" aria-hidden="true"></span>
          {{ copy.kicker }}
        </span>
        <h2 class="principles-title">{{ copy.title }}</h2>
        <p class="principles-description">{{ copy.description }}</p>
      </div>

      <div class="principles-stack">
        <article v-for="principle in copy.principles" :key="principle.label" class="principles-manifesto">
          <h3 class="principles-label">{{ principle.label }}</h3>
          <p class="principles-local">{{ principle.local }}</p>
          <div class="principles-chips" aria-hidden="true">
            <span v-for="chip in principle.chips" :key="chip" class="principles-chip">{{ chip }}</span>
          </div>
        </article>
      </div>

      <p class="principles-vision">
        <a :href="copy.visionHref">{{ copy.visionLink }}</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.principles-section {
  width: 100%;
  padding-top: 96px;
}

.principles-inner {
  width: min(var(--dc3-container), 100%);
  margin: 0 auto;
}

.principles-head {
  text-align: center;
}

.principles-kicker {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  padding: 6px 11px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-brand-soft) 55%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 720;
  letter-spacing: 0.16em;
}

.principles-kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #29c5df, #6773e5);
  box-shadow: 0 0 12px rgba(41, 197, 223, 0.5);
}

.principles-title {
  max-width: 760px;
  margin: 16px auto 0;
  border: none;
  color: var(--vp-c-text-1);
  font-size: clamp(28px, 3.2vw, 42px);
  font-weight: 740;
  line-height: 1.16;
  letter-spacing: -0.035em;
}

.principles-description {
  max-width: 680px;
  margin: 14px auto 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.75;
}

.principles-stack {
  display: flex;
  flex-direction: column;
  gap: 120px;
  margin-top: 96px;
}

.principles-manifesto {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.principles-label {
  margin: 0;
  background: linear-gradient(112deg, #07549a 4%, #119bd6 42%, #1786d4 62%, #5558c9 96%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: clamp(36px, 5.2vw, 72px);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.03em;
}

:global(.dark .principles-label) {
  background: linear-gradient(112deg, #8edcff 4%, #d3fbff 42%, #7fddff 60%, #a6a9ff 96%);
  background-clip: text;
  -webkit-background-clip: text;
}

.principles-local {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 15px;
  font-weight: 640;
  letter-spacing: 0.04em;
}

.principles-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}

.principles-chip {
  padding: 6px 15px;
  border: 1px solid rgba(151, 219, 248, 0.2);
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 60%, transparent);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 620;
  font-family: var(--vp-font-family-mono);
}

:global(.dark .principles-chip) {
  border-color: rgba(143, 216, 250, 0.14);
}

.principles-vision {
  margin: 96px 0 0;
  text-align: center;
}

.principles-vision a {
  color: var(--vp-c-brand-1);
  font-size: 15px;
  font-weight: 640;
  text-decoration: none;
  transition: opacity 220ms ease;
}

.principles-vision a:hover {
  text-decoration: none;
  opacity: 0.78;
}

@media (max-width: 900px) {
  .principles-section {
    padding-top: 72px;
  }

  .principles-stack {
    gap: 88px;
    margin-top: 72px;
  }

  .principles-vision {
    margin-top: 72px;
  }
}

@media (max-width: 640px) {
  .principles-label {
    font-size: clamp(30px, 9vw, 40px);
  }
}
</style>
