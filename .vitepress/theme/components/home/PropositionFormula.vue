<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))

const copy = computed(() => isEnglish.value ? {
  kicker: 'The Proposition',
  agentTag: 'the thinking side',
  agentChips: ['Reasoning', 'Planning', 'Memory'],
  agentDesc: 'Models bring reasoning, planning and memory.',
  dc3Tag: 'the physical side',
  dc3Chips: ['Device', 'Data', 'Tool', 'Command'],
  dc3Desc: 'DC3 brings devices, data, tools and the command plane.',
  result: 'Sense → Think → Act → Feedback',
  resultDesc: 'Agents think. DC3 connects that thinking to the physical world — and brings the results back safely.'
} : {
  kicker: '核心命题',
  agentTag: '让模型思考',
  agentChips: ['推理', '规划', '记忆'],
  agentDesc: '模型带来推理、规划与记忆。',
  dc3Tag: '让思考触达物理世界',
  dc3Chips: ['设备', '数据', '工具', '指令'],
  dc3Desc: 'DC3 带来设备、数据、工具与指令平面。',
  result: '感知 → 思考 → 行动 → 反馈',
  resultDesc: '智能体思考，DC3 让思考进入物理世界，并把结果安全带回。'
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
      </div>

      <div class="prop-formula" role="img" aria-label="AI Agent + IoT DC3 = Physical AI">
        <div class="prop-card">
          <span class="prop-card-tag">{{ copy.agentTag }}</span>
          <span class="prop-card-name">AI Agent</span>
          <span class="prop-card-chips">
            <span v-for="chip in copy.agentChips" :key="chip">{{ chip }}</span>
          </span>
          <span class="prop-card-desc">{{ copy.agentDesc }}</span>
        </div>

        <span class="prop-op" aria-hidden="true">+</span>

        <div class="prop-card prop-card-dc3">
          <span class="prop-card-tag">{{ copy.dc3Tag }}</span>
          <span class="prop-card-name">IoT DC3</span>
          <span class="prop-card-chips">
            <span v-for="chip in copy.dc3Chips" :key="chip">{{ chip }}</span>
          </span>
          <span class="prop-card-desc">{{ copy.dc3Desc }}</span>
        </div>

        <span class="prop-op" aria-hidden="true">=</span>

        <div class="prop-result">
          <span class="prop-result-name">Physical AI</span>
          <span class="prop-result-flow">{{ copy.result }}</span>
        </div>
      </div>

      <p class="prop-summary">{{ copy.resultDesc }}</p>
    </div>
  </section>
</template>

<style scoped>
.prop-section {
  width: 100%;
  padding-top: 64px;
}

.prop-inner {
  width: min(1152px, 100%);
  margin: 0 auto;
  text-align: center;
}

.prop-head {
  display: flex;
  justify-content: center;
}

.prop-kicker {
  display: inline-flex;
  gap: 9px;
  align-items: center;
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

.prop-formula {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1.05fr);
  gap: 18px;
  align-items: stretch;
  margin-top: 30px;
}

.prop-card {
  --card-rgb: 91, 116, 235;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 224px;
  padding: 26px 22px;
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

.prop-card:hover {
  border-color: rgba(var(--card-rgb), 0.34);
  box-shadow:
    0 26px 58px rgba(16, 96, 161, 0.15),
    0 10px 28px rgba(var(--card-rgb), 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    inset 0 -12px 28px rgba(var(--card-rgb), 0.07);
  transform: translateY(-5px);
}

.prop-card-dc3 {
  --card-rgb: 18, 150, 219;
}

.prop-card-tag {
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 640;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.prop-card-name {
  background: linear-gradient(112deg, #07549a 4%, #119bd6 42%, #1786d4 62%, #5558c9 96%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: clamp(26px, 2.6vw, 34px);
  font-weight: 780;
  line-height: 1.1;
  letter-spacing: -0.02em;
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

.prop-card-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  justify-content: center;
}

.prop-card-chips span {
  padding: 4px 11px;
  border: 1px solid rgba(var(--card-rgb), 0.22);
  border-radius: 999px;
  background: color-mix(in srgb, rgb(var(--card-rgb)) 8%, transparent);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 620;
}

.prop-card-desc {
  max-width: 240px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.prop-op {
  display: grid;
  place-items: center;
  color: var(--vp-c-text-3);
  font-size: 30px;
  font-weight: 300;
  font-family: var(--vp-font-family-mono);
}

.prop-result {
  --card-rgb: 18, 150, 219;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 224px;
  padding: 26px 22px;
  overflow: hidden;
  border: 1px solid rgba(24, 191, 220, 0.5);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 50% -20%, rgba(126, 239, 255, 0.5), transparent 55%),
    linear-gradient(150deg, #07549a, #0d8fd0 46%, #17b9c9 78%, #4f52bf 115%);
  box-shadow:
    0 26px 58px rgba(13, 114, 180, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
  color: #ffffff;
  transition: transform 300ms ease, box-shadow 300ms ease;
}

.prop-result:hover {
  box-shadow:
    0 32px 68px rgba(13, 114, 180, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transform: translateY(-5px);
}

.prop-result-name {
  font-size: clamp(24px, 2.4vw, 31px);
  font-weight: 780;
  line-height: 1.05;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 14px rgba(5, 60, 110, 0.35);
}

.prop-result-flow {
  padding: 7px 15px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 13px;
  font-weight: 640;
  letter-spacing: 0.02em;
  backdrop-filter: blur(8px);
}

.prop-summary {
  max-width: 640px;
  margin: 30px auto 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.75;
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
  .prop-formula {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .prop-op {
    height: 18px;
    font-size: 22px;
  }

  .prop-card,
  .prop-result {
    min-height: 0;
    padding: 24px 20px;
  }

  .prop-card-desc {
    max-width: 420px;
  }
}

@media (max-width: 640px) {
  .prop-section {
    padding-top: 48px;
  }

  .prop-summary {
    font-size: 15px;
  }
}
</style>
