<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))

const copy = computed(() => isEnglish.value ? {
  kicker: 'The Equation',
  title: 'When intelligence becomes physical action',
  description: 'AI agents reason and decide. IoT DC3 senses, connects and executes safely in the physical world.',
  agentSub: 'Reason · Plan · Remember',
  dc3Sub: 'Sense · Connect · Control',
  result: 'Physical AI',
  line: 'From intelligence to physical action.'
} : {
  kicker: '核心命题',
  title: '让智能体的推理，成为物理行动',
  description: 'AI Agent 负责理解与决策，IoT DC3 负责感知、连接与安全执行。',
  agentSub: '推理 · 规划 · 记忆',
  dc3Sub: '感知 · 连接 · 控制',
  result: 'Physical AI',
  line: '从智能，到物理行动。'
})
</script>

<template>
  <section class="prop-section" :aria-label="copy.kicker">
    <div class="prop-inner">
      <div class="prop-head">
        <span class="prop-kicker">
          <span class="prop-kicker-dot" aria-hidden="true"></span>
          {{ copy.kicker }}
        </span>
        <h2 class="prop-title">{{ copy.title }}</h2>
        <p class="prop-description">{{ copy.description }}</p>
      </div>

      <div class="prop-formula" role="img" aria-label="AI Agent + IoT DC3 = Physical AI">
        <div class="prop-card">
          <span class="prop-card-name">AI Agent</span>
          <span class="prop-card-sub">{{ copy.agentSub }}</span>
        </div>

        <span class="prop-op" aria-hidden="true">+</span>

        <div class="prop-card prop-card-dc3">
          <span class="prop-card-name">IoT DC3</span>
          <span class="prop-card-sub">{{ copy.dc3Sub }}</span>
        </div>

        <span class="prop-op" aria-hidden="true">=</span>

        <div class="prop-result">
          <span class="prop-result-name">{{ copy.result }}</span>
        </div>
      </div>

      <p class="prop-line">{{ copy.line }}</p>
    </div>
  </section>
</template>

<style scoped>
.prop-section {
  width: 100%;
  padding: 120px 0 24px;
}

.prop-inner {
  width: min(var(--dc3-container), 100%);
  margin: 0 auto;
  text-align: center;
}

.prop-head {
  text-align: center;
}

.prop-kicker {
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

.prop-kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #29c5df, #6773e5);
  box-shadow: 0 0 12px rgba(41, 197, 223, 0.5);
}

.prop-title {
  max-width: 760px;
  margin: 16px auto 0;
  border: none;
  color: var(--vp-c-text-1);
  font-size: clamp(28px, 3.2vw, 42px);
  font-weight: 740;
  line-height: 1.16;
  letter-spacing: -0.035em;
}

.prop-description {
  max-width: 680px;
  margin: 14px auto 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.75;
}

.prop-formula {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 30px;
  align-items: center;
  margin-top: 48px;
}

.prop-card {
  --card-rgb: 91, 116, 235;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 62px 24px;
  border: 1px solid rgba(151, 219, 248, 0.16);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.58), transparent 42%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.34), rgba(var(--card-rgb), 0.07) 56%, rgba(77, 83, 199, 0.04));
  box-shadow:
    0 14px 34px rgba(16, 96, 161, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    inset 0 -12px 28px rgba(57, 119, 196, 0.03);
  backdrop-filter: blur(20px) saturate(1.35);
  -webkit-backdrop-filter: blur(20px) saturate(1.35);
  transition: transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
}

.prop-card:hover {
  border-color: rgba(var(--card-rgb), 0.32);
  box-shadow:
    0 26px 58px rgba(16, 96, 161, 0.14),
    0 10px 28px rgba(var(--card-rgb), 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-5px);
}

.prop-card-dc3 {
  --card-rgb: 18, 150, 219;
}

.prop-card-name {
  background: linear-gradient(112deg, #07549a 4%, #119bd6 42%, #1786d4 62%, #5558c9 96%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 780;
  line-height: 1.05;
  letter-spacing: -0.025em;
}

.prop-card-dc3 .prop-card-name {
  background: linear-gradient(112deg, #07549a 4%, #0fa3d8 38%, #1fc3c0 62%, #4f52bf 96%);
  background-clip: text;
  -webkit-background-clip: text;
}

:global(.dark .prop-card-name) {
  background: linear-gradient(112deg, #8edcff 4%, #d3fbff 42%, #7fddff 60%, #a6a9ff 96%);
  background-clip: text;
  -webkit-background-clip: text;
}

:global(.dark .prop-card-dc3 .prop-card-name) {
  background: linear-gradient(112deg, #8edcff 4%, #d3fbff 38%, #9ff5ea 60%, #a6a9ff 96%);
  background-clip: text;
  -webkit-background-clip: text;
}

.prop-card-sub {
  color: var(--vp-c-text-3);
  font-size: 14px;
  font-weight: 640;
  letter-spacing: 0.06em;
  font-family: var(--vp-font-family-mono);
}

.prop-op {
  display: grid;
  place-items: center;
  color: var(--vp-c-text-3);
  font-size: 40px;
  font-weight: 300;
  font-family: var(--vp-font-family-mono);
}

.prop-result {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 58px 24px;
}

.prop-result-name {
  background: linear-gradient(112deg, #07549a 4%, #119bd6 42%, #1786d4 62%, #5558c9 96%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: clamp(46px, 6vw, 88px);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.035em;
}

:global(.dark .prop-result-name) {
  background: linear-gradient(112deg, #8edcff 4%, #d3fbff 42%, #7fddff 60%, #a6a9ff 96%);
  background-clip: text;
  -webkit-background-clip: text;
}

.prop-line {
  margin: 52px auto 0;
  color: var(--vp-c-text-2);
  font-size: 22px;
  font-weight: 620;
  line-height: 1.6;
  letter-spacing: 0.01em;
}

:global(.dark .prop-card) {
  border-color: rgba(143, 216, 250, 0.16);
  background:
    radial-gradient(circle at 16% 0%, rgba(205, 245, 255, 0.13), transparent 42%),
    linear-gradient(135deg, rgba(var(--card-rgb), 0.11), rgba(17, 35, 52, 0.3) 58%, rgba(61, 62, 143, 0.12));
  box-shadow:
    0 22px 50px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(232, 251, 255, 0.1),
    inset 0 -12px 28px rgba(0, 0, 0, 0.12);
}

@media (max-width: 960px) {
  .prop-section {
    padding: 80px 0 0;
  }

  .prop-formula {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 36px;
  }

  .prop-op {
    height: 22px;
    font-size: 24px;
  }

  .prop-card {
    padding: 40px 20px;
  }

  .prop-result {
    padding: 36px 20px;
  }

  .prop-line {
    margin-top: 36px;
    font-size: 18px;
  }
}
</style>
