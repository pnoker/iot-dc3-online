<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {page} = useData()
const isEnglish = computed(() => page.value.relativePath.startsWith('en/'))

const copy = computed(() => isEnglish.value ? {
  kicker: 'Built for Agents',
  title: 'From an IoT platform to agent infrastructure',
  description: 'Not a feature checklist — here is the view from the agent: how it sees, understands, decides, acts, and stays traceable throughout.',
  rows: [
    {keyword: 'See', title: 'Sense the field', description: 'Read devices, telemetry and alarms — let the agent see the physical world as data.'},
    {keyword: 'Understand', title: 'Structure the context', description: 'Turn physical signals into structured context the model can reason over.'},
    {keyword: 'Decide', title: 'Reason with knowledge', description: 'Combine LLM reasoning with industrial knowledge, rules and history.'},
    {keyword: 'Act', title: 'Execute safely', description: 'Call tools, write points and dispatch commands — gated, not wide open.'},
    {keyword: 'Trace', title: 'Audit everything', description: 'Observe every operation and execution, from intent to effect.'}
  ],
  footer: 'IoT Platform → Agent Infrastructure for the Physical World'
} : {
  kicker: '面向智能体',
  title: '把物联网平台，升级为智能体的基础设施',
  description: '不再按产品说明书的方式介绍功能，而是换成智能体的视角：它如何看见、理解、决策、行动，并被全程追溯。',
  rows: [
    {keyword: 'See', title: '感知现场', description: '读取设备、遥测与告警，让智能体把物理世界当作数据来看。'},
    {keyword: 'Understand', title: '理解信号', description: '把物理信号转化为模型可以推理的结构化上下文。'},
    {keyword: 'Decide', title: '结合知识决策', description: '将 LLM 推理与工业知识、规则和历史数据相结合。'},
    {keyword: 'Act', title: '安全执行', description: '调用工具、写点位、下发指令 —— 有门禁，而不是全开放。'},
    {keyword: 'Trace', title: '全程追溯', description: '从意图到效果，观察每一次操作与执行。'}
  ],
  footer: 'IoT Platform → 面向物理世界的 Agent 基础设施'
})
</script>

<template>
  <section class="caps-section" :aria-label="copy.kicker">
    <div class="caps-inner">
      <div class="caps-head">
        <span class="caps-kicker">
          <span class="caps-kicker-dot" aria-hidden="true"></span>
          {{ copy.kicker }}
        </span>
        <h2 class="caps-title">{{ copy.title }}</h2>
        <p class="caps-description">{{ copy.description }}</p>
      </div>

      <div class="caps-list">
        <div v-for="row in copy.rows" :key="row.keyword" class="caps-row">
          <span class="caps-keyword">{{ row.keyword }}</span>
          <div class="caps-row-copy">
            <h3 class="caps-row-title">{{ row.title }}</h3>
            <p class="caps-row-description">{{ row.description }}</p>
          </div>
        </div>
      </div>

      <p class="caps-footer">
        <span class="caps-footer-arrow" aria-hidden="true">→</span>
        {{ copy.footer }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.caps-section {
  width: 100%;
  padding-top: 108px;
}

.caps-inner {
  width: min(1152px, 100%);
  margin: 0 auto;
}

.caps-head {
  text-align: center;
}

.caps-kicker {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 720;
  letter-spacing: 0.16em;
}

.caps-kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #29c5df, #6773e5);
  box-shadow: 0 0 12px rgba(41, 197, 223, 0.5);
}

.caps-title {
  max-width: 760px;
  margin: 16px auto 0;
  border: none;
  color: var(--vp-c-text-1);
  font-size: clamp(28px, 3.2vw, 42px);
  font-weight: 740;
  line-height: 1.16;
  letter-spacing: -0.035em;
}

.caps-description {
  max-width: 680px;
  margin: 14px auto 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.75;
}

.caps-list {
  position: relative;
  display: flex;
  flex-direction: column;
  margin-top: 44px;
  padding-left: 40px;
  gap: 0;
}

.caps-list::before {
  content: '';
  position: absolute;
  top: 26px;
  bottom: 26px;
  left: 8px;
  width: 2px;
  background: linear-gradient(180deg, rgba(18, 150, 219, 0.05), rgba(18, 150, 219, 0.42), rgba(91, 116, 235, 0.32), rgba(18, 150, 219, 0.05));
}

.caps-row {
  position: relative;
  display: grid;
  grid-template-columns: 216px minmax(0, 1fr);
  gap: 30px;
  align-items: start;
  padding: 22px 24px 22px 0;
  border-radius: var(--dc3-glass-radius);
  transition: background-color 280ms ease, transform 280ms ease;
}

.caps-row::before {
  content: '';
  position: absolute;
  top: 34px;
  left: -40px;
  width: 18px;
  height: 18px;
  border: 3px solid var(--vp-c-bg);
  border-radius: 50%;
  background: linear-gradient(135deg, #29c5df, #6773e5);
  box-shadow: 0 0 0 2px rgba(41, 197, 223, 0.22), 0 0 16px rgba(41, 197, 223, 0.42);
}

.caps-row:hover {
  background: color-mix(in srgb, var(--vp-c-brand-soft) 60%, transparent);
  transform: translateX(4px);
}

.caps-keyword {
  background: linear-gradient(112deg, #07549a 4%, #119bd6 42%, #1786d4 62%, #5558c9 96%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: 27px;
  font-weight: 780;
  letter-spacing: 0.04em;
  line-height: 1.2;
  font-family: var(--vp-font-family-mono);
}

:global(.dark .caps-keyword) {
  background: linear-gradient(112deg, #8edcff 4%, #d3fbff 42%, #7fddff 60%, #a6a9ff 96%);
  background-clip: text;
  -webkit-background-clip: text;
}

.caps-row-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 3px;
}

.caps-row-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.caps-row-description {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 15px;
  line-height: 1.7;
}

.caps-footer {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin: 26px 0 0;
  padding: 18px 26px;
  border: 1px solid rgba(151, 219, 248, 0.26);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.68), transparent 42%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(18, 150, 219, 0.08) 56%, rgba(91, 116, 235, 0.06));
  box-shadow: 0 12px 30px rgba(16, 96, 161, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px) saturate(1.3);
  color: var(--vp-c-text-1);
  font-size: 16px;
  font-weight: 660;
  letter-spacing: 0.01em;
}

.caps-footer-arrow {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

:global(.dark .caps-footer) {
  border-color: rgba(143, 216, 250, 0.14);
  background:
    radial-gradient(circle at 16% 0%, rgba(205, 245, 255, 0.11), transparent 42%),
    linear-gradient(135deg, rgba(22, 113, 169, 0.1), rgba(17, 35, 52, 0.3) 58%, rgba(61, 62, 143, 0.11));
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(232, 251, 255, 0.08);
}

@media (max-width: 900px) {
  .caps-section {
    padding-top: 84px;
  }

  .caps-row {
    grid-template-columns: 140px minmax(0, 1fr);
    gap: 18px;
    padding-left: 6px;
  }

  .caps-keyword {
    font-size: 21px;
  }
}

@media (max-width: 640px) {
  .caps-list {
    padding-left: 30px;
  }

  .caps-row {
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 16px 6px 16px 0;
  }

  .caps-row::before {
    left: -30px;
  }

  .caps-row:hover {
    transform: none;
  }

  .caps-keyword {
    font-size: 19px;
  }
}
</style>
