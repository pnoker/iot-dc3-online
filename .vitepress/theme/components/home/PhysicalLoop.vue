<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))

const copy = computed(() => isEnglish.value ? {
  kicker: 'The Physical AI Loop',
  title: 'Devices, data, tools and agents — one controllable loop',
  description: 'From the AI agent down to device commands and back through data feedback — every link of IoT DC3 lives on the same real-time fabric.',
  agentSub: 'reason · plan · memory',
  agenticLabel: 'Agentic Center',
  agenticSub: 'Tool · MCP',
  nodes: [
    {label: 'Device', sub: 'protocol access'},
    {label: 'Driver', sub: 'adapters'},
    {label: 'Data', sub: 'points · quality · time'},
    {label: 'Decision', sub: 'rules · LLM · agent'},
    {label: 'Command', sub: 'write · dispatch'}
  ],
  feedback: 'Feedback',
  loopTag: 'Physical AI Loop'
} : {
  kicker: '物理智能闭环',
  title: '把设备、数据、工具与智能体连成一个闭环',
  description: '从 AI Agent 到设备指令，再回到数据反馈 —— IoT DC3 的每一个环节都连接在同一张实时网络上。',
  agentSub: '推理 · 规划 · 记忆',
  agenticLabel: 'Agentic Center',
  agenticSub: '工具 · MCP',
  nodes: [
    {label: '设备', sub: '多协议接入'},
    {label: '驱动', sub: '协议适配'},
    {label: '数据', sub: '点位 · 质量 · 时间'},
    {label: '决策', sub: '规则 · LLM · Agent'},
    {label: '指令', sub: '写点位 · 下发'}
  ],
  feedback: '反馈',
  loopTag: '物理智能闭环'
})

// Horizontal centers of the five pipeline nodes inside the SVG viewBox
const nodeCenters = [100, 360, 620, 880, 1100]
const nodeY = 300
const nodeW = 170
const nodeH = 64
</script>

<template>
  <section class="loop-section" :aria-label="copy.kicker">
    <div class="loop-inner">
      <div class="loop-head">
        <span class="loop-kicker">
          <span class="loop-kicker-dot" aria-hidden="true"></span>
          {{ copy.kicker }}
        </span>
        <h2 class="loop-title">{{ copy.title }}</h2>
        <p class="loop-description">{{ copy.description }}</p>
      </div>

      <div class="loop-stage" aria-hidden="true">
        <!-- Desktop diagram -->
        <svg class="loop-svg" viewBox="0 0 1200 520" role="img" :aria-label="copy.title">
          <defs>
            <linearGradient id="loop-node-bg" x1="0" y1="0" x2="0" y2="1">
              <stop class="loop-stop-a" offset="0" />
              <stop class="loop-stop-b" offset="1" />
            </linearGradient>
            <filter id="loop-node-shadow" x="-30%" y="-60%" width="160%" height="240%">
              <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="rgba(16, 96, 161, 0.18)" />
            </filter>
            <marker id="loop-arrow" class="loop-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" />
            </marker>
          </defs>

          <!-- AI agent + agentic center -->
          <g class="loop-node">
            <rect x="795" y="52" width="170" height="58" rx="16" />
            <text class="loop-node-label" x="880" y="76" text-anchor="middle">AI Agent</text>
            <text class="loop-node-sub" x="880" y="96" text-anchor="middle">{{ copy.agentSub }}</text>
          </g>
          <g class="loop-node loop-node-agentic">
            <rect x="760" y="136" width="240" height="46" rx="14" />
            <text class="loop-node-label" x="880" y="155" text-anchor="middle">{{ copy.agenticLabel }}</text>
            <text class="loop-node-sub" x="880" y="172" text-anchor="middle">{{ copy.agenticSub }}</text>
          </g>

          <!-- vertical agent line -->
          <path class="loop-line" d="M880 182 L880 268" />

          <!-- pipeline nodes -->
          <g v-for="(node, index) in copy.nodes" :key="node.label" class="loop-node">
            <rect :x="nodeCenters[index] - nodeW / 2" :y="nodeY - nodeH / 2" :width="nodeW" :height="nodeH" rx="16" />
            <text class="loop-node-label" :x="nodeCenters[index]" :y="nodeY - 2" text-anchor="middle">{{ node.label }}</text>
            <text class="loop-node-sub" :x="nodeCenters[index]" :y="nodeY + 18" text-anchor="middle">{{ node.sub }}</text>
          </g>

          <!-- horizontal connectors -->
          <path v-for="index in 4" :key="`h${index}`" class="loop-line loop-line-h"
                :d="`M${nodeCenters[index - 1] + nodeW / 2} ${nodeY} L${nodeCenters[index] - nodeW / 2} ${nodeY}`" />

          <!-- feedback arc -->
          <path class="loop-line loop-line-feedback" d="M1100 332 C1100 462, 100 462, 100 332" />
          <text class="loop-feedback-label" x="600" y="490" text-anchor="middle">{{ copy.feedback }} · {{ copy.loopTag }}</text>

          <!-- flowing dots -->
          <circle class="loop-dot" cx="230" cy="300" r="4" />
          <circle class="loop-dot" cx="490" cy="300" r="4" />
          <circle class="loop-dot" cx="750" cy="300" r="4" />
          <circle class="loop-dot" cx="1010" cy="300" r="4" />
          <circle class="loop-dot" cx="880" cy="224" r="4" />
          <circle class="loop-dot" cx="600" cy="397" r="4" />
        </svg>

        <!-- Mobile vertical chain -->
        <ol class="loop-chain">
          <li class="loop-chain-node">
            <span class="loop-chain-name">AI Agent</span>
            <span class="loop-chain-sub">{{ copy.agentSub }}</span>
          </li>
          <li class="loop-chain-node">
            <span class="loop-chain-name">{{ copy.agenticLabel }}</span>
            <span class="loop-chain-sub">{{ copy.agenticSub }}</span>
          </li>
          <li v-for="node in copy.nodes" :key="node.label" class="loop-chain-node">
            <span class="loop-chain-name">{{ node.label }}</span>
            <span class="loop-chain-sub">{{ node.sub }}</span>
          </li>
          <li class="loop-chain-close">↺ {{ copy.feedback }} · {{ copy.loopTag }}</li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.loop-section {
  position: relative;
  width: 100%;
  margin-top: 28px;
  padding: 84px 32px 78px;
  overflow: hidden;
  border-top: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  background:
    radial-gradient(circle at 12% 16%, rgba(18, 150, 219, 0.08), transparent 30%),
    radial-gradient(circle at 86% 62%, rgba(91, 116, 235, 0.07), transparent 32%),
    linear-gradient(180deg, transparent, color-mix(in srgb, var(--vp-c-bg-alt) 70%, transparent));
}

.loop-inner {
  width: min(1152px, 100%);
  margin: 0 auto;
}

.loop-head {
  text-align: center;
}

.loop-kicker {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 720;
  letter-spacing: 0.16em;
}

.loop-kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #29c5df, #6773e5);
  box-shadow: 0 0 12px rgba(41, 197, 223, 0.5);
}

.loop-title {
  max-width: 760px;
  margin: 16px auto 0;
  border: none;
  color: var(--vp-c-text-1);
  font-size: clamp(28px, 3.2vw, 42px);
  font-weight: 740;
  line-height: 1.16;
  letter-spacing: -0.035em;
}

.loop-description {
  max-width: 680px;
  margin: 14px auto 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.75;
}

.loop-stage {
  margin-top: 42px;
}

.loop-svg {
  display: block;
  width: 100%;
  height: auto;
}

.loop-node rect {
  fill: url(#loop-node-bg);
  stroke: rgba(151, 219, 248, 0.3);
  stroke-width: 1.2;
  filter: url(#loop-node-shadow);
}

.loop-stop-a {
  stop-color: var(--vp-c-bg-elv);
}

.loop-stop-b {
  stop-color: var(--vp-c-brand-soft);
}

.loop-node-label {
  fill: var(--vp-c-text-1);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.loop-node-sub {
  fill: var(--vp-c-text-3);
  font-size: 11.5px;
}

.loop-node-agentic .loop-node-label {
  font-size: 14px;
}

.loop-node-agentic .loop-node-sub {
  font-size: 10.5px;
}

.loop-line {
  fill: none;
  stroke: color-mix(in srgb, var(--vp-c-brand-1) 55%, transparent);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 9 7;
  animation: loop-dash 1.15s linear infinite;
}

.loop-line-h {
  marker-end: url(#loop-arrow);
}

.loop-line-feedback {
  animation-duration: 3.4s;
}

.loop-arrow {
  fill: var(--vp-c-brand-1);
}

.loop-feedback-label {
  fill: var(--vp-c-text-3);
  font-size: 12.5px;
  font-weight: 640;
  letter-spacing: 0.1em;
}

.loop-dot {
  fill: #2fc8dc;
  transform-box: fill-box;
  transform-origin: center;
  animation: loop-pulse 2.4s ease-in-out infinite;
}

.loop-dot:nth-of-type(2n) {
  animation-delay: 0.6s;
}

.loop-dot:nth-of-type(3n) {
  animation-delay: 1.2s;
}

:global(.dark .loop-node rect) {
  stroke: rgba(143, 216, 250, 0.18);
}

:global(.dark .loop-line) {
  stroke: color-mix(in srgb, var(--vp-c-brand-2) 62%, transparent);
}

.loop-chain {
  display: none;
}

@keyframes loop-dash {
  to { stroke-dashoffset: -16; }
}

@keyframes loop-pulse {
  0%, 100% { opacity: 0.65; transform: scale(0.75); }
  50% { opacity: 1; transform: scale(1.25); }
}

@media (max-width: 960px) {
  .loop-section {
    margin-top: 24px;
    padding: 64px 20px 56px;
  }

  .loop-svg {
    display: none;
  }

  .loop-chain {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .loop-chain-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    width: min(320px, 100%);
    padding: 13px 20px;
    border: 1px solid rgba(151, 219, 248, 0.28);
    border-radius: var(--dc3-glass-radius);
    background:
      radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.7), transparent 42%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.44), rgba(18, 150, 219, 0.08) 56%, rgba(91, 116, 235, 0.06));
    box-shadow: 0 14px 34px rgba(16, 96, 161, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(16px) saturate(1.3);
  }

  .loop-chain-node:not(:last-of-type)::after {
    content: '↓';
    margin-top: 6px;
    color: var(--vp-c-brand-1);
    font-size: 15px;
    animation: chain-bob 1.6s ease-in-out infinite;
  }

  .loop-chain-name {
    color: var(--vp-c-text-1);
    font-size: 15px;
    font-weight: 700;
  }

  .loop-chain-sub {
    color: var(--vp-c-text-3);
    font-size: 12px;
  }

  .loop-chain-close {
    margin-top: 14px;
    color: var(--vp-c-brand-1);
    font-size: 13px;
    font-weight: 640;
    letter-spacing: 0.06em;
  }

  :global(.dark .loop-chain-node) {
    border-color: rgba(143, 216, 250, 0.16);
    background:
      radial-gradient(circle at 16% 0%, rgba(205, 245, 255, 0.11), transparent 42%),
      linear-gradient(135deg, rgba(22, 113, 169, 0.1), rgba(17, 35, 52, 0.3) 58%, rgba(61, 62, 143, 0.11));
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(232, 251, 255, 0.08);
  }
}

@keyframes chain-bob {
  0%, 100% { transform: translateY(0); opacity: 0.55; }
  50% { transform: translateY(4px); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .loop-line,
  .loop-dot,
  .loop-chain-node:not(:last-of-type)::after {
    animation: none;
  }
}
</style>
