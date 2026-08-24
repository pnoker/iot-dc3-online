<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))

const copy = computed(() => isEnglish.value ? {
  kicker: 'Where We Are Going',
  title: 'One project, three acts',
  description: 'The fundamentals stay. The story moves forward.',
  stages: [
    {era: 'Past', title: 'Open-source IoT Platform', description: 'A decade of device access and industrial fundamentals.', now: false},
    {era: 'Now', title: 'AI-powered Industrial IoT Platform', description: 'Spring AI, MCP and agents — built in, not bolted on.', now: true},
    {era: 'Future', title: 'Open-source Physical AI Infrastructure', description: 'Let models reach the physical world, safely.', now: false}
  ],
  compareTitle: 'Side by side with DeepSeek Harness',
  compareCaption: 'Harness connects models to software. DC3 connects agents to the physical world.',
  rows: [
    ['Model', 'Model'],
    ['Shell / File', 'Device / Point'],
    ['Tool', 'Industrial Tool'],
    ['Sandbox', 'Industrial Runtime'],
    ['Session', 'Agent Session'],
    ['Tool Call', 'Command'],
    ['Computer Environment', 'Physical Environment'],
    ['Coding Agent', 'Industrial Agent'],
    ['Agent Harness', 'Physical AI Runtime']
  ],
  closing: 'Harness connects models to software. DC3 connects agents to the physical world.'
} : {
  kicker: '定位演进',
  title: '三级定位：从平台，走向物理智能基础设施',
  description: '基本盘不变，叙事向前。',
  stages: [
    {era: '过去', title: '开源物联网平台', description: '十年设备接入与工业场景的基本盘。', now: false},
    {era: '现在', title: 'AI 赋能的工业物联网平台', description: 'Spring AI、MCP 与智能体 —— 内建能力，而非外挂。', now: true},
    {era: '未来', title: '开源的物理智能基础设施', description: '让模型安全地进入物理世界。', now: false}
  ],
  compareTitle: '与 DeepSeek Harness 的对应关系',
  compareCaption: 'Harness 让模型进入软件世界，DC3 让智能体进入物理世界。',
  rows: [
    ['Model', 'Model'],
    ['Shell / File', 'Device / Point'],
    ['Tool', '工业 Tool'],
    ['Sandbox', '工业 Runtime'],
    ['Session', 'Agent Session'],
    ['Tool Call', 'Command'],
    ['Computer Environment', 'Physical Environment'],
    ['Coding Agent', '工业 Agent'],
    ['Agent Harness', 'Physical AI Runtime']
  ],
  closing: 'Harness 让模型进入软件世界，DC3 让智能体进入物理世界。'
})
</script>

<template>
  <section class="positioning-section" :aria-label="copy.kicker">
    <div class="positioning-inner">
      <div class="positioning-head">
        <span class="positioning-kicker">
          <span class="positioning-kicker-dot" aria-hidden="true"></span>
          {{ copy.kicker }}
        </span>
        <h2 class="positioning-title">{{ copy.title }}</h2>
        <p class="positioning-description">{{ copy.description }}</p>
      </div>

      <ol class="positioning-timeline">
        <li v-for="stage in copy.stages" :key="stage.title" class="positioning-stage" :class="{active: stage.now}">
          <span class="positioning-era">{{ stage.era }}</span>
          <span v-if="stage.now" class="positioning-badge">●</span>
          <h3 class="positioning-stage-title">{{ stage.title }}</h3>
          <p class="positioning-stage-description">{{ stage.description }}</p>
        </li>
      </ol>

      <div class="positioning-compare">
        <h3 class="positioning-compare-title">{{ copy.compareTitle }}</h3>
        <p class="positioning-compare-caption">{{ copy.compareCaption }}</p>

        <div class="positioning-rows">
          <div v-for="row in copy.rows" :key="row[0]" class="positioning-row">
            <span class="positioning-row-left">{{ row[0] }}</span>
            <span class="positioning-row-arrow" aria-hidden="true">→</span>
            <span class="positioning-row-right">{{ row[1] }}</span>
          </div>
        </div>

        <p class="positioning-closing">{{ copy.closing }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.positioning-section {
  position: relative;
  width: 100%;
  margin-top: 108px;
  padding: 84px 32px 92px;
  overflow: hidden;
  border-top: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  background:
    radial-gradient(circle at 88% 12%, rgba(91, 116, 235, 0.08), transparent 30%),
    radial-gradient(circle at 8% 84%, rgba(18, 150, 219, 0.08), transparent 30%),
    linear-gradient(180deg, transparent, color-mix(in srgb, var(--vp-c-bg-alt) 66%, transparent));
}

.positioning-inner {
  width: min(1152px, 100%);
  margin: 0 auto;
}

.positioning-head {
  text-align: center;
}

.positioning-kicker {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 720;
  letter-spacing: 0.16em;
}

.positioning-kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #29c5df, #6773e5);
  box-shadow: 0 0 12px rgba(41, 197, 223, 0.5);
}

.positioning-title {
  max-width: 760px;
  margin: 16px auto 0;
  border: none;
  color: var(--vp-c-text-1);
  font-size: clamp(28px, 3.2vw, 42px);
  font-weight: 740;
  line-height: 1.16;
  letter-spacing: -0.035em;
}

.positioning-description {
  max-width: 680px;
  margin: 14px auto 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.75;
}

.positioning-timeline {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  margin: 54px 0 0;
  padding: 0;
  list-style: none;
}

.positioning-timeline::before {
  content: '';
  position: absolute;
  top: 32px;
  left: 8%;
  right: 8%;
  height: 2px;
  background: linear-gradient(90deg, rgba(18, 150, 219, 0.14), rgba(18, 150, 219, 0.5) 45%, rgba(91, 116, 235, 0.7));
}

.positioning-stage {
  --card-rgb: 18, 150, 219;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 74px 26px 28px;
  text-align: center;
  border: 1px solid rgba(151, 219, 248, 0.26);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.72), transparent 46%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.42), rgba(var(--card-rgb), 0.08) 60%, rgba(77, 83, 199, 0.05));
  box-shadow: 0 16px 40px rgba(16, 96, 161, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(18px) saturate(1.3);
  transition: transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
}

.positioning-stage:hover {
  border-color: rgba(var(--card-rgb), 0.36);
  transform: translateY(-5px);
}

.positioning-stage::before {
  content: '';
  position: absolute;
  top: -25px;
  left: 50%;
  width: 14px;
  height: 14px;
  border: 3px solid var(--vp-c-bg);
  border-radius: 50%;
  background: linear-gradient(135deg, #29c5df, #6773e5);
  box-shadow: 0 0 0 2px rgba(41, 197, 223, 0.24), 0 0 16px rgba(41, 197, 223, 0.46);
  transform: translateX(-50%);
}

.positioning-stage.active {
  --card-rgb: 18, 150, 219;
  border-color: rgba(24, 191, 220, 0.52);
  background:
    radial-gradient(circle at 50% 0%, rgba(140, 240, 255, 0.34), transparent 52%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.52), rgba(18, 150, 219, 0.14) 60%, rgba(91, 116, 235, 0.1));
  box-shadow:
    0 22px 52px rgba(13, 114, 180, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.positioning-stage.active::before {
  background: linear-gradient(135deg, #13b8dd, #4f8ef0);
  box-shadow: 0 0 0 4px rgba(24, 191, 220, 0.2), 0 0 22px rgba(24, 191, 220, 0.72);
  animation: positioning-pulse 2.2s ease-in-out infinite;
}

.positioning-era {
  position: relative;
  color: var(--vp-c-text-3);
  font-size: 12px;
  font-weight: 720;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.positioning-badge {
  position: absolute;
  top: 22px;
  right: 22px;
  color: #13b8dd;
  font-size: 9px;
  animation: positioning-pulse 2.2s ease-in-out infinite;
}

.positioning-stage-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 19px;
  font-weight: 720;
  line-height: 1.35;
}

.positioning-stage-description {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.7;
}

:global(.dark .positioning-stage) {
  border-color: rgba(143, 216, 250, 0.16);
  background:
    radial-gradient(circle at 50% 0%, rgba(205, 245, 255, 0.1), transparent 46%),
    linear-gradient(160deg, rgba(22, 113, 169, 0.1), rgba(17, 35, 52, 0.3) 60%, rgba(61, 62, 143, 0.11));
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(232, 251, 255, 0.08);
}

:global(.dark .positioning-stage.active) {
  border-color: rgba(96, 208, 240, 0.4);
  background:
    radial-gradient(circle at 50% 0%, rgba(96, 218, 255, 0.18), transparent 52%),
    linear-gradient(160deg, rgba(22, 113, 169, 0.18), rgba(17, 35, 52, 0.3) 60%, rgba(61, 62, 143, 0.16));
}

.positioning-compare {
  max-width: 860px;
  margin: 76px auto 0;
  text-align: center;
}

.positioning-compare-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 24px;
  font-weight: 740;
  letter-spacing: -0.02em;
}

.positioning-compare-caption {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  font-size: 15px;
  line-height: 1.7;
}

.positioning-rows {
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  overflow: hidden;
  border: 1px solid rgba(151, 219, 248, 0.26);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.66), transparent 42%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(18, 150, 219, 0.07) 56%, rgba(91, 116, 235, 0.05));
  box-shadow: 0 16px 40px rgba(16, 96, 161, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(18px) saturate(1.3);
}

.positioning-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1.15fr);
  gap: 18px;
  align-items: center;
  padding: 12px 26px;
  border-bottom: 1px solid color-mix(in srgb, var(--vp-c-divider) 60%, transparent);
  font-size: 15px;
}

.positioning-row:last-child {
  border-bottom: none;
}

.positioning-row-left {
  color: var(--vp-c-text-3);
  text-align: right;
  font-family: var(--vp-font-family-mono);
}

.positioning-row-arrow {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.positioning-row-right {
  color: var(--vp-c-text-1);
  text-align: left;
  font-weight: 680;
}

:global(.dark .positioning-rows) {
  border-color: rgba(143, 216, 250, 0.14);
  background:
    radial-gradient(circle at 16% 0%, rgba(205, 245, 255, 0.11), transparent 42%),
    linear-gradient(135deg, rgba(22, 113, 169, 0.1), rgba(17, 35, 52, 0.3) 58%, rgba(61, 62, 143, 0.11));
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(232, 251, 255, 0.08);
}

.positioning-closing {
  margin: 34px 0 0;
  background: linear-gradient(112deg, #07549a 4%, #119bd6 42%, #1786d4 62%, #5558c9 96%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: clamp(20px, 2.4vw, 26px);
  font-weight: 780;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

:global(.dark .positioning-closing) {
  background: linear-gradient(112deg, #8edcff 4%, #d3fbff 42%, #7fddff 60%, #a6a9ff 96%);
  background-clip: text;
  -webkit-background-clip: text;
}

@keyframes positioning-pulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}

@media (max-width: 900px) {
  .positioning-section {
    margin-top: 84px;
    padding: 64px 20px 72px;
  }

  .positioning-timeline {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .positioning-timeline::before {
    top: 0;
    bottom: 0;
    left: 50%;
    right: auto;
    width: 2px;
    height: auto;
  }

  .positioning-stage {
    padding-top: 30px;
  }

  .positioning-stage::before {
    top: -21px;
  }

  .positioning-compare {
    margin-top: 56px;
  }
}

@media (max-width: 640px) {
  .positioning-row {
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 14px 18px;
  }

  .positioning-row-left {
    text-align: center;
    font-size: 13px;
  }

  .positioning-row-arrow {
    transform: rotate(90deg);
    font-size: 12px;
  }

  .positioning-row-right {
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .positioning-stage.active::before,
  .positioning-badge {
    animation: none;
  }
}
</style>
