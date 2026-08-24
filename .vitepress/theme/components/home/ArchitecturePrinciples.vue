<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))

const copy = computed(() => isEnglish.value ? {
  kicker: 'Architecture Principles',
  title: 'Two principles, all the way down',
  description: 'Like every good harness: keep the surface simple and the execution observable.',
  principles: [
    {
      label: 'Everything is a Tool.',
      local: '一切皆工具',
      description: 'Devices, points, commands and APIs can all be exposed as agent-callable tools — over MCP and Tool Calling, with OAuth2.1, tool whitelists and risk tiers guarding every call.',
      chips: ['MCP', 'Tool Calling', 'OAuth2.1', 'Tool Whitelist', 'Risk Tiers']
    },
    {
      label: 'Every Action is Traceable.',
      local: '每次执行皆可追溯',
      description: 'For industrial agents the bar isn\'t just “can call” — every step must be observable, auditable and replayable, from intent to effect.',
      chips: ['Authorize', 'Guard', 'Execute', 'Audit', 'Feedback']
    }
  ]
} : {
  kicker: '架构原则',
  title: '两条原则，贯穿始终',
  description: '像所有优秀的 Harness 一样：保持接口简单，让执行全程可观测。',
  principles: [
    {
      label: 'Everything is a Tool.',
      local: '一切皆工具',
      description: '设备、点位、指令、API，都可以被抽象为智能体可调用的工具 —— 通过 MCP / Tool Calling 暴露，并以 OAuth2.1、工具白名单与风险分级守住每一次调用。',
      chips: ['MCP', 'Tool Calling', 'OAuth2.1', '工具白名单', '风险分级']
    },
    {
      label: 'Every Action is Traceable.',
      local: '每次执行皆可追溯',
      description: '工业智能体的价值不只是“能调用”，更是每一步都可观测、可审计、可回放 —— 从意图到效果，全程留痕。',
      chips: ['授权', '风险控制', '执行', '审计', '反馈']
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

      <div class="principles-grid">
        <article v-for="principle in copy.principles" :key="principle.label" class="principles-card">
          <h3 class="principles-label">{{ principle.label }}</h3>
          <p class="principles-local">{{ principle.local }}</p>
          <p class="principles-copy">{{ principle.description }}</p>
          <div class="principles-chips" aria-hidden="true">
            <span v-for="(chip, index) in principle.chips" :key="chip" class="principles-chip">
              <span v-if="index > 0" class="principles-chip-arrow">→</span>
              {{ chip }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.principles-section {
  width: 100%;
  padding-top: 108px;
}

.principles-inner {
  width: min(1152px, 100%);
  margin: 0 auto;
}

.principles-head {
  text-align: center;
}

.principles-kicker {
  display: inline-flex;
  gap: 9px;
  align-items: center;
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

.principles-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  margin-top: 44px;
}

.principles-card {
  --card-rgb: 18, 150, 219;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 34px 34px 30px;
  overflow: hidden;
  border: 1px solid rgba(151, 219, 248, 0.28);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.74), transparent 42%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.44), rgba(var(--card-rgb), 0.11) 56%, rgba(77, 83, 199, 0.07));
  box-shadow:
    0 20px 46px rgba(16, 96, 161, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.84),
    inset 0 -12px 28px rgba(57, 119, 196, 0.05);
  backdrop-filter: blur(20px) saturate(1.35);
  -webkit-backdrop-filter: blur(20px) saturate(1.35);
  transition: transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
}

.principles-card:nth-child(2) {
  --card-rgb: 91, 116, 235;
}

.principles-card:hover {
  border-color: rgba(var(--card-rgb), 0.34);
  box-shadow:
    0 26px 58px rgba(16, 96, 161, 0.15),
    0 10px 28px rgba(var(--card-rgb), 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    inset 0 -12px 28px rgba(var(--card-rgb), 0.07);
  transform: translateY(-5px);
}

.principles-label {
  margin: 0;
  background: linear-gradient(112deg, #07549a 4%, #119bd6 42%, #1786d4 62%, #5558c9 96%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: clamp(22px, 2.4vw, 28px);
  font-weight: 780;
  line-height: 1.18;
  letter-spacing: -0.02em;
}

:global(.dark .principles-label) {
  background: linear-gradient(112deg, #8edcff 4%, #d3fbff 42%, #7fddff 60%, #a6a9ff 96%);
  background-clip: text;
  -webkit-background-clip: text;
}

.principles-local {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 14px;
  font-weight: 640;
}

.principles-copy {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 15px;
  line-height: 1.75;
}

.principles-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
}

.principles-chip {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 5px 12px;
  border: 1px solid rgba(var(--card-rgb), 0.24);
  border-radius: 999px;
  background: color-mix(in srgb, rgb(var(--card-rgb)) 8%, transparent);
  color: var(--vp-c-text-2);
  font-size: 12.5px;
  font-weight: 640;
}

.principles-chip-arrow {
  color: rgb(var(--card-rgb));
  font-weight: 700;
}

:global(.dark .principles-card) {
  border-color: rgba(143, 216, 250, 0.16);
  background:
    radial-gradient(circle at 16% 0%, rgba(205, 245, 255, 0.13), transparent 42%),
    linear-gradient(135deg, rgba(var(--card-rgb), 0.11), rgba(17, 35, 52, 0.3) 58%, rgba(61, 62, 143, 0.12));
  box-shadow:
    0 22px 50px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(232, 251, 255, 0.1),
    inset 0 -12px 28px rgba(0, 0, 0, 0.12);
}

@media (max-width: 900px) {
  .principles-section {
    padding-top: 84px;
  }

  .principles-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .principles-card {
    padding: 26px 24px 24px;
  }
}
</style>
