<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted} from 'vue'
import {useData} from 'vitepress'
import HeroActionCards from '../../HeroActionCards.vue'
import CardNav from '../../CardNav.vue'
import PhysicalLoop from '../home/PhysicalLoop.vue'
import VisionAtmosphere from './VisionAtmosphere.vue'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))
const isHome = computed(() => ['zh/index.md', 'en/index.md'].includes(page.value.relativePath))

let headerFrame = 0
let headerProgress = 0
let headerTargetProgress = 0
let headerExpandedWidth = 0
let interactiveCards: HTMLElement[] = []

const interactiveCardSelector = [
  '.vision-formula-card',
  '.vision-gap-card',
  '.vision-layer',
  '.vision-loop li',
  '.vision-principles article',
  '.vision-boundary article',
  '.vision-journey li'
].join(', ')

function handleCardPointerMove(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  const card = event.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--vision-card-x', `${event.clientX - rect.left}px`)
  card.style.setProperty('--vision-card-y', `${event.clientY - rect.top}px`)
}

function handleCardPointerLeave(event: PointerEvent) {
  const card = event.currentTarget as HTMLElement
  card.style.removeProperty('--vision-card-x')
  card.style.removeProperty('--vision-card-y')
}

function bindInteractiveCards() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  interactiveCards = Array.from(document.querySelectorAll<HTMLElement>(interactiveCardSelector))
  interactiveCards.forEach((card) => {
    card.addEventListener('pointermove', handleCardPointerMove, {passive: true})
    card.addEventListener('pointerleave', handleCardPointerLeave)
  })
}

function unbindInteractiveCards() {
  interactiveCards.forEach((card) => {
    card.removeEventListener('pointermove', handleCardPointerMove)
    card.removeEventListener('pointerleave', handleCardPointerLeave)
  })
  interactiveCards = []
}

function easedHeaderProgress(scrollY: number) {
  const progress = Math.min(1, Math.max(0, (scrollY - 4) / 96))
  return progress * progress * (3 - 2 * progress)
}

function applyHeaderProgress(progress: number) {
  const root = document.documentElement
  root.style.setProperty('--dc3-nav-progress', progress.toFixed(4))

  // 顶部状态使用 CSS 自适应宽度，避免异步内容引发滚动条时机变化后把首帧宽度写死。
  if (progress < 0.0001) {
    ;['--dc3-nav-width', '--dc3-nav-height', '--dc3-nav-offset', '--dc3-nav-padding']
      .forEach((property) => root.style.removeProperty(property))
    return
  }

  const viewportWidth = document.querySelector<HTMLElement>('.dc3-vision-layout')?.getBoundingClientRect().width
    || document.documentElement.clientWidth
  const compact = viewportWidth < 768
  const medium = viewportWidth >= 768 && viewportWidth < 1280
  const startGutter = compact ? 24 : medium ? 48 : 64
  const endGutter = compact ? 40 : 64
  const responsiveStartWidth = compact || medium
    ? viewportWidth - startGutter
    : Math.min(1360, viewportWidth - startGutter)
  const startWidth = headerExpandedWidth || responsiveStartWidth
  const contentWidth = document.querySelector<HTMLElement>('.vision-container')?.getBoundingClientRect().width
  const endWidth = contentWidth || Math.min(1152, viewportWidth - endGutter)
  const endPadding = compact ? 8 : medium ? 10 : 12

  root.style.setProperty('--dc3-nav-width', `${startWidth + (endWidth - startWidth) * progress}px`)
  root.style.setProperty('--dc3-nav-height', `${64 - 12 * progress}px`)
  root.style.setProperty('--dc3-nav-offset', `${6 * progress}px`)
  root.style.setProperty('--dc3-nav-padding', `${endPadding * progress}px`)
}

function animateHeader() {
  const delta = headerTargetProgress - headerProgress
  headerProgress += delta * 0.18

  if (Math.abs(delta) < 0.001) headerProgress = headerTargetProgress
  applyHeaderProgress(headerProgress)

  if (headerProgress !== headerTargetProgress) {
    headerFrame = requestAnimationFrame(animateHeader)
  } else {
    headerFrame = 0
    document.documentElement.classList.remove('dc3-nav-animating')
  }
}

function syncHeaderState() {
  const nextProgress = easedHeaderProgress(window.scrollY)
  if (!headerExpandedWidth && headerProgress < 0.0001 && nextProgress > 0) {
    headerExpandedWidth = document.querySelector<HTMLElement>('.VPNavBar > .wrapper > .container')
      ?.getBoundingClientRect().width || 0
  }
  headerTargetProgress = nextProgress
  if (!headerFrame) {
    document.documentElement.classList.add('dc3-nav-animating')
    headerFrame = requestAnimationFrame(animateHeader)
  }
}

function syncHeaderViewport() {
  headerExpandedWidth = 0
  applyHeaderProgress(headerProgress)
  if (headerProgress < 0.0001) {
    headerExpandedWidth = document.querySelector<HTMLElement>('.VPNavBar > .wrapper > .container')
      ?.getBoundingClientRect().width || 0
  }
}

onMounted(() => {
  headerProgress = easedHeaderProgress(window.scrollY)
  headerTargetProgress = headerProgress
  applyHeaderProgress(headerProgress)
  if (headerProgress < 0.0001) {
    headerExpandedWidth = document.querySelector<HTMLElement>('.VPNavBar > .wrapper > .container')
      ?.getBoundingClientRect().width || 0
  }
  bindInteractiveCards()
  window.addEventListener('scroll', syncHeaderState, {passive: true})
  window.addEventListener('resize', syncHeaderViewport, {passive: true})
})

onBeforeUnmount(() => {
  cancelAnimationFrame(headerFrame)
  unbindInteractiveCards()
  window.removeEventListener('scroll', syncHeaderState)
  window.removeEventListener('resize', syncHeaderViewport)
  document.documentElement.classList.remove('dc3-nav-animating')
  headerExpandedWidth = 0
  ;['--dc3-nav-progress', '--dc3-nav-width', '--dc3-nav-height', '--dc3-nav-offset', '--dc3-nav-padding']
    .forEach((property) => document.documentElement.style.removeProperty(property))
})

const copy = computed(() => isEnglish.value ? {
  title: 'AI should not only understand the world. It should act in it — safely.',
  lead: 'IoT DC3 is an open-source Physical AI Runtime: the execution layer between an agent’s intent and the physical world.',
  note: 'Models reason. IoT DC3 senses, connects, governs and executes.',
  formula: [
    {label: 'AI Agent', title: 'Intent & decision', sub: 'Reason · Plan · Decide'},
    {label: 'IoT DC3', title: 'Physical AI Runtime', sub: 'Context · Policy · Execution'},
    {label: 'Physical World', title: 'State & action', sub: 'Device · Point · Command'}
  ],
  stats: [
    {value: '28', label: 'Protocol drivers'},
    {value: '330+', label: 'Agent tools'},
    {value: 'OAuth 2.1', label: 'Secure MCP'},
    {value: '10 years', label: 'Industrial IoT engineering'}
  ],
  gap: {
    kicker: 'The Missing Layer',
    title: 'Intelligence is leaving the screen. Infrastructure has to catch up.',
    description: 'In software, a wrong action can often be retried. In the physical world, every action changes state, carries risk and needs accountability.',
    cards: [
      {index: '01', title: 'The world must be observable', description: 'Devices, telemetry, alarms and operating context need a stable semantic surface.'},
      {index: '02', title: 'Execution must be governed', description: 'Identity, permissions, whitelists and risk tiers must sit between intent and action.'},
      {index: '03', title: 'Effects must be traceable', description: 'Every command needs an auditable path from intent to execution and feedback.'}
    ],
    callout: 'A model output is not yet an industrial action.'
  },
  role: {
    kicker: 'The Runtime Layer',
    title: 'IoT DC3 sits between agent intelligence and physical execution',
    description: 'It does not replace the model or business policy. It provides the context, tools and safety boundary they need to reach the field.',
    layers: [
      {tag: 'Intelligence', title: 'AI Agent', description: 'Understands goals, reasons with knowledge and decides what should happen.', chips: ['Reason', 'Plan', 'Decide']},
      {tag: 'Runtime', title: 'IoT DC3', description: 'Structures context, exposes tools, authorizes calls, executes commands and returns feedback.', chips: ['Context', 'Tool Gateway', 'Policy', 'Audit'], active: true},
      {tag: 'Reality', title: 'Physical World', description: 'Devices produce state. Commands create effects. The environment closes the loop.', chips: ['Device', 'Point', 'Command']}
    ]
  },
  loop: {
    kicker: 'The Agent Loop',
    title: 'Five capabilities turn reasoning into physical action',
    description: 'The loop is complete only when an agent can see, understand, decide, act and verify the effect.',
    steps: [
      {keyword: 'See', title: 'Sense the field', description: 'Read devices, telemetry and alarms.'},
      {keyword: 'Understand', title: 'Structure context', description: 'Turn physical signals into model-ready context.'},
      {keyword: 'Decide', title: 'Reason with knowledge', description: 'Combine models with industrial rules and history.'},
      {keyword: 'Act', title: 'Execute safely', description: 'Call tools and issue commands through policy gates.'},
      {keyword: 'Trace', title: 'Verify every effect', description: 'Observe outcomes and preserve a full audit trail.'}
    ]
  },
  principles: {
    kicker: 'Architecture Principles',
    title: 'Two principles keep the surface simple and the execution trustworthy',
    description: 'One principle defines how capabilities are exposed. The other defines how actions are governed.',
    items: [
      {number: '01', label: 'Everything is a Tool.', local: 'A unified surface', description: 'Devices, points, commands and APIs become tools with explicit schemas. Agents use one consistent contract instead of learning every protocol.', chips: ['Device', 'Point', 'Command', 'API']},
      {number: '02', label: 'Every Action is Traceable.', local: 'A governed execution path', description: 'Identity, authorization, risk, execution, feedback and audit form one chain. Safety is part of the runtime, not an afterthought.', chips: ['Auth', 'Risk', 'Execute', 'Feedback', 'Audit']}
    ]
  },
  boundary: {
    kicker: 'Clear Boundaries',
    title: 'Responsibility is separated so the system stays controllable',
    description: 'A reliable Physical AI system is not one all-powerful agent. It is a collaboration with explicit ownership.',
    items: [
      {owner: 'Agent', title: 'Decides what should happen', description: 'Goal understanding, reasoning, planning and business judgment.'},
      {owner: 'IoT DC3', title: 'Governs how it may happen', description: 'Context, tool contracts, authorization, execution, feedback and audit.'},
      {owner: 'Device', title: 'Produces the physical effect', description: 'Real state changes under field constraints and safety mechanisms.'}
    ],
    closing: 'Intelligence can evolve quickly because the execution boundary remains stable.'
  },
  journey: {
    kicker: 'A Decade of Compounding',
    title: 'The foundation remains. The role moves forward.',
    description: 'Ten years of industrial IoT engineering is not the old story we leave behind. It is the prerequisite for the new one.',
    stages: [
      {era: 'Foundation', title: 'Open-source IoT platform', description: 'Protocol access, device models, cloud-native architecture and industrial reliability.'},
      {era: 'Expansion', title: 'AI-powered industrial IoT', description: 'Spring AI, MCP and agent capabilities become native platform building blocks.'},
      {era: 'Direction', title: 'Open-source Physical AI Runtime', description: 'A safe and observable execution layer connecting agents to the physical world.', active: true}
    ]
  },
  resources: {
    kicker: 'From Vision to Practice',
    title: 'Explore the project from the path that fits you',
    description: 'Read the technical documentation, follow the complete engineering story, or experience an industrial dashboard directly.'
  },
  cta: {
    kicker: 'Build the Loop',
    title: 'Bring your agents into the physical world — without losing control.',
    description: 'Start with open-source code, connect a device and turn one intent into one traceable physical action.',
    primary: 'Quick Start',
    primaryHref: 'https://docs.dc3.site/en/',
    secondary: 'View on GitHub'
  }
} : {
  title: '让 AI 不只理解世界，还能安全地作用于世界',
  lead: 'IoT DC3 是开源的 Physical AI Runtime：位于智能体意图与物理世界之间的执行层。',
  note: '模型负责推理，IoT DC3 负责感知、连接、治理与执行。',
  formula: [
    {label: 'AI Agent', title: '意图与决策', sub: '理解 · 规划 · 决策'},
    {label: 'IoT DC3', title: 'Physical AI Runtime', sub: '上下文 · 策略 · 执行'},
    {label: '物理世界', title: '状态与行动', sub: '设备 · 点位 · 指令'}
  ],
  stats: [
    {value: '28', label: '协议驱动'},
    {value: '330+', label: '智能体工具'},
    {value: 'OAuth 2.1', label: '安全 MCP'},
    {value: '10 年', label: '工业物联网工程积累'}
  ],
  gap: {
    kicker: '缺失的基础设施',
    title: '智能正在走出屏幕，基础设施必须跟上',
    description: '在软件世界里，错误操作往往可以重试；在物理世界里，每次行动都会改变真实状态，伴随风险，也必须能够追责。',
    cards: [
      {index: '01', title: '物理世界必须可感知', description: '设备、遥测、告警和运行环境，需要形成稳定、结构化的语义表面。'},
      {index: '02', title: '每次执行必须受治理', description: '身份、权限、白名单与风险分级，必须位于智能体意图和真实行动之间。'},
      {index: '03', title: '行动结果必须可追溯', description: '每条指令都需要保留从意图、授权、执行到反馈的完整审计链路。'}
    ],
    callout: '模型给出的答案，还不是工业现场可以直接执行的行动。'
  },
  role: {
    kicker: 'Runtime 所在的位置',
    title: 'IoT DC3 位于智能体推理与物理执行之间',
    description: '它不替代模型，也不替代业务决策；它提供进入工业现场所需的上下文、工具契约与安全边界。',
    layers: [
      {tag: '智能层', title: 'AI Agent', description: '理解目标，结合知识推理，并决定应该发生什么。', chips: ['理解', '规划', '决策']},
      {tag: '运行层', title: 'IoT DC3', description: '组织上下文、暴露工具、校验权限、执行指令并返回结果。', chips: ['上下文', '工具网关', '策略', '审计'], active: true},
      {tag: '现实层', title: '物理世界', description: '设备产生状态，指令形成效果，环境反馈闭合整个循环。', chips: ['设备', '点位', '指令']}
    ]
  },
  loop: {
    kicker: '智能体闭环',
    title: '五种能力，把推理变成物理行动',
    description: '只有当智能体能够看见、理解、决策、行动并验证结果，智能闭环才真正完整。',
    steps: [
      {keyword: 'See', title: '感知现场', description: '读取设备、遥测数据与实时告警。'},
      {keyword: 'Understand', title: '理解上下文', description: '把物理信号组织成模型能够理解的语义。'},
      {keyword: 'Decide', title: '结合知识决策', description: '融合模型推理、工业规则与历史经验。'},
      {keyword: 'Act', title: '安全执行', description: '经过策略门禁调用工具并下发指令。'},
      {keyword: 'Trace', title: '验证行动结果', description: '观察实际效果并保留完整审计链路。'}
    ]
  },
  principles: {
    kicker: '架构原则',
    title: '两条原则，让接口保持简单，让执行始终可信',
    description: '一条原则定义能力如何暴露，另一条原则定义行动如何受到治理。',
    items: [
      {number: '01', label: 'Everything is a Tool.', local: '一切皆工具', description: '设备、点位、指令和 API 被统一为拥有明确 Schema 的工具。智能体面对一致的契约，而不是学习每一种工业协议。', chips: ['设备', '点位', '指令', 'API']},
      {number: '02', label: 'Every Action is Traceable.', local: '每次执行皆可追溯', description: '身份、授权、风险、执行、反馈与审计组成完整链路。安全是 Runtime 的内建能力，而不是事后补丁。', chips: ['身份', '风险', '执行', '反馈', '审计']}
    ]
  },
  boundary: {
    kicker: '清晰的责任边界',
    title: '职责分开，系统才真正可控',
    description: '可靠的 Physical AI 不是一个无所不能的智能体，而是多个角色在明确边界内协作。',
    items: [
      {owner: '智能体', title: '决定应该发生什么', description: '负责理解目标、推理规划和业务判断。'},
      {owner: 'IoT DC3', title: '治理行动如何发生', description: '负责上下文、工具契约、授权、执行、反馈与审计。'},
      {owner: '设备', title: '产生真实物理效果', description: '在现场约束和安全机制下改变真实状态。'}
    ],
    closing: '执行边界保持稳定，智能能力才能快速演进。'
  },
  journey: {
    kicker: '十年积累',
    title: '基本盘没有改变，承担的角色正在向前',
    description: '十年工业物联网工程不是要抛弃的旧故事，而是进入 Physical AI 的必要前提。',
    stages: [
      {era: '基本盘', title: '开源物联网平台', description: '协议接入、设备模型、云原生架构与工业级可靠性。'},
      {era: '能力扩展', title: 'AI 赋能的工业物联网', description: 'Spring AI、MCP 与智能体能力成为平台内建模块。'},
      {era: '面向未来', title: '开源 Physical AI Runtime', description: '连接智能体与物理世界的安全、可观测执行层。', active: true}
    ]
  },
  resources: {
    kicker: '从愿景到实践',
    title: '选择适合你的方式，继续了解 IoT DC3',
    description: '阅读技术文档、了解完整工程脉络，或者直接体验工业场景看板。'
  },
  cta: {
    kicker: '构建闭环',
    title: '让智能体进入物理世界，同时不让风险失控',
    description: '从开源代码开始，接入一台设备，把一个意图转化为一次可追溯的物理行动。',
    primary: '快速开始',
    primaryHref: 'https://docs.dc3.site/zh/',
    secondary: '查看 GitHub'
  }
})
</script>

<template>
  <main class="vision-page">
    <section class="vision-hero">
      <VisionAtmosphere v-if="isHome" />
      <div class="vision-container vision-hero-inner">
        <h1>{{ copy.title }}</h1>
        <p class="vision-hero-lead">{{ copy.lead }}</p>
        <p class="vision-hero-note">{{ copy.note }}</p>

        <div class="vision-formula" aria-label="AI Agent to Physical World">
          <template v-for="(item, index) in copy.formula" :key="item.label">
            <article class="vision-formula-card" :class="{active: index === 1}">
              <span>{{ item.label }}</span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.sub }}</small>
            </article>
            <span v-if="index < copy.formula.length - 1" class="vision-formula-arrow" aria-hidden="true">→</span>
          </template>
        </div>

        <dl class="vision-stats">
          <div v-for="stat in copy.stats" :key="stat.label">
            <dt>{{ stat.value }}</dt>
            <dd>{{ stat.label }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <PhysicalLoop v-if="isHome" />

    <section class="vision-section vision-section-soft">
      <div class="vision-container">
        <header class="vision-section-head">
          <span class="vision-kicker">{{ copy.gap.kicker }}</span>
          <h2>{{ copy.gap.title }}</h2>
          <p>{{ copy.gap.description }}</p>
        </header>
        <div class="vision-gap-grid">
          <article v-for="card in copy.gap.cards" :key="card.index" class="vision-gap-card">
            <span>{{ card.index }}</span>
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
          </article>
        </div>
        <p class="vision-callout">{{ copy.gap.callout }}</p>
      </div>
    </section>

    <section class="vision-section">
      <div class="vision-container">
        <header class="vision-section-head">
          <span class="vision-kicker">{{ copy.role.kicker }}</span>
          <h2>{{ copy.role.title }}</h2>
          <p>{{ copy.role.description }}</p>
        </header>
        <div class="vision-layers">
          <article v-for="layer in copy.role.layers" :key="layer.title" class="vision-layer" :class="{active: layer.active}">
            <span class="vision-layer-tag">{{ layer.tag }}</span>
            <div class="vision-layer-copy">
              <h3>{{ layer.title }}</h3>
              <p>{{ layer.description }}</p>
            </div>
            <div class="vision-chips">
              <span v-for="chip in layer.chips" :key="chip">{{ chip }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="vision-section vision-loop-section">
      <div class="vision-container">
        <header class="vision-section-head">
          <span class="vision-kicker">{{ copy.loop.kicker }}</span>
          <h2>{{ copy.loop.title }}</h2>
          <p>{{ copy.loop.description }}</p>
        </header>
        <ol class="vision-loop">
          <li v-for="(step, index) in copy.loop.steps" :key="step.keyword">
            <div class="vision-loop-meta">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <strong>{{ step.keyword }}</strong>
            </div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="vision-section vision-section-soft">
      <div class="vision-container">
        <header class="vision-section-head">
          <span class="vision-kicker">{{ copy.principles.kicker }}</span>
          <h2>{{ copy.principles.title }}</h2>
          <p>{{ copy.principles.description }}</p>
        </header>
        <div class="vision-principles">
          <article v-for="item in copy.principles.items" :key="item.number">
            <span class="vision-principle-number">{{ item.number }}</span>
            <h3>{{ item.label }}</h3>
            <strong>{{ item.local }}</strong>
            <p>{{ item.description }}</p>
            <div class="vision-chips">
              <span v-for="chip in item.chips" :key="chip">{{ chip }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="vision-section">
      <div class="vision-container">
        <header class="vision-section-head">
          <span class="vision-kicker">{{ copy.boundary.kicker }}</span>
          <h2>{{ copy.boundary.title }}</h2>
          <p>{{ copy.boundary.description }}</p>
        </header>
        <div class="vision-boundary">
          <template v-for="(item, index) in copy.boundary.items" :key="item.owner">
            <article>
              <span>{{ item.owner }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </article>
            <span v-if="index < copy.boundary.items.length - 1" class="vision-boundary-arrow" aria-hidden="true">→</span>
          </template>
        </div>
        <p class="vision-boundary-closing">{{ copy.boundary.closing }}</p>
      </div>
    </section>

    <section class="vision-section vision-journey-section">
      <div class="vision-container">
        <header class="vision-section-head">
          <span class="vision-kicker">{{ copy.journey.kicker }}</span>
          <h2>{{ copy.journey.title }}</h2>
          <p>{{ copy.journey.description }}</p>
        </header>
        <ol class="vision-journey">
          <li v-for="stage in copy.journey.stages" :key="stage.title" :class="{active: stage.active}">
            <span>{{ stage.era }}</span>
            <h3>{{ stage.title }}</h3>
            <p>{{ stage.description }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section v-if="isHome" class="vision-section vision-resources-section">
      <div class="vision-container">
        <header class="vision-section-head">
          <span class="vision-kicker">{{ copy.resources.kicker }}</span>
          <h2>{{ copy.resources.title }}</h2>
          <p>{{ copy.resources.description }}</p>
        </header>
        <div class="vision-resources">
          <HeroActionCards />
        </div>
      </div>
    </section>

    <section class="vision-cta">
      <div class="vision-container vision-cta-inner">
        <span class="vision-kicker">{{ copy.cta.kicker }}</span>
        <h2>{{ copy.cta.title }}</h2>
        <p>{{ copy.cta.description }}</p>
        <div class="vision-actions">
          <a class="vision-button vision-button-primary" :href="copy.cta.primaryHref">{{ copy.cta.primary }} <span aria-hidden="true">→</span></a>
          <a class="vision-button vision-button-secondary" href="https://github.com/pnoker/iot-dc3">{{ copy.cta.secondary }}</a>
        </div>
      </div>
    </section>

    <CardNav v-if="isHome" />
  </main>
</template>

<style scoped>
.vision-page {
  --vision-border: color-mix(in srgb, var(--vp-c-brand-1) 16%, var(--vp-c-divider));
  --vision-glass: color-mix(in srgb, var(--vp-c-bg-elv) 72%, transparent);
  width: 100%;
  margin-top: calc(-1 * var(--vp-nav-height));
  overflow: hidden;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
}

.vision-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 760px;
}

.vision-container {
  width: min(var(--dc3-container), calc(100% - 64px));
  margin: 0 auto;
}

:is(
  .vision-formula-card,
  .vision-gap-card,
  .vision-layer,
  .vision-loop li,
  .vision-principles article,
  .vision-boundary article,
  .vision-journey li
) {
  position: relative;
  isolation: isolate;
  transform: translateY(0) scale(1);
  transition:
    transform 340ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 300ms ease,
    box-shadow 340ms ease;
}

:is(
  .vision-formula-card,
  .vision-gap-card,
  .vision-layer,
  .vision-loop li,
  .vision-principles article,
  .vision-boundary article,
  .vision-journey li
)::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background: radial-gradient(
    320px circle at var(--vision-card-x, 50%) var(--vision-card-y, 0%),
    rgba(72, 211, 238, 0.22),
    rgba(91, 116, 235, 0.075) 38%,
    transparent 70%
  );
  opacity: 0;
  transform: scale(0.94);
  transition: opacity 300ms ease, transform 480ms cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: none;
}

:is(
  .vision-formula-card,
  .vision-gap-card,
  .vision-layer,
  .vision-loop li,
  .vision-principles article,
  .vision-boundary article,
  .vision-journey li
) > * {
  position: relative;
  z-index: 1;
}

@media (hover: hover) and (pointer: fine) {
  :is(
    .vision-formula-card,
    .vision-gap-card,
    .vision-layer,
    .vision-loop li,
    .vision-principles article,
    .vision-boundary article,
    .vision-journey li
  ):hover {
    z-index: 2;
    border-color: color-mix(in srgb, var(--vp-c-brand-1) 48%, var(--vp-c-divider));
    box-shadow:
      0 28px 64px rgba(13, 114, 180, 0.16),
      0 8px 24px rgba(41, 197, 223, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.78);
    transform: translateY(-6px) scale(1.008);
  }

  :is(
    .vision-formula-card,
    .vision-gap-card,
    .vision-layer,
    .vision-loop li,
    .vision-principles article,
    .vision-boundary article,
    .vision-journey li
  ):hover::after {
    opacity: 1;
    transform: scale(1);
  }

  :is(
    .vision-gap-card,
    .vision-layer,
    .vision-loop li,
    .vision-principles article,
    .vision-boundary article,
    .vision-journey li
  ) h3,
  .vision-formula-card > strong {
    transition: transform 340ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  :is(
    .vision-gap-card,
    .vision-layer,
    .vision-loop li,
    .vision-principles article,
    .vision-boundary article,
    .vision-journey li
  ):hover h3,
  .vision-formula-card:hover > strong {
    transform: translateY(-2px);
  }
}

.vision-hero {
  position: relative;
  padding: calc(128px + var(--vp-nav-height)) 0 104px;
  overflow: hidden;
  background:
    radial-gradient(circle at 16% 4%, rgba(41, 197, 223, 0.17), transparent 32%),
    radial-gradient(circle at 84% 12%, rgba(91, 116, 235, 0.16), transparent 34%),
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg-alt) 64%, transparent), transparent 82%);
}

.vision-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.2;
  background-image: radial-gradient(color-mix(in srgb, var(--vp-c-brand-1) 52%, transparent) 0.8px, transparent 0.8px);
  background-position: center top;
  background-size: 16px 16px;
  mask-image:
    linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.82) 46%, transparent 88%),
    linear-gradient(90deg, transparent 0%, #000 18%, #000 82%, transparent 100%);
  mask-composite: intersect;
  pointer-events: none;
}

.vision-hero-inner {
  position: relative;
  z-index: 2;
  text-align: center;
}

.vision-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 6px 12px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-brand-soft) 56%, transparent);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 720;
  line-height: 1;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.vision-hero h1 {
  max-width: 980px;
  margin: 0 auto;
  border: none;
  font-size: clamp(44px, 6vw, 76px);
  font-weight: 790;
  line-height: 1.06;
  letter-spacing: -0.055em;
}

.vision-hero-lead {
  max-width: 820px;
  margin: 26px auto 0;
  color: var(--vp-c-text-2);
  font-size: clamp(18px, 2vw, 23px);
  line-height: 1.7;
}

.vision-hero-note {
  margin: 14px auto 0;
  color: var(--vp-c-text-3);
  font-size: 15px;
  font-weight: 620;
}

.vision-formula {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1.08fr) auto minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  margin-top: 64px;
}

.vision-formula-card {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-height: 184px;
  justify-content: center;
  padding: 28px 22px;
  border: 1px solid var(--vision-border);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.72), transparent 44%),
    linear-gradient(150deg, rgba(255, 255, 255, 0.4), rgba(18, 150, 219, 0.07), rgba(91, 116, 235, 0.05));
  box-shadow: 0 16px 44px rgba(16, 96, 161, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.76);
  backdrop-filter: blur(18px) saturate(1.25);
}

.vision-formula-card.active {
  border-color: rgba(41, 197, 223, 0.42);
  background:
    radial-gradient(circle at 50% 0%, rgba(41, 197, 223, 0.2), transparent 52%),
    linear-gradient(150deg, rgba(255, 255, 255, 0.56), rgba(18, 150, 219, 0.13), rgba(91, 116, 235, 0.09));
  box-shadow: 0 22px 56px rgba(13, 114, 180, 0.17), inset 0 1px 0 rgba(255, 255, 255, 0.86);
}

.vision-formula-card > span {
  color: var(--vp-c-brand-1);
  font-size: 13px;
  font-weight: 720;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vision-formula-card strong {
  font-size: clamp(22px, 2.4vw, 31px);
  line-height: 1.15;
  letter-spacing: -0.025em;
}

.vision-formula-card small {
  color: var(--vp-c-text-3);
  font-size: 13px;
  font-weight: 620;
  font-family: var(--vp-font-family-mono);
}

.vision-formula-arrow {
  color: var(--vp-c-brand-1);
  font-size: 28px;
  font-weight: 320;
}

.vision-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 34px 0 0;
  padding: 0;
  border-top: 1px solid color-mix(in srgb, var(--vp-c-divider) 70%, transparent);
}

.vision-stats > div {
  position: relative;
  padding: 26px 18px 0;
  border-left: 1px solid color-mix(in srgb, var(--vp-c-divider) 70%, transparent);
  border-radius: 18px;
  transition: transform 280ms ease, background-color 280ms ease, box-shadow 280ms ease;
}

.vision-stats > div:first-child { border-left: none; }

.vision-stats dt {
  margin: 0;
  background: linear-gradient(112deg, #07549a, #119bd6 45%, #5558c9);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 800;
  line-height: 1;
  transition: transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 280ms ease;
}

.vision-stats dd {
  margin: 9px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 650;
}

@media (hover: hover) and (pointer: fine) {
  .vision-stats > div:hover {
    background: color-mix(in srgb, var(--vp-c-brand-soft) 30%, transparent);
    box-shadow: 0 14px 34px rgba(13, 114, 180, 0.08);
    transform: translateY(-3px);
  }

  .vision-stats > div:hover dt {
    filter: drop-shadow(0 7px 15px rgba(18, 150, 219, 0.2));
    transform: scale(1.045);
  }
}

.vision-section {
  position: relative;
  padding: 112px 0;
}

.vision-section-soft,
.vision-journey-section {
  border-top: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  background:
    radial-gradient(circle at 8% 20%, rgba(18, 150, 219, 0.07), transparent 28%),
    radial-gradient(circle at 92% 80%, rgba(91, 116, 235, 0.07), transparent 28%),
    color-mix(in srgb, var(--vp-c-bg-alt) 58%, transparent);
}

.vision-section-head {
  max-width: 840px;
  margin: 0 auto;
  text-align: center;
}

.vision-section-head h2,
.vision-cta h2 {
  margin: 18px auto 0;
  border: none;
  font-size: clamp(34px, 4.4vw, 56px);
  font-weight: 770;
  line-height: 1.1;
  letter-spacing: -0.045em;
}

.vision-section-head > p,
.vision-cta-inner > p {
  max-width: 720px;
  margin: 18px auto 0;
  color: var(--vp-c-text-2);
  font-size: 17px;
  line-height: 1.78;
}

.vision-gap-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 56px;
}

.vision-gap-card {
  min-height: 244px;
  padding: 30px 28px;
  border: 1px solid var(--vision-border);
  border-radius: var(--dc3-glass-radius);
  background: var(--vision-glass);
  box-shadow: 0 14px 36px rgba(16, 96, 161, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.62);
}

.vision-gap-card > span,
.vision-principle-number {
  color: var(--vp-c-brand-1);
  font-size: 13px;
  font-weight: 720;
  letter-spacing: 0.1em;
  font-family: var(--vp-font-family-mono);
}

.vision-gap-card h3 {
  margin: 48px 0 0;
  font-size: 21px;
  line-height: 1.3;
}

.vision-gap-card p,
.vision-principles article > p,
.vision-boundary article p,
.vision-journey li p {
  margin: 13px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14.5px;
  line-height: 1.75;
}

.vision-callout {
  max-width: 840px;
  margin: 52px auto 0;
  padding: 22px 28px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 22%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-brand-soft) 56%, transparent);
  color: var(--vp-c-text-1);
  font-size: clamp(18px, 2.2vw, 24px);
  font-weight: 720;
  line-height: 1.45;
  text-align: center;
}

.vision-layers {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 980px;
  margin: 58px auto 0;
}

.vision-layer {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
  min-height: 138px;
  padding: 26px 30px;
  border: 1px solid var(--vision-border);
  border-radius: var(--dc3-glass-radius);
  background: var(--vision-glass);
  box-shadow: 0 12px 30px rgba(16, 96, 161, 0.05);
}

.vision-layer.active {
  border-color: rgba(41, 197, 223, 0.46);
  background:
    radial-gradient(circle at 100% 0%, rgba(91, 116, 235, 0.13), transparent 38%),
    linear-gradient(135deg, rgba(41, 197, 223, 0.1), var(--vision-glass));
  box-shadow: 0 20px 48px rgba(13, 114, 180, 0.13), inset 4px 0 0 rgba(41, 197, 223, 0.64);
}

.vision-layer-tag {
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 720;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.vision-layer h3 {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
}

.vision-layer-copy p {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14.5px;
  line-height: 1.7;
}

.vision-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.vision-chips span {
  padding: 6px 12px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 16%, var(--vp-c-divider));
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 70%, transparent);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 630;
  white-space: nowrap;
}

.vision-loop-section {
  padding-top: 96px;
}

.vision-loop {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin: 56px 0 0;
  padding: 0;
  list-style: none;
}

.vision-loop li {
  position: relative;
  min-height: 230px;
  padding: 24px 20px;
  overflow: hidden;
  border: 1px solid var(--vision-border);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 100% 0%, rgba(41, 197, 223, 0.1), transparent 44%),
    linear-gradient(150deg, rgba(255, 255, 255, 0.42), rgba(18, 150, 219, 0.05), rgba(91, 116, 235, 0.04));
  box-shadow: 0 12px 32px rgba(16, 96, 161, 0.055);
}

.vision-loop li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--vp-c-brand-1), transparent);
}

.vision-loop-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--vp-c-text-3);
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
}

.vision-loop-meta strong { color: var(--vp-c-brand-1); }

.vision-loop h3 {
  margin: 44px 0 0;
  font-size: 19px;
  line-height: 1.3;
}

.vision-loop li > p {
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.7;
}

.vision-principles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 56px;
}

.vision-principles article {
  display: flex;
  flex-direction: column;
  min-height: 410px;
  padding: 34px;
  border: 1px solid var(--vision-border);
  border-radius: calc(var(--dc3-glass-radius) + 4px);
  background:
    radial-gradient(circle at 100% 0%, rgba(91, 116, 235, 0.12), transparent 42%),
    var(--vision-glass);
  box-shadow: 0 18px 46px rgba(16, 96, 161, 0.08);
}

.vision-principles h3 {
  margin: 66px 0 0;
  background: linear-gradient(112deg, #07549a, #119bd6 44%, #5558c9);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: clamp(30px, 3.5vw, 46px);
  line-height: 1.08;
  letter-spacing: -0.035em;
}

.vision-principles article > strong {
  margin-top: 14px;
  color: var(--vp-c-text-1);
  font-size: 16px;
}

.vision-principles article .vision-chips {
  justify-content: flex-start;
  margin-top: auto;
  padding-top: 28px;
}

.vision-boundary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 18px;
  align-items: stretch;
  margin-top: 56px;
}

.vision-boundary article {
  min-height: 226px;
  padding: 28px 26px;
  border: 1px solid var(--vision-border);
  border-radius: var(--dc3-glass-radius);
  background: var(--vision-glass);
}

.vision-boundary article > span {
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 720;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.vision-boundary article h3 {
  margin: 48px 0 0;
  font-size: 20px;
  line-height: 1.35;
}

.vision-boundary-arrow {
  align-self: center;
  color: var(--vp-c-brand-1);
  font-size: 24px;
}

.vision-boundary-closing {
  margin: 46px auto 0;
  background: linear-gradient(112deg, #07549a, #119bd6 44%, #5558c9);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 760;
  line-height: 1.4;
  text-align: center;
}

.vision-journey {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin: 64px 0 0;
  padding: 30px 0 0;
  list-style: none;
}

.vision-journey::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, rgba(18, 150, 219, 0.2), rgba(18, 150, 219, 0.55), rgba(91, 116, 235, 0.78));
}

.vision-journey li {
  position: relative;
  min-height: 244px;
  padding: 30px 28px;
  border: 1px solid var(--vision-border);
  border-radius: var(--dc3-glass-radius);
  background: var(--vision-glass);
  box-shadow: 0 14px 36px rgba(16, 96, 161, 0.06);
}

.vision-journey li::before {
  content: '';
  position: absolute;
  top: -30px;
  left: 50%;
  width: 13px;
  height: 13px;
  border: 3px solid var(--vp-c-bg-alt);
  border-radius: 50%;
  background: linear-gradient(135deg, #29c5df, #6773e5);
  box-shadow: 0 0 0 2px rgba(41, 197, 223, 0.2), 0 0 16px rgba(41, 197, 223, 0.38);
  transform: translateX(-50%);
}

.vision-journey li.active {
  border-color: rgba(41, 197, 223, 0.46);
  background:
    radial-gradient(circle at 50% 0%, rgba(41, 197, 223, 0.18), transparent 46%),
    var(--vision-glass);
  box-shadow: 0 22px 52px rgba(13, 114, 180, 0.14);
}

.vision-journey li > span {
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 720;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.vision-journey h3 {
  margin: 48px 0 0;
  font-size: 21px;
  line-height: 1.3;
}

.vision-cta {
  position: relative;
  padding: 124px 0 132px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 120%, rgba(41, 197, 223, 0.24), transparent 52%),
    radial-gradient(circle at 12% 14%, rgba(18, 150, 219, 0.1), transparent 30%),
    radial-gradient(circle at 88% 12%, rgba(91, 116, 235, 0.12), transparent 30%);
}

.vision-resources-section {
  border-bottom: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
}

.vision-resources {
  max-width: 980px;
  margin: 48px auto 0;
}

.vision-resources :deep(.hero-action-grid) {
  padding-top: 0;
}

.vision-cta-inner { text-align: center; }

.vision-cta h2 { max-width: 900px; }

.vision-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  margin-top: 34px;
}

.vision-button {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 25px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 680;
  text-decoration: none;
  transition: transform 220ms ease, box-shadow 220ms ease;
}

.vision-button:hover { transform: translateY(-2px); text-decoration: none; }

.vision-button-primary {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: linear-gradient(150deg, #07549a, #0d8fd0 52%, #4f52bf 120%);
  box-shadow: 0 16px 38px rgba(13, 114, 180, 0.24);
  color: #fff;
}

.vision-button-primary:hover { color: #fff; box-shadow: 0 20px 44px rgba(13, 114, 180, 0.32); }

.vision-button-secondary {
  border: 1px solid var(--vision-border);
  background: var(--vision-glass);
  color: var(--vp-c-text-1);
}

.vision-button-secondary:hover { color: var(--vp-c-text-1); }

:global(.dark .vision-formula-card),
:global(.dark .vision-loop li) {
  background:
    radial-gradient(circle at 100% 0%, rgba(41, 197, 223, 0.12), transparent 44%),
    linear-gradient(150deg, rgba(22, 113, 169, 0.1), rgba(17, 35, 52, 0.3), rgba(61, 62, 143, 0.1));
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.2);
}

:global(.dark .vision-formula-card.active) {
  background:
    radial-gradient(circle at 50% 0%, rgba(41, 197, 223, 0.2), transparent 50%),
    linear-gradient(150deg, rgba(22, 113, 169, 0.18), rgba(17, 35, 52, 0.34), rgba(61, 62, 143, 0.16));
}

:global(.dark .vision-stats dt),
:global(.dark .vision-principles h3),
:global(.dark .vision-boundary-closing) {
  background: linear-gradient(112deg, #8edcff, #d3fbff 44%, #a6a9ff);
  background-clip: text;
  -webkit-background-clip: text;
}

@media (max-width: 980px) {
  .vision-hero { padding-top: calc(104px + var(--vp-nav-height)); }

  .vision-formula {
    grid-template-columns: 1fr;
    max-width: 720px;
    margin-right: auto;
    margin-left: auto;
  }

  .vision-formula-card { min-height: 148px; }
  .vision-formula-arrow { transform: rotate(90deg); }

  .vision-loop {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .vision-loop li { grid-column: span 2; }
  .vision-loop li:nth-child(4) { grid-column: 2 / span 2; }
  .vision-loop li:nth-child(5) { grid-column: 4 / span 2; }

  .vision-layer {
    grid-template-columns: 90px minmax(0, 1fr);
  }

  .vision-layer .vision-chips {
    grid-column: 2;
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .vision-container { width: min(100% - 40px, var(--dc3-container)); }
  .vision-hero { padding: calc(88px + var(--vp-nav-height)) 0 76px; }
  .vision-hero h1 { font-size: clamp(38px, 11vw, 54px); }
  .vision-hero-lead { font-size: 17px; }

  .vision-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .vision-stats > div:nth-child(3) { border-left: none; }
  .vision-stats > div:nth-child(n + 3) { margin-top: 22px; }

  .vision-section { padding: 84px 0; }
  .vision-section-head h2,
  .vision-cta h2 { font-size: clamp(31px, 9vw, 42px); }
  .vision-section-head > p,
  .vision-cta-inner > p { font-size: 15.5px; }

  .vision-gap-grid,
  .vision-principles,
  .vision-journey {
    grid-template-columns: 1fr;
  }

  .vision-gap-card { min-height: 0; }
  .vision-gap-card h3 { margin-top: 32px; }
  .vision-callout { border-radius: var(--dc3-glass-radius); font-size: 18px; }

  .vision-layer {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 24px;
  }

  .vision-layer .vision-chips { grid-column: auto; }

  .vision-loop {
    grid-template-columns: 1fr;
  }

  .vision-loop li,
  .vision-loop li:nth-child(4),
  .vision-loop li:nth-child(5) {
    grid-column: auto;
    min-height: 176px;
  }

  .vision-loop h3 { margin-top: 30px; }
  .vision-principles article { min-height: 370px; padding: 28px; }
  .vision-principles h3 { margin-top: 48px; }

  .vision-boundary {
    grid-template-columns: 1fr;
  }

  .vision-boundary article { min-height: 0; }
  .vision-boundary article h3 { margin-top: 30px; }
  .vision-boundary-arrow { justify-self: center; transform: rotate(90deg); }

  .vision-journey {
    gap: 18px;
    padding-top: 0;
  }

  .vision-journey::before { display: none; }
  .vision-journey li { min-height: 0; }
  .vision-journey li::before { display: none; }
  .vision-journey h3 { margin-top: 32px; }

  .vision-cta { padding: 92px 0 100px; }
  .vision-actions { flex-direction: column; align-items: center; }
  .vision-button { width: min(320px, 100%); }
}

@media (prefers-reduced-motion: reduce) {
  .vision-button,
  .vision-stats > div,
  .vision-stats dt,
  :is(
    .vision-formula-card,
    .vision-gap-card,
    .vision-layer,
    .vision-loop li,
    .vision-principles article,
    .vision-boundary article,
    .vision-journey li
  ),
  :is(
    .vision-formula-card,
    .vision-gap-card,
    .vision-layer,
    .vision-loop li,
    .vision-principles article,
    .vision-boundary article,
    .vision-journey li
  )::after {
    transition: none;
  }

  :is(
    .vision-formula-card,
    .vision-gap-card,
    .vision-layer,
    .vision-loop li,
    .vision-principles article,
    .vision-boundary article,
    .vision-journey li
  ):hover,
  .vision-stats > div:hover,
  .vision-stats > div:hover dt {
    transform: none;
  }
}
</style>
