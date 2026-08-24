<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))

const copy = computed(() => isEnglish.value ? {
  kicker: 'The Physical AI Loop',
  title: 'Two worlds, one runtime',
  description: 'Devices on the left, intelligence on the right, IoT DC3 in between.',
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
  description: '左边是设备，右边是智能，中间是 IoT DC3。',
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
            <linearGradient id="loop-node-bg-ai" x1="0" y1="0" x2="0" y2="1">
              <stop class="loop-stop-ai-a" offset="0" />
              <stop class="loop-stop-ai-b" offset="1" />
            </linearGradient>
            <linearGradient id="loop-node-bg-core" x1="0" y1="0" x2="0" y2="1">
              <stop class="loop-stop-core-a" offset="0" />
              <stop class="loop-stop-core-b" offset="1" />
            </linearGradient>
            <radialGradient id="loop-packet-halo-gradient">
              <stop offset="0" stop-color="#e4ffff" stop-opacity="0.82" />
              <stop offset="0.28" stop-color="#5ae7f3" stop-opacity="0.44" />
              <stop offset="1" stop-color="#1296db" stop-opacity="0" />
            </radialGradient>
            <filter id="loop-node-shadow" x="-30%" y="-60%" width="160%" height="240%">
              <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="rgba(16, 96, 161, 0.18)" />
            </filter>
            <filter id="loop-core-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="rgba(24, 191, 220, 0.32)" />
            </filter>
            <filter id="loop-energy-glow" x="-80%" y="-160%" width="260%" height="420%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
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
          <g v-for="(label, index) in copy.intelligenceNodes" :key="'i' + label" class="loop-node loop-node-side loop-node-ai">
            <rect :x="rightX - pillW / 2" :y="nodeY[index] - pillH / 2" :width="pillW" :height="pillH" rx="13" />
            <text class="loop-node-label" :x="rightX" :y="nodeY[index] + 5" text-anchor="middle">{{ label }}</text>
          </g>

          <!-- bus trunks -->
          <path class="loop-trunk" :d="`M${trunkX} 90 V330`" />
          <path class="loop-trunk" :d="`M${trunkRightX} 90 V330`" />
          <path v-for="y in nodeY" :key="'l' + y" class="loop-stub" :d="`M${leftX + pillW / 2} ${y} L${trunkX} ${y}`" />
          <path v-for="y in nodeY" :key="'r' + y" class="loop-stub" :d="`M${trunkRightX} ${y} L${rightX - pillW / 2} ${y}`" />

          <!-- runtime energy field -->
          <g class="loop-core-field">
            <rect class="loop-core-orbit loop-core-orbit-outer" x="444" y="122" width="312" height="176" rx="38" />
            <rect class="loop-core-orbit loop-core-orbit-inner" x="458" y="136" width="284" height="148" rx="29" />
          </g>

          <!-- core -->
          <g class="loop-node loop-node-core">
            <rect class="loop-core-shell" x="472" y="150" width="256" height="120" rx="20" />
            <text class="loop-core-label" x="600" y="200" text-anchor="middle">{{ copy.coreLabel }}</text>
            <text class="loop-core-sub" x="600" y="228" text-anchor="middle">{{ copy.coreSub }}</text>
          </g>

          <!-- trunk <-> core links (arrows show flow direction) -->
          <path class="loop-line loop-line-h" :d="`M${trunkX} 210 L470 210`" />
          <path class="loop-line loop-line-h" d="M730 210 L870 210" />
          <path class="loop-line loop-line-h" d="M470 330 L330 330" />
          <path class="loop-line loop-line-h" d="M870 330 L730 330" />

          <!-- circular light packets moving through every direction of the loop -->
          <g class="loop-packet">
            <circle class="loop-packet-halo" r="9" />
            <circle class="loop-packet-core" r="2.8" />
            <animateMotion dur="2.4s" repeatCount="indefinite" :path="`M${trunkX} 210 L470 210`" />
          </g>
          <g class="loop-packet">
            <circle class="loop-packet-halo" r="9" />
            <circle class="loop-packet-core" r="2.8" />
            <animateMotion begin="-0.65s" dur="2.4s" repeatCount="indefinite" path="M730 210 L870 210" />
          </g>
          <g class="loop-packet">
            <circle class="loop-packet-halo" r="9" />
            <circle class="loop-packet-core" r="2.8" />
            <animateMotion begin="-1.2s" dur="2.4s" repeatCount="indefinite" path="M470 330 L330 330" />
          </g>
          <g class="loop-packet">
            <circle class="loop-packet-halo" r="9" />
            <circle class="loop-packet-core" r="2.8" />
            <animateMotion begin="-1.75s" dur="2.4s" repeatCount="indefinite" path="M870 330 L730 330" />
          </g>

          <!-- direction labels -->
          <text class="loop-dir-label" x="401" y="198" text-anchor="middle">{{ copy.flow[0] }}</text>
          <text class="loop-dir-label" x="799" y="198" text-anchor="middle">{{ copy.flow[1] }}</text>
          <text class="loop-dir-label" x="799" y="318" text-anchor="middle">{{ copy.flow[2] }}</text>
          <text class="loop-dir-label" x="401" y="318" text-anchor="middle">{{ copy.flow[3] }}</text>

          <!-- feedback arc -->
          <path class="loop-line loop-line-feedback" d="M472 270 C300 270, 300 420, 600 420 C900 420, 900 270, 728 270" />
          <g class="loop-packet loop-packet-feedback">
            <circle class="loop-packet-halo" r="10" />
            <circle class="loop-packet-core" r="3" />
            <animateMotion begin="-1.4s" dur="5.2s" repeatCount="indefinite" path="M472 270 C300 270, 300 420, 600 420 C900 420, 900 270, 728 270" />
          </g>
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
          <div class="loop-chain-world loop-chain-world-physical">
            <p class="loop-chain-col">
              <span class="loop-chain-world-dot" aria-hidden="true"></span>
              {{ copy.physicalLabel }}
            </p>
            <ol class="loop-chain-list">
              <li v-for="node in copy.physicalNodes" :key="node">{{ node }}</li>
            </ol>
          </div>

          <div class="loop-chain-channel">
            <span>{{ copy.flow[0] }} ↓</span>
            <span>↑ {{ copy.flow[3] }}</span>
          </div>

          <div class="loop-chain-core">
            <span class="loop-chain-core-name">{{ copy.coreLabel }}</span>
            <span class="loop-chain-core-sub">{{ copy.coreSub }}</span>
          </div>

          <div class="loop-chain-channel loop-chain-channel-ai">
            <span>{{ copy.flow[1] }} ↓</span>
            <span>↑ {{ copy.flow[2] }}</span>
          </div>

          <div class="loop-chain-world loop-chain-world-ai">
            <p class="loop-chain-col">
              <span class="loop-chain-world-dot" aria-hidden="true"></span>
              {{ copy.intelligenceLabel }}
            </p>
            <ol class="loop-chain-list">
              <li v-for="node in copy.intelligenceNodes" :key="node">{{ node }}</li>
            </ol>
          </div>

          <p class="loop-chain-feedback">
            <span aria-hidden="true">↺</span>
            {{ copy.flow[4] }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.loop-section {
  position: relative;
  width: 100vw;
  margin-top: 0;
  margin-left: calc(-50vw + 50%);
  padding: 112px 32px 104px;
  overflow: hidden;
  border-top: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  background:
    radial-gradient(circle at 12% 16%, rgba(18, 150, 219, 0.1), transparent 32%),
    radial-gradient(circle at 86% 62%, rgba(91, 116, 235, 0.08), transparent 34%),
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg-alt) 58%, transparent), color-mix(in srgb, var(--vp-c-bg-alt) 82%, transparent));
  content-visibility: auto;
  contain-intrinsic-size: auto 780px;
}

.loop-inner {
  width: min(var(--dc3-container), 100%);
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
  position: relative;
  margin-top: 42px;
  padding: 18px 14px 8px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
  border-radius: 32px;
  background:
    radial-gradient(circle at 50% 48%, rgba(41, 197, 223, 0.1), transparent 30%),
    radial-gradient(circle at 12% 22%, rgba(18, 150, 219, 0.07), transparent 32%),
    radial-gradient(circle at 88% 70%, rgba(91, 116, 235, 0.08), transparent 34%),
    color-mix(in srgb, var(--vp-c-bg-elv) 56%, transparent);
  box-shadow: 0 28px 80px rgba(16, 96, 161, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(18px) saturate(1.15);
}

.loop-stage::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(color-mix(in srgb, var(--vp-c-brand-1) 7%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--vp-c-brand-1) 7%, transparent) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(ellipse at center, #000 12%, rgba(0, 0, 0, 0.72) 52%, transparent 88%);
  pointer-events: none;
}

.loop-svg {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: auto;
}

.loop-node-side rect {
  fill: url(#loop-node-bg);
  stroke: rgba(151, 219, 248, 0.3);
  stroke-width: 1.2;
  filter: url(#loop-node-shadow);
  transition: stroke 280ms ease, filter 280ms ease;
}

.loop-node-ai rect {
  fill: url(#loop-node-bg-ai);
  stroke: rgba(139, 128, 255, 0.28);
}

.loop-node-core .loop-core-shell {
  fill: url(#loop-node-bg-core);
  stroke: rgba(24, 191, 220, 0.5);
  stroke-width: 1.4;
  filter: url(#loop-core-glow);
}

.loop-node-side,
.loop-node-core {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 340ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.loop-node-side:hover {
  transform: translateY(-3px) scale(1.035);
}

.loop-node-side:hover rect {
  stroke: rgba(69, 203, 235, 0.72);
  filter: url(#loop-core-glow);
}

.loop-node-ai:hover rect {
  stroke: rgba(126, 121, 244, 0.72);
}

.loop-node-core:hover {
  transform: scale(1.025);
}

.loop-core-field {
  pointer-events: none;
}

.loop-core-orbit {
  fill: none;
  stroke: rgba(41, 197, 223, 0.24);
  stroke-width: 1;
  stroke-dasharray: 8 10;
  transform-box: fill-box;
  transform-origin: center;
  animation: loop-core-orbit 8s linear infinite;
}

.loop-core-orbit-inner {
  stroke: rgba(91, 116, 235, 0.22);
  stroke-dasharray: 5 8;
  animation-direction: reverse;
  animation-duration: 6s;
}

.loop-stop-a {
  stop-color: var(--vp-c-bg-elv);
}

.loop-stop-b {
  stop-color: color-mix(in srgb, #1296db 11%, var(--vp-c-bg-elv));
}

.loop-stop-ai-a {
  stop-color: var(--vp-c-bg-elv);
}

.loop-stop-ai-b {
  stop-color: color-mix(in srgb, #6c7bf0 13%, var(--vp-c-bg-elv));
}

.loop-stop-core-a {
  stop-color: var(--vp-c-bg-elv);
}

.loop-stop-core-b {
  stop-color: color-mix(in srgb, #17b9c9 15%, var(--vp-c-bg-elv));
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
  fill: var(--vp-c-brand-1);
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

.loop-packet {
  pointer-events: none;
}

.loop-packet-halo {
  fill: url(#loop-packet-halo-gradient);
  opacity: 0.78;
}

.loop-packet-core {
  fill: #eaffff;
  stroke: rgba(56, 211, 234, 0.7);
  stroke-width: 0.8;
  filter: url(#loop-energy-glow);
}

.loop-packet-feedback .loop-packet-halo {
  opacity: 0.68;
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

:global(.dark .loop-node-side rect) {
  stroke: rgba(143, 216, 250, 0.18);
}

:global(.dark .loop-node-ai rect) {
  stroke: rgba(151, 143, 255, 0.22);
}

:global(.dark .loop-node-core .loop-core-shell) {
  stroke: rgba(96, 208, 240, 0.38);
}

:global(.dark .loop-stage) {
  box-shadow: 0 30px 86px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(196, 239, 255, 0.07);
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

@keyframes loop-core-orbit {
  to { stroke-dashoffset: -72; }
}

@media (max-width: 839.98px) {
  .loop-section {
    margin-top: 0;
    padding: 72px 18px 68px;
  }

  .loop-stage {
    margin-top: 34px;
    padding: 16px 14px 18px;
    border-radius: 26px;
  }

  .loop-svg {
    display: none;
  }

  .loop-chain {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .loop-chain-world {
    width: 100%;
    padding: 17px;
    border: 1px solid rgba(151, 219, 248, 0.3);
    border-radius: 19px;
    background:
      radial-gradient(circle at 12% 0%, rgba(255, 255, 255, 0.7), transparent 38%),
      linear-gradient(145deg, rgba(255, 255, 255, 0.42), rgba(18, 150, 219, 0.08), rgba(91, 116, 235, 0.04));
    box-shadow: 0 15px 34px rgba(16, 96, 161, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.76);
  }

  .loop-chain-world-ai {
    border-color: rgba(146, 139, 245, 0.26);
    background:
      radial-gradient(circle at 88% 0%, rgba(255, 255, 255, 0.68), transparent 38%),
      linear-gradient(145deg, rgba(255, 255, 255, 0.42), rgba(91, 116, 235, 0.09), rgba(18, 150, 219, 0.04));
  }

  .loop-chain-col {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    margin: 0 0 13px;
    color: var(--vp-c-text-2);
    font-size: 11px;
    font-weight: 720;
    letter-spacing: 0.18em;
  }

  .loop-chain-world-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #29c5df;
    box-shadow: 0 0 12px rgba(41, 197, 223, 0.48);
  }

  .loop-chain-world-ai .loop-chain-world-dot {
    background: #777eea;
    box-shadow: 0 0 12px rgba(119, 126, 234, 0.44);
  }

  .loop-chain-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .loop-chain-list li {
    display: grid;
    place-items: center;
    min-height: 40px;
    padding: 8px 10px;
    border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 14%, var(--vp-c-divider));
    border-radius: 11px;
    background: color-mix(in srgb, var(--vp-c-bg-elv) 72%, transparent);
    color: var(--vp-c-text-1);
    font-size: 13px;
    font-weight: 660;
    text-align: center;
  }

  .loop-chain-list li:last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }

  .loop-chain-channel {
    position: relative;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 64px;
  }

  .loop-chain-channel::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background: linear-gradient(180deg, rgba(41, 197, 223, 0.08), rgba(41, 197, 223, 0.62), rgba(91, 116, 235, 0.12));
  }

  .loop-chain-channel span {
    position: relative;
    z-index: 1;
    min-width: 84px;
    padding: 6px 10px;
    border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--vp-c-bg-elv) 88%, transparent);
    color: var(--vp-c-brand-1);
    font-size: 11px;
    font-weight: 680;
    text-align: center;
  }

  .loop-chain-core {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: min(300px, 88%);
    min-height: 112px;
    margin: 0;
    padding: 18px 34px;
    border: 1px solid rgba(24, 191, 220, 0.44);
    border-radius: 21px;
    background:
      radial-gradient(circle at 50% -10%, rgba(140, 240, 255, 0.26), transparent 55%),
      linear-gradient(160deg, rgba(255, 255, 255, 0.55), rgba(18, 150, 219, 0.13) 60%, rgba(91, 116, 235, 0.09));
    box-shadow: 0 18px 42px rgba(13, 114, 180, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .loop-chain-core::before,
  .loop-chain-core::after {
    content: '';
    position: absolute;
    border: 1px dashed rgba(41, 197, 223, 0.25);
    border-radius: 27px;
    pointer-events: none;
  }

  .loop-chain-core::before { inset: -7px; }

  .loop-chain-core::after {
    inset: -13px;
    border-color: rgba(91, 116, 235, 0.16);
  }

  .loop-chain-core-name {
    position: relative;
    z-index: 1;
    color: var(--vp-c-text-1);
    font-size: 22px;
    font-weight: 760;
  }

  .loop-chain-core-sub {
    position: relative;
    z-index: 1;
    color: var(--vp-c-brand-1);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .loop-chain-feedback {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    min-width: 128px;
    margin: 16px 0 0;
    padding: 8px 16px;
    border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--vp-c-brand-soft) 48%, transparent);
    color: var(--vp-c-brand-1);
    font-size: 12px;
    font-weight: 700;
  }

  .loop-chain-feedback > span {
    font-size: 17px;
    line-height: 1;
  }

  :global(.dark .loop-chain-world) {
    border-color: rgba(143, 216, 250, 0.16);
    background:
      radial-gradient(circle at 16% 0%, rgba(205, 245, 255, 0.11), transparent 42%),
      linear-gradient(135deg, rgba(22, 113, 169, 0.1), rgba(17, 35, 52, 0.3) 58%, rgba(61, 62, 143, 0.11));
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(232, 251, 255, 0.08);
  }

  :global(.dark .loop-chain-world-ai) {
    border-color: rgba(151, 143, 255, 0.18);
  }

  :global(.dark .loop-chain-list li) {
    background: rgba(14, 34, 51, 0.55);
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
  .loop-dot,
  .loop-core-orbit {
    animation: none;
  }

  .loop-packet {
    display: none;
  }

  .loop-node-side,
  .loop-node-core {
    transition: none;
  }
}

@media (min-width: 560px) and (max-width: 839.98px) {
  .loop-stage { padding: 22px; }

  .loop-chain-world { padding: 20px; }

  .loop-chain-list {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .loop-chain-list li:last-child:nth-child(odd) {
    grid-column: auto;
  }

  .loop-chain-core { width: 360px; }
}
</style>
