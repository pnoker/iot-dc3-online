<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))

const copy = computed(() => isEnglish.value ? {
  kicker: 'Engineering Evidence',
  title: 'The claim is bold. The receipts are below.',
  description: '',
  stats: [
    {value: '28', label: 'Protocol Drivers', sub: 'Modbus · OPC UA · S7 · BACnet · MQTT'},
    {value: '330+', label: 'Agent Tools', sub: 'Auto-aggregated from OpenAPI operations as MCP tools'},
    {value: 'OAuth 2.1', label: 'Secure MCP', sub: 'RBAC ∩ tool whitelist ∩ risk tiers on every call'},
    {value: '10', label: 'Years · Industrial IoT', sub: 'A decade of industrial IoT engineering'}
  ],
  stack: ['Spring AI', 'MCP', 'PostgreSQL', 'TimescaleDB', 'RabbitMQ', 'Kubernetes', 'Helm']
} : {
  kicker: '工程证据',
  title: '主张很大，证据在这里。',
  description: '',
  stats: [
    {value: '28', label: '协议驱动', sub: 'Modbus · OPC UA · S7 · BACnet · MQTT'},
    {value: '330+', label: '智能体工具', sub: '由 OpenAPI 操作自动聚合为 MCP Tool'},
    {value: 'OAuth 2.1', label: '安全的 MCP', sub: '每次调用过 RBAC ∩ 白名单 ∩ 风险分级'},
    {value: '10', label: '年 · 工业物联网', sub: '十年工业 IoT 工程基本盘'}
  ],
  stack: ['Spring AI', 'MCP', 'PostgreSQL', 'TimescaleDB', 'RabbitMQ', 'Kubernetes', 'Helm']
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
        <p v-if="copy.description" class="grid-description">{{ copy.description }}</p>
      </div>

      <div class="grid-cards">
        <article v-for="stat in copy.stats" :key="stat.label" class="grid-card">
          <span class="grid-card-value">{{ stat.value }}</span>
          <h3 class="grid-card-label">{{ stat.label }}</h3>
          <p class="grid-card-sub">{{ stat.sub }}</p>
        </article>
      </div>

      <div class="grid-stack" :aria-label="copy.kicker">
        <span v-for="item in copy.stack" :key="item" class="grid-stack-chip">{{ item }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid-section {
  width: 100%;
  padding-top: 160px;
}

.grid-inner {
  width: min(var(--dc3-container), 100%);
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
  gap: 10px;
  min-height: 216px;
  padding: 30px 26px 24px;
  overflow: hidden;
  border: 1px solid rgba(151, 219, 248, 0.18);
  border-radius: var(--dc3-glass-radius);
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.3), rgba(var(--card-rgb), 0.05) 60%, rgba(77, 83, 199, 0.03));
  box-shadow: 0 10px 30px rgba(16, 96, 161, 0.05);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  transition: border-color 300ms ease;
}

.grid-card:nth-child(2) { --card-rgb: 91, 116, 235; }
.grid-card:nth-child(3) { --card-rgb: 27, 178, 165; }
.grid-card:nth-child(4) { --card-rgb: 18, 150, 219; }

.grid-card:hover {
  border-color: rgba(var(--card-rgb), 0.3);
}

.grid-card-value {
  background: linear-gradient(112deg, #07549a 4%, #119bd6 42%, #1786d4 62%, #5558c9 96%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: clamp(42px, 4.6vw, 58px);
  font-weight: 800;
  line-height: 1.0;
  letter-spacing: -0.035em;
  font-variant-numeric: tabular-nums;
}

:global(.dark .grid-card-value) {
  background: linear-gradient(112deg, #8edcff 4%, #d3fbff 42%, #7fddff 60%, #a6a9ff 96%);
  background-clip: text;
  -webkit-background-clip: text;
}

.grid-card-label {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.grid-card-sub {
  margin: auto 0 0;
  color: var(--vp-c-text-3);
  font-size: 12.5px;
  line-height: 1.65;
  font-family: var(--vp-font-family-mono);
}

.grid-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 26px;
}

.grid-stack-chip {
  padding: 7px 16px;
  border: 1px solid rgba(151, 219, 248, 0.24);
  border-radius: 999px;
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.68), transparent 42%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(18, 150, 219, 0.08) 56%, rgba(91, 116, 235, 0.06));
  box-shadow: 0 12px 30px rgba(16, 96, 161, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px) saturate(1.3);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 640;
  font-family: var(--vp-font-family-mono);
}

:global(.dark .grid-card) {
  border-color: rgba(143, 216, 250, 0.13);
  background:
    linear-gradient(160deg, rgba(22, 113, 169, 0.07), rgba(17, 35, 52, 0.3) 60%, rgba(61, 62, 143, 0.08));
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
}

:global(.dark .grid-stack-chip) {
  border-color: rgba(143, 216, 250, 0.14);
  background:
    radial-gradient(circle at 16% 0%, rgba(205, 245, 255, 0.11), transparent 42%),
    linear-gradient(135deg, rgba(22, 113, 169, 0.1), rgba(17, 35, 52, 0.3) 58%, rgba(61, 62, 143, 0.11));
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(232, 251, 255, 0.08);
}

@media (max-width: 1100px) {
  .grid-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .grid-section {
    padding-top: 110px;
  }

  .grid-cards {
    grid-template-columns: 1fr;
  }

  .grid-card {
    min-height: 0;
  }
}
</style>
