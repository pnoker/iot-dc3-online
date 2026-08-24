<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))

const copy = computed(() => isEnglish.value ? {
  kicker: 'The Physical AI Loop',
  title: 'Two worlds, one runtime',
  description: 'Devices on the left, intelligence on the right. IoT DC3 is the single layer in between — telemetry flows up, context, tools and commands flow down, and feedback closes the loop.',
  physicalLabel: 'PHYSICAL WORLD',
  intelligenceLabel: 'INTELLIGENCE',
  physicalNodes: ['PLC', 'Sensor', 'Robot', 'CNC', 'Camera'],
  intelligenceNodes: ['Agent', 'LLM', 'Reasoning', 'Planning', 'Memory'],
  coreLabel: 'IoT DC3',
  coreSub: 'Runtime',
  flow: ['Telemetry', 'Context', 'Tool Call', 'Command', 'Feedback']
} : {
  kicker: '物理智能闭环',
  title: '两个世界，一个 Runtime',
  description: '左边是设备，右边是智能。IoT DC3 是它们之间唯一的中介层 —— 遥测上行，上下文、工具与指令下行，反馈闭环。',
  physicalLabel: '物理世界',
  intelligenceLabel: '智能世界',
  physicalNodes: ['PLC', '传感器', '机器人', '机床', '摄像头'],
  intelligenceNodes: ['Agent', 'LLM', '推理', '规划', '记忆'],
  coreLabel: 'IoT DC3',
  coreSub: 'Runtime',
  flow: ['遥测', '上下文', '工具调用', '指令', '反馈']
})

// SVG geometry
const leftX = 150
const rightX = 1050
const nodeY = [90, 150, 210, 270, 330]
const pillW = 190
const pillH = 44
const trunkX = 330
const trunkRightX = 870
const coreY = 210
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
        <svg class="loop-svg" viewBox="0 0 1200 470" role="img" :aria-label="copy.title">
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

          <!-- column headers -->
          <text class="loop-col-label" :x="leftX" y="42" text-anchor="middle">{{ copy.physicalLabel }}</text>
          <text class="loop-col-label" :x="rightX" y="42" text-anchor="middle">{{ copy.intelligenceLabel }}</text>

          <!-- left world pills -->
          <g v-for="(label, index) in copy.physicalNodes" :key="'p' + label" class="loop-node loop-node-side">
            <rect :x="leftX - pillW / 2" :y="nodeY[index] - pillH / 2" :width="pillW" :height="pillH" rx="13" />
            <text class="loop-node-label" :x="leftX" :y="nodeY[index] + 5" text-anchor="middle">{{ label }}</text>
          </g>

          <!-- right world pills -->
          <g v-for="(label, index) in copy.intelligenceNodes" :key="'i' + label" class="loop-node loop-node-side">
            <rect :x="rightX - pillW / 2" :y="nodeY[index] - pillH / 2" :width="pillW" :height="pillH" rx="13" />
            <text class="loop-node-label" :x="rightX" :y="nodeY[index] + 5" text-anchor="middle">{{ label }}</text>
          </g>

          <!-- bus trunks -->
          <path class="loop-trunk" :d="`M${trunkX} 90 V330`" />
          <path class="loop-trunk" :d="`M${trunkRightX} 90 V330`" />
          <path v-for="y in nodeY" :key="'l' + y" class="loop-stub" :d="`M${leftX + pillW / 2} ${y} L${trunkX} ${y}`" />
          <path v-for="y in nodeY" :key="'r' + y" class="loop-stub" :d="`M${trunkRightX} ${y} L${rightX - pillW / 2} ${y}`" />

          <!-- core -->
          <g class="loop-node loop-node-core">
            <rect x="472" y="150" width="256" height="120" rx="20" />
            <text class="loop-core-label" x="600" y="200" text-anchor="middle">{{ copy.coreLabel }}</text>
            <text class="loop-core-sub" x="600" y="228" text-anchor="middle">{{ copy.coreSub }}</text>
          </g>

          <!-- trunk <-> core links (arrows show flow direction) -->
          <path class="loop-line loop-line-h" :d="`M${trunkX} 210 L470 210`" />
          <path class="loop-line loop-line-h" d="M730 210 L870 210" />
          <path class="loop-line loop-line-h" d="M470 330 L330 330" />
          <path class="loop-line loop-line-h" d="M870 330 L730 330" />

          <!-- direction labels -->
          <text class="loop-dir-label" x="401" y="198" text-anchor="middle">{{ copy.flow[0] }}</text>
          <text class="loop-dir-label" x="799" y="198" text-anchor="middle">{{ copy.flow[1] }}</text>
          <text class="loop-dir-label" x="799" y="318" text-anchor="middle">{{ copy.flow[2] }}</text>
          <text class="loop-dir-label" x="401" y="318" text-anchor="middle">{{ copy.flow[3] }}</text>

          <!-- feedback arc -->
          <path class="loop-line loop-line-feedback" d="M472 270 C300 270, 300 420, 600 420 C900 420, 900 270, 728 270" />
          <text class="loop-feedback-label" x="600" y="448" text-anchor="middle">{{ copy.flow[4] }}</text>

          <!-- flowing dots -->
          <circle class="loop-dot" cx="400" cy="210" r="4" />
          <circle class="loop-dot" cx="800" cy="210" r="4" />
          <circle class="loop-dot" cx="800" cy="330" r="4" />
          <circle class="loop-dot" cx="400" cy="330" r="4" />
          <circle class="loop-dot" cx="600" cy="392" r="4" />
        </svg>

        <!-- Mobile two-column chain -->
        <div class="loop-chain">
          <p class="loop-chain-col">{{ copy.physicalLabel }}</p>
          <ol class="loop-chain-list">
            <li v-for="node in copy.physicalNodes" :key="node">{{ node }}</li>
          </ol>
          <div class="loop-chain-core">
            <span class="loop-chain-core-name">{{ copy.coreLabel }}</span>
            <span class="loop-chain-core-sub">{{ copy.coreSub }}</span>
          </div>
          <ol class="loop-chain-list loop-chain-list-right">
            <li v-for="node in copy.intelligenceNodes" :key="node">{{ node }}</li>
          </ol>
          <p class="loop-chain-col">{{ copy.intelligenceLabel }}</p>
          <p class="loop-chain-flow">
            <span v-for="(step, index) in copy.flow" :key="step">
              {{ step }}<span v-if="index < copy.flow.length - 1" class="loop-chain-arrow">→</span>
            </span>
          </p>
        </div>
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

.loop-node-core rect {
  stroke: rgba(24, 191, 220, 0.46);
  stroke-width: 1.4;
}

.loop-stop-a {
  stop-color: var(--vp-c-bg-elv);
}

.loop-stop-b {
  stop-color: var(--vp-c-brand-soft);
}

.loop-col-label {
  fill: var(--vp-c-text-3);
  font-size: 12px;
  font-weight: 720;
  letter-spacing: 0.22em;
}

.loop-node-label {
  fill: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 680;
  letter-spacing: 0.02em;
}

.loop-core-label {
  fill: var(--vp-c-text-1);
  font-size: 24px;
  font-weight: 760;
  letter-spacing: -0.01em;
}

.loop-core-sub {
  fill: var(--vp-c-brand-1);
  font-size: 13px;
  font-weight: 680;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.loop-trunk {
  fill: none;
  stroke: color-mix(in srgb, var(--vp-c-brand-1) 26%, transparent);
  stroke-width: 1.6;
}

.loop-stub {
  fill: none;
  stroke: color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent);
  stroke-width: 1.2;
  stroke-dasharray: 3 4;
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

.loop-dir-label {
  fill: var(--vp-c-text-3);
  font-size: 10.5px;
  font-weight: 640;
  letter-spacing: 0.08em;
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

:global(.dark .loop-node-core rect) {
  stroke: rgba(96, 208, 240, 0.38);
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
    gap: 10px;
  }

  .loop-chain-col {
    margin: 10px 0 0;
    color: var(--vp-c-text-3);
    font-size: 11px;
    font-weight: 720;
    letter-spacing: 0.22em;
  }

  .loop-chain-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(300px, 100%);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .loop-chain-list li {
    padding: 9px 18px;
    border: 1px solid rgba(151, 219, 248, 0.28);
    border-radius: 12px;
    background:
      radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.7), transparent 42%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.44), rgba(18, 150, 219, 0.08) 56%, rgba(91, 116, 235, 0.06));
    box-shadow: 0 12px 28px rgba(16, 96, 161, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(16px) saturate(1.3);
    color: var(--vp-c-text-1);
    font-size: 14px;
    font-weight: 660;
    text-align: center;
  }

  .loop-chain-core {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    margin: 8px 0;
    padding: 16px 34px;
    border: 1px solid rgba(24, 191, 220, 0.44);
    border-radius: 18px;
    background:
      radial-gradient(circle at 50% -10%, rgba(140, 240, 255, 0.26), transparent 55%),
      linear-gradient(160deg, rgba(255, 255, 255, 0.55), rgba(18, 150, 219, 0.13) 60%, rgba(91, 116, 235, 0.09));
    box-shadow: 0 18px 42px rgba(13, 114, 180, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .loop-chain-core-name {
    color: var(--vp-c-text-1);
    font-size: 20px;
    font-weight: 760;
  }

  .loop-chain-core-sub {
    color: var(--vp-c-brand-1);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .loop-chain-flow {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    justify-content: center;
    margin: 12px 0 0;
    color: var(--vp-c-text-2);
    font-size: 12px;
    font-weight: 640;
  }

  .loop-chain-arrow {
    margin-left: 10px;
    color: var(--vp-c-brand-1);
  }

  :global(.dark .loop-chain-list li) {
    border-color: rgba(143, 216, 250, 0.16);
    background:
      radial-gradient(circle at 16% 0%, rgba(205, 245, 255, 0.11), transparent 42%),
      linear-gradient(135deg, rgba(22, 113, 169, 0.1), rgba(17, 35, 52, 0.3) 58%, rgba(61, 62, 143, 0.11));
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(232, 251, 255, 0.08);
  }

  :global(.dark .loop-chain-core) {
    border-color: rgba(96, 208, 240, 0.38);
    background:
      radial-gradient(circle at 50% -10%, rgba(96, 218, 255, 0.16), transparent 55%),
      linear-gradient(160deg, rgba(22, 113, 169, 0.18), rgba(17, 35, 52, 0.3) 60%, rgba(61, 62, 143, 0.16));
  }
}

@media (prefers-reduced-motion: reduce) {
  .loop-line,
  .loop-dot {
    animation: none;
  }
}
</style>
