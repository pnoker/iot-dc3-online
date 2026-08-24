<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))

const copy = computed(() => isEnglish.value ? {
  kicker: 'Platform',
  title: 'Not an AI demo — industrial infrastructure that ships',
  description: 'A decade of fundamentals underneath the agent story: protocol access, cloud-native stack, AI-native tooling and industrial-grade reliability.',
  cards: [
    {
      icon: 'plug',
      title: '28 Protocol Drivers',
      chips: ['Modbus', 'OPC UA', 'S7', 'BACnet', 'MQTT'],
      note: 'Write a driver once; every device speaks the same data model.'
    },
    {
      icon: 'cloud',
      title: 'Cloud Native',
      chips: ['Spring Cloud', 'PostgreSQL', 'RabbitMQ', 'Kubernetes', 'Helm'],
      note: 'Distributed, multi-tenant and horizontally scalable.'
    },
    {
      icon: 'spark',
      title: 'AI Native',
      chips: ['Spring AI', 'MCP', 'Tool Calling', 'Agent'],
      note: 'Agents and tool calling are first-class, not bolt-on.'
    },
    {
      icon: 'shield',
      title: 'Industrial Ready',
      chips: ['Multi-tenant', 'RBAC', 'Observability', 'Command Plane'],
      note: 'Deploys via Compose, Swarm, Kubernetes and Helm.'
    }
  ]
} : {
  kicker: '平台能力',
  title: '不是 AI Demo，而是可以落地的工业基础设施',
  description: '智能体叙事的下面，是十年沉淀的基本盘：协议接入、云原生、AI 原生与工业级可靠性，一应俱全。',
  cards: [
    {
      icon: 'plug',
      title: '28 个协议驱动',
      chips: ['Modbus', 'OPC UA', 'S7', 'BACnet', 'MQTT'],
      note: '驱动写一次，所有设备讲同一种数据模型。'
    },
    {
      icon: 'cloud',
      title: '云原生',
      chips: ['Spring Cloud', 'PostgreSQL', 'RabbitMQ', 'Kubernetes', 'Helm'],
      note: '分布式、多租户、可水平扩展。'
    },
    {
      icon: 'spark',
      title: 'AI 原生',
      chips: ['Spring AI', 'MCP', 'Tool Calling', 'Agent'],
      note: '智能体与工具调用是内建能力，不是外挂。'
    },
    {
      icon: 'shield',
      title: '工业就绪',
      chips: ['多租户', 'RBAC', '可观测性', '指令平面'],
      note: '支持 Compose、Swarm、Kubernetes、Helm 多种部署。'
    }
  ]
})
</script>

<template>
  <section class="grid-section" :aria-label="copy.kicker">
    <div class="grid-inner">
      <div class="grid-head">
        <span class="grid-kicker">
          <span class="grid-kicker-dot" aria-hidden="true"></span>
          {{ copy.kicker }}
        </span>
        <h2 class="grid-title">{{ copy.title }}</h2>
        <p class="grid-description">{{ copy.description }}</p>
      </div>

      <div class="grid-cards">
        <article v-for="card in copy.cards" :key="card.title" class="grid-card">
          <span class="grid-card-icon" aria-hidden="true">
            <svg v-if="card.icon === 'plug'" viewBox="0 0 24 24">
              <path d="M9 3v5a3 3 0 0 1-3 3H4M15 3v5a3 3 0 0 0 3 3h2" />
              <path d="M12 3v18M9 17v4M15 17v4" />
            </svg>
            <svg v-else-if="card.icon === 'cloud'" viewBox="0 0 24 24">
              <path d="M7 18a4.5 4.5 0 1 1 .72-8.93A6 6 0 0 1 19.2 10.6 4 4 0 0 1 18.5 18z" />
            </svg>
            <svg v-else-if="card.icon === 'spark'" viewBox="0 0 24 24">
              <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
              <path d="m6.3 6.3 3.5 3.5M14.2 14.2l3.5 3.5M17.7 6.3l-3.5 3.5M9.8 14.2l-3.5 3.5" />
            </svg>
            <svg v-else viewBox="0 0 24 24">
              <path d="M12 3 5 6v5c0 4.4 3 8.3 7 10 4-1.7 7-5.6 7-10V6z" />
              <path d="m9.5 12 2 2 3.5-4" />
            </svg>
          </span>

          <h3 class="grid-card-title">{{ card.title }}</h3>

          <div class="grid-card-chips">
            <span v-for="chip in card.chips" :key="chip">{{ chip }}</span>
          </div>

          <p class="grid-card-note">{{ card.note }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid-section {
  width: 100%;
  padding-top: 108px;
}

.grid-inner {
  width: min(1152px, 100%);
  margin: 0 auto;
}

.grid-head {
  text-align: center;
}

.grid-kicker {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 720;
  letter-spacing: 0.16em;
}

.grid-kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #29c5df, #6773e5);
  box-shadow: 0 0 12px rgba(41, 197, 223, 0.5);
}

.grid-title {
  max-width: 760px;
  margin: 16px auto 0;
  border: none;
  color: var(--vp-c-text-1);
  font-size: clamp(28px, 3.2vw, 42px);
  font-weight: 740;
  line-height: 1.16;
  letter-spacing: -0.035em;
}

.grid-description {
  max-width: 680px;
  margin: 14px auto 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.75;
}

.grid-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 44px;
}

.grid-card {
  --card-rgb: 18, 150, 219;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 13px;
  min-height: 252px;
  padding: 26px 24px 22px;
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

.grid-card:nth-child(2) { --card-rgb: 27, 178, 165; }
.grid-card:nth-child(3) { --card-rgb: 91, 116, 235; }
.grid-card:nth-child(4) { --card-rgb: 214, 111, 83; }

.grid-card:hover {
  border-color: rgba(var(--card-rgb), 0.34);
  box-shadow:
    0 26px 58px rgba(16, 96, 161, 0.15),
    0 10px 28px rgba(var(--card-rgb), 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    inset 0 -12px 28px rgba(var(--card-rgb), 0.07);
  transform: translateY(-5px);
}

.grid-card-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(var(--card-rgb), 0.22);
  border-radius: 13px;
  background:
    radial-gradient(circle at 25% 10%, rgba(255, 255, 255, 0.64), transparent 42%),
    linear-gradient(145deg, rgba(var(--card-rgb), 0.17), rgba(var(--card-rgb), 0.06));
  color: rgb(var(--card-rgb));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.56);
}

.grid-card-icon svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.grid-card-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 19px;
  font-weight: 720;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.grid-card-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.grid-card-chips span {
  padding: 4px 10px;
  border: 1px solid rgba(var(--card-rgb), 0.22);
  border-radius: 999px;
  background: color-mix(in srgb, rgb(var(--card-rgb)) 8%, transparent);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 620;
}

.grid-card-note {
  margin: auto 0 0;
  color: var(--vp-c-text-3);
  font-size: 13px;
  line-height: 1.6;
}

:global(.dark .grid-card) {
  border-color: rgba(143, 216, 250, 0.16);
  background:
    radial-gradient(circle at 16% 0%, rgba(205, 245, 255, 0.13), transparent 42%),
    linear-gradient(135deg, rgba(var(--card-rgb), 0.11), rgba(17, 35, 52, 0.3) 58%, rgba(61, 62, 143, 0.12));
  box-shadow:
    0 22px 50px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(232, 251, 255, 0.1),
    inset 0 -12px 28px rgba(0, 0, 0, 0.12);
}

@media (max-width: 1100px) {
  .grid-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .grid-section {
    padding-top: 84px;
  }

  .grid-cards {
    grid-template-columns: 1fr;
  }

  .grid-card {
    min-height: 0;
  }
}
</style>
