<script setup lang="ts">
import {computed} from 'vue'
import {DOMAINS} from '../../mock/registry'
import {useI18n} from '../../composables/useI18n'
import {useImmersiveHeader} from '../../composables/useImmersiveHeader'

const {en, t} = useI18n()

useImmersiveHeader({contentSelector: '.demo-gallery-shell'})

const copy = computed(() => en.value ? {
  eyebrow: 'INDUSTRIAL SYSTEMS / LIVE SIGNALS',
  title: 'Turn field data into an intelligence loop you can verify.',
  lead: 'Twelve interactive industry dashboards show how IoT DC3 connects signals, context and action across real operating scenarios.',
  note: 'Live mock data · responsive visualization · traceable metrics',
  stats: [
    {value: '12', label: 'industry scenarios'},
    {value: '36', label: 'protocol drivers'},
    {value: '24 / 7', label: 'continuous sensing'},
  ],
  sectionIndex: '01 / SCENARIO GALLERY',
  sectionTitle: 'Choose a field. Enter its operating view.',
  sectionLead: 'Every scenario uses its own domain language, operating rhythm and key indicators — while sharing one IoT DC3 data foundation.',
  cardAction: 'Enter dashboard',
  sceneLabel: 'SCENE',
  footerIndex: '02 / FROM SIGNAL TO ACTION',
  footerTitle: 'The dashboard is the entry point. The value begins when the field is connected.',
  footerLead: 'Replace mock signals with devices and business systems, then extend the same observable path into alerts, agent tools and governed execution.',
  primary: 'Read the documentation',
  secondary: 'View source code',
} : {
  eyebrow: 'INDUSTRIAL SYSTEMS / LIVE SIGNALS',
  title: '让行业现场，变成可验证的智能闭环',
  lead: '十二个交互式行业看板，展示 IoT DC3 如何在真实业务语境中连接信号、上下文与行动。',
  note: '实时模拟数据 · 响应式可视化 · 指标全程可查',
  stats: [
    {value: '12', label: '行业场景'},
    {value: '36', label: '协议驱动'},
    {value: '24 / 7', label: '持续感知'},
  ],
  sectionIndex: '01 / 行业场景',
  sectionTitle: '选择一个现场，进入它的运行视图',
  sectionLead: '每个场景都有自己的业务语言、运行节拍与核心指标，但共享同一套 IoT DC3 数据底座。',
  cardAction: '进入看板',
  sceneLabel: 'SCENE',
  footerIndex: '02 / 从信号到行动',
  footerTitle: '看板只是入口，真正的价值从连接现场开始',
  footerLead: '将模拟信号替换为设备与业务系统，再沿同一条可观测链路延伸到告警、智能体工具与受控执行。',
  primary: '阅读技术文档',
  secondary: '查看源代码',
})

const vizLabel = (kind: string) => ({
  matrix: t('矩阵', 'Matrix'),
  map: t('地图', 'Map'),
  topology: t('拓扑', 'Topology'),
  profile: t('剖面', 'Profile'),
  gauge: t('仪表', 'Gauge'),
  '3d': '3D',
}[kind] ?? kind)

const demoUrl = (id: string) => `${en.value ? '/en/demo/' : '/zh/demo/'}${id}`

function trackPointer(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  const card = event.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--demo-card-x', `${event.clientX - rect.left}px`)
  card.style.setProperty('--demo-card-y', `${event.clientY - rect.top}px`)
}

function clearPointer(event: PointerEvent) {
  const card = event.currentTarget as HTMLElement
  card.style.removeProperty('--demo-card-x')
  card.style.removeProperty('--demo-card-y')
}
</script>

<template>
  <main class="demo-gallery-page">
    <div class="demo-atmosphere" aria-hidden="true">
      <span class="demo-orb demo-orb-a" />
      <span class="demo-orb demo-orb-b" />
      <span class="demo-beam" />
    </div>

    <section class="demo-gallery-shell demo-hero">
      <div class="demo-hero-copy">
        <p class="demo-eyebrow"><span />{{ copy.eyebrow }}</p>
        <h1>{{ copy.title }}</h1>
        <p class="demo-lead">{{ copy.lead }}</p>
        <p class="demo-note"><i />{{ copy.note }}</p>
        <dl class="demo-stats">
          <div v-for="stat in copy.stats" :key="stat.label">
            <dt>{{ stat.value }}</dt>
            <dd>{{ stat.label }}</dd>
          </div>
        </dl>
      </div>

      <div class="demo-system-map" aria-hidden="true">
        <div class="demo-system-ring ring-outer" />
        <div class="demo-system-ring ring-inner" />
        <div class="demo-system-axis axis-x" />
        <div class="demo-system-axis axis-y" />
        <div class="demo-system-core">
          <span>IoT DC3</span>
          <strong>PHYSICAL<br>AI</strong>
        </div>
        <span v-for="node in 8" :key="node" class="demo-system-node" :style="{'--node-index': node - 1}" />
        <span class="demo-system-signal" />
      </div>
    </section>

    <section class="demo-catalog">
      <div class="demo-gallery-shell">
        <header class="demo-section-head">
          <div>
            <p>{{ copy.sectionIndex }}</p>
            <h2>{{ copy.sectionTitle }}</h2>
          </div>
          <p>{{ copy.sectionLead }}</p>
        </header>

        <div class="demo-grid">
          <a
            v-for="(domain, index) in DOMAINS"
            :key="domain.id"
            class="demo-card"
            :style="{'--accent': domain.accent}"
            :href="demoUrl(domain.id)"
            :aria-label="en ? domain.name_en : domain.name_zh"
            @pointermove="trackPointer"
            @pointerleave="clearPointer"
          >
            <div class="demo-card-glow" aria-hidden="true" />
            <div class="demo-card-visual" aria-hidden="true">
              <span class="demo-card-code">{{ copy.sceneLabel }} / {{ String(index + 1).padStart(2, '0') }}</span>
              <div class="demo-card-orbit"><span>{{ String(index + 1).padStart(2, '0') }}</span></div>
              <span class="demo-card-pulse" />
            </div>
            <div class="demo-card-body">
              <div class="demo-card-title">
                <h3>{{ en ? domain.name_en : domain.name_zh }}</h3>
                <span>{{ vizLabel(domain.vizType) }}</span>
              </div>
              <p class="demo-card-tagline">{{ en ? domain.tagline_en : domain.tagline_zh }}</p>
              <p class="demo-card-signature">{{ domain.signature }}</p>
              <div class="demo-card-foot">
                <span>{{ copy.cardAction }}</span>
                <i>↗</i>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="demo-gallery-shell demo-closing">
      <p>{{ copy.footerIndex }}</p>
      <div>
        <h2>{{ copy.footerTitle }}</h2>
        <p>{{ copy.footerLead }}</p>
      </div>
      <nav aria-label="Demo resources">
        <a :href="en ? 'https://docs.dc3.site/en/' : 'https://docs.dc3.site/zh/'">{{ copy.primary }} <span>→</span></a>
        <a href="https://github.com/pnoker/iot-dc3">{{ copy.secondary }} <span>↗</span></a>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.demo-gallery-page {
  --demo-line: rgba(74, 162, 206, 0.2);
  --demo-soft-line: rgba(74, 162, 206, 0.1);
  --demo-panel: rgba(255, 255, 255, 0.58);
  --demo-panel-strong: rgba(255, 255, 255, 0.78);
  --demo-muted: rgba(37, 66, 91, 0.7);
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  overflow: hidden;
  padding-top: 64px;
  color: var(--vp-c-text-1);
  background:
    radial-gradient(circle at 74% 8%, rgba(58, 192, 226, 0.12), transparent 26%),
    radial-gradient(circle at 12% 36%, rgba(91, 116, 235, 0.09), transparent 28%),
    linear-gradient(180deg, #f6fbfe 0%, var(--vp-c-bg) 42%, #f7fbfd 100%);
}

:global(.dark) .demo-gallery-page {
  --demo-line: rgba(104, 204, 237, 0.18);
  --demo-soft-line: rgba(104, 204, 237, 0.08);
  --demo-panel: rgba(15, 35, 52, 0.56);
  --demo-panel-strong: rgba(16, 39, 58, 0.78);
  --demo-muted: rgba(190, 220, 236, 0.66);
  background:
    radial-gradient(circle at 74% 8%, rgba(40, 178, 216, 0.14), transparent 28%),
    radial-gradient(circle at 12% 36%, rgba(91, 116, 235, 0.13), transparent 28%),
    linear-gradient(180deg, #08131e 0%, var(--vp-c-bg) 44%, #08141f 100%);
}

.demo-atmosphere {
  position: absolute;
  z-index: -1;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.demo-atmosphere::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--demo-soft-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--demo-soft-line) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, #000 0%, rgba(0, 0, 0, 0.82) 56%, transparent 94%);
}

.demo-orb {
  position: absolute;
  border: 1px solid var(--demo-line);
  border-radius: 50%;
  opacity: 0.7;
}

.demo-orb::before,
.demo-orb::after {
  content: '';
  position: absolute;
  border: 1px solid var(--demo-soft-line);
  border-radius: inherit;
}

.demo-orb::before { inset: 12%; }
.demo-orb::after { inset: 28%; }
.demo-orb-a { top: 4%; right: -13%; width: 46vw; aspect-ratio: 1; }
.demo-orb-b { top: 30%; left: -18%; width: 38vw; aspect-ratio: 1; }

.demo-beam {
  position: absolute;
  top: 64px;
  left: 14%;
  width: 72%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(32, 180, 217, 0.58), transparent);
  box-shadow: 0 0 16px rgba(32, 180, 217, 0.32);
}

.demo-gallery-shell {
  width: calc(100% - 64px);
  max-width: 1280px;
  margin-inline: auto;
}

.demo-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.72fr);
  align-items: center;
  gap: clamp(36px, 6vw, 96px);
  min-height: clamp(560px, 74vh, 720px);
  padding-block: clamp(72px, 10vh, 118px);
}

.demo-eyebrow,
.demo-section-head > div > p,
.demo-closing > p {
  margin: 0;
  color: var(--vp-c-brand-1);
  font: 600 11px/1.2 var(--dc3d-mono, monospace);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.demo-eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.demo-eyebrow span {
  width: 34px;
  height: 1px;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.demo-hero h1 {
  max-width: 780px;
  margin: 0;
  font-size: clamp(42px, 5.4vw, 76px);
  line-height: 1.05;
  letter-spacing: -0.055em;
  text-wrap: balance;
  background: linear-gradient(118deg, var(--vp-c-text-1) 10%, #168fbc 54%, #575fc5 92%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

:global(.dark) .demo-hero h1 {
  background-image: linear-gradient(118deg, #f0fbff 10%, #70d8f5 56%, #a7aaff 94%);
}

.demo-lead {
  max-width: 680px;
  margin: 28px 0 0;
  color: var(--demo-muted);
  font-size: clamp(16px, 1.45vw, 20px);
  line-height: 1.8;
}

.demo-note {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 22px 0 0;
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.demo-note i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1bb9c9;
  box-shadow: 0 0 0 5px rgba(27, 185, 201, 0.1), 0 0 14px rgba(27, 185, 201, 0.7);
}

.demo-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 620px;
  margin: 40px 0 0;
  border-top: 1px solid var(--demo-line);
  border-bottom: 1px solid var(--demo-line);
}

.demo-stats > div {
  position: relative;
  padding: 20px 20px 18px 0;
}

.demo-stats > div + div {
  padding-left: 24px;
  border-left: 1px solid var(--demo-line);
}

.demo-stats dt {
  color: var(--vp-c-text-1);
  font: 680 clamp(22px, 2.2vw, 32px)/1 var(--dc3d-mono, monospace);
  letter-spacing: -0.04em;
}

.demo-stats dd {
  margin: 8px 0 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.demo-system-map {
  position: relative;
  width: min(100%, 440px);
  aspect-ratio: 1;
  margin-inline: auto;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(41, 197, 223, 0.1), transparent 64%);
}

.demo-system-ring,
.demo-system-axis {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
}

.demo-system-ring {
  border: 1px solid var(--demo-line);
  border-radius: 50%;
}

.ring-outer { width: 94%; height: 94%; }
.ring-inner { width: 62%; height: 62%; border-style: dashed; }

.demo-system-axis {
  background: linear-gradient(90deg, transparent, var(--demo-line), transparent);
}

.axis-x { width: 100%; height: 1px; }
.axis-y { width: 1px; height: 100%; background: linear-gradient(transparent, var(--demo-line), transparent); }

.demo-system-core {
  position: absolute;
  inset: 50% auto auto 50%;
  display: grid;
  place-content: center;
  width: 39%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(41, 197, 223, 0.46);
  border-radius: 50%;
  background: color-mix(in srgb, var(--demo-panel-strong) 84%, transparent);
  box-shadow: 0 0 54px rgba(41, 197, 223, 0.16), inset 0 0 34px rgba(41, 197, 223, 0.1);
  text-align: center;
  backdrop-filter: blur(16px);
}

.demo-system-core span {
  color: var(--vp-c-brand-1);
  font: 600 10px/1.2 var(--dc3d-mono, monospace);
  letter-spacing: 0.15em;
}

.demo-system-core strong {
  margin-top: 8px;
  color: var(--vp-c-text-1);
  font-size: clamp(18px, 2vw, 27px);
  line-height: 1.04;
  letter-spacing: -0.03em;
}

.demo-system-node {
  --node-angle: calc(var(--node-index) * 45deg);
  position: absolute;
  top: 50%;
  left: 50%;
  width: 9px;
  height: 9px;
  transform: translate(-50%, -50%) rotate(var(--node-angle)) translateX(202px);
  border: 1px solid rgba(41, 197, 223, 0.72);
  border-radius: 50%;
  background: var(--vp-c-bg);
  box-shadow: 0 0 0 5px rgba(41, 197, 223, 0.08), 0 0 14px rgba(41, 197, 223, 0.5);
}

.demo-system-signal {
  position: absolute;
  inset: 3%;
  border-radius: 50%;
  animation: demo-signal-orbit 9s linear infinite;
}

.demo-system-signal::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  width: 9px;
  height: 9px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: #5b74eb;
  box-shadow: 0 0 16px rgba(91, 116, 235, 0.9);
}

@keyframes demo-signal-orbit {
  to { transform: rotate(360deg); }
}

.demo-catalog {
  position: relative;
  padding-block: clamp(72px, 9vw, 124px);
  border-top: 1px solid var(--demo-line);
  border-bottom: 1px solid var(--demo-line);
  background: color-mix(in srgb, var(--vp-c-bg) 68%, transparent);
}

.demo-section-head {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(280px, 0.62fr);
  align-items: end;
  gap: 48px;
  margin-bottom: 42px;
}

.demo-section-head h2,
.demo-closing h2 {
  margin: 14px 0 0;
  color: var(--vp-c-text-1);
  font-size: clamp(28px, 3.4vw, 48px);
  line-height: 1.16;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.demo-section-head > p,
.demo-closing > div > p {
  margin: 0;
  color: var(--demo-muted);
  font-size: 15px;
  line-height: 1.8;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.demo-card {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 366px;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--demo-line);
  border-radius: 22px;
  background: var(--demo-panel);
  box-shadow: 0 18px 48px rgba(11, 77, 119, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  color: var(--vp-c-text-1);
  text-decoration: none;
  backdrop-filter: blur(18px) saturate(1.2);
  transition: transform 280ms ease, border-color 280ms ease, box-shadow 280ms ease;
}

:global(.dark) .demo-card {
  box-shadow: 0 20px 54px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(220, 248, 255, 0.08);
}

.demo-card-glow {
  position: absolute;
  z-index: 0;
  inset: 0;
  background: radial-gradient(240px circle at var(--demo-card-x, 50%) var(--demo-card-y, 20%), color-mix(in srgb, var(--accent) 18%, transparent), transparent 72%);
  opacity: 0;
  transition: opacity 240ms ease;
  pointer-events: none;
}

.demo-card:hover {
  transform: translateY(-6px);
  border-color: color-mix(in srgb, var(--accent) 55%, var(--demo-line));
  box-shadow: 0 24px 58px color-mix(in srgb, var(--accent) 15%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.demo-card:hover .demo-card-glow { opacity: 1; }

.demo-card-visual {
  position: relative;
  z-index: 1;
  height: 128px;
  overflow: hidden;
  border-bottom: 1px solid var(--demo-soft-line);
  background:
    linear-gradient(var(--demo-soft-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--demo-soft-line) 1px, transparent 1px),
    radial-gradient(circle at 50% 56%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 48%);
  background-size: 24px 24px, 24px 24px, auto;
}

.demo-card-code {
  position: absolute;
  top: 15px;
  left: 16px;
  color: var(--vp-c-text-3);
  font: 600 9px/1 var(--dc3d-mono, monospace);
  letter-spacing: 0.15em;
}

.demo-card-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 82px;
  height: 82px;
  transform: translate(-50%, -44%);
  border: 1px solid color-mix(in srgb, var(--accent) 54%, transparent);
  border-radius: 50%;
  box-shadow: 0 0 30px color-mix(in srgb, var(--accent) 15%, transparent);
}

.demo-card-orbit::before,
.demo-card-orbit::after {
  content: '';
  position: absolute;
  border-radius: inherit;
}

.demo-card-orbit::before {
  inset: 12px;
  border: 1px dashed color-mix(in srgb, var(--accent) 42%, transparent);
  transition: transform 600ms ease;
}

.demo-card-orbit::after {
  inset: 28px;
  background: var(--accent);
  box-shadow: 0 0 20px var(--accent);
  opacity: 0.8;
}

.demo-card-orbit span {
  position: absolute;
  z-index: 2;
  right: -34px;
  bottom: 4px;
  color: color-mix(in srgb, var(--accent) 76%, var(--vp-c-text-1));
  font: 700 11px/1 var(--dc3d-mono, monospace);
}

.demo-card:hover .demo-card-orbit::before { transform: rotate(90deg); }

.demo-card-pulse {
  position: absolute;
  right: 16px;
  bottom: 14px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
  animation: demo-pulse 2.2s ease-in-out infinite;
}

@keyframes demo-pulse {
  50% { opacity: 0.35; transform: scale(0.7); }
}

.demo-card-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 22px;
}

.demo-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.demo-card-title h3 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 19px;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.demo-card-title > span {
  flex: none;
  padding: 4px 8px;
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  border-radius: 999px;
  color: color-mix(in srgb, var(--accent) 78%, var(--vp-c-text-1));
  font: 600 10px/1 var(--dc3d-mono, monospace);
}

.demo-card-tagline {
  display: -webkit-box;
  overflow: hidden;
  margin: 14px 0 0;
  color: var(--demo-muted);
  font-size: 13px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.demo-card-signature {
  overflow: hidden;
  margin: 10px 0 0;
  color: var(--vp-c-text-3);
  font: 500 11px/1.5 var(--dc3d-mono, monospace);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demo-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 20px;
  color: color-mix(in srgb, var(--accent) 75%, var(--vp-c-text-1));
  font-size: 13px;
  font-weight: 650;
}

.demo-card-foot i {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  border: 1px solid color-mix(in srgb, var(--accent) 34%, transparent);
  border-radius: 50%;
  font-style: normal;
  transition: transform 240ms ease, background 240ms ease;
}

.demo-card:hover .demo-card-foot i {
  transform: translate(2px, -2px);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.demo-closing {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr) auto;
  align-items: start;
  gap: clamp(28px, 5vw, 72px);
  padding-block: clamp(84px, 10vw, 144px);
}

.demo-closing h2 { margin-top: 0; }
.demo-closing > div > p { max-width: 680px; margin-top: 20px; }

.demo-closing nav {
  display: grid;
  gap: 10px;
  min-width: 206px;
}

.demo-closing nav a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 13px 16px;
  border: 1px solid var(--demo-line);
  border-radius: 999px;
  background: var(--demo-panel);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 620;
  text-decoration: none;
  transition: border-color 220ms ease, transform 220ms ease;
}

.demo-closing nav a:hover {
  transform: translateX(3px);
  border-color: rgba(41, 197, 223, 0.55);
}

@media (min-width: 1380px) {
  .demo-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (min-width: 768px) and (max-width: 1279.98px) {
  .demo-gallery-shell { width: calc(100% - 48px); }
  .demo-hero { grid-template-columns: minmax(0, 1fr) minmax(280px, 0.62fr); gap: 36px; }
  .demo-system-map { max-width: 340px; }
  .demo-system-node { transform: translate(-50%, -50%) rotate(var(--node-angle)) translateX(156px); }
  .demo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .demo-closing { grid-template-columns: 120px minmax(0, 1fr); }
  .demo-closing nav { grid-column: 2; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 767.98px) {
  .demo-gallery-shell { width: calc(100% - 24px); }
  .demo-hero {
    grid-template-columns: 1fr;
    gap: 34px;
    min-height: auto;
    padding-block: 74px 64px;
  }
  .demo-hero h1 { font-size: clamp(38px, 12vw, 54px); }
  .demo-lead { margin-top: 22px; font-size: 16px; }
  .demo-note { align-items: flex-start; line-height: 1.5; }
  .demo-stats { margin-top: 32px; }
  .demo-stats > div { padding: 17px 8px 16px 0; }
  .demo-stats > div + div { padding-left: 12px; }
  .demo-stats dt { font-size: 21px; }
  .demo-stats dd { font-size: 10px; line-height: 1.35; }
  .demo-system-map { width: min(82vw, 310px); }
  .demo-system-node { transform: translate(-50%, -50%) rotate(var(--node-angle)) translateX(142px); }
  .demo-catalog { padding-block: 66px; }
  .demo-section-head { grid-template-columns: 1fr; gap: 20px; margin-bottom: 30px; }
  .demo-section-head h2, .demo-closing h2 { font-size: 31px; }
  .demo-grid { grid-template-columns: 1fr; gap: 14px; }
  .demo-card { min-height: 344px; border-radius: 18px; }
  .demo-card-visual { height: 118px; }
  .demo-card-body { padding: 20px; }
  .demo-closing { grid-template-columns: 1fr; gap: 24px; padding-block: 76px; }
  .demo-closing nav { grid-template-columns: 1fr; min-width: 0; }
  .demo-orb-a { right: -48%; width: 100vw; }
  .demo-orb-b { left: -70%; width: 120vw; }
}

@media (hover: none) {
  .demo-card-glow { display: none; }
  .demo-card:hover { transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .demo-system-signal,
  .demo-card-pulse { animation: none; }
  .demo-card,
  .demo-card-orbit::before { transition: none; }
}
</style>
