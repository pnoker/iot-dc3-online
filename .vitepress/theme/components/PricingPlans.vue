<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useI18n} from '../composables/useI18n'
import {useImmersiveHeader} from '../composables/useImmersiveHeader'

const {en, t} = useI18n()

useImmersiveHeader({contentSelector: '.pricing-shell'})

/* ---------- 计费状态：月付/年付 × 位号档位 ---------- */
const billing = ref<'annual' | 'monthly'>('annual')
const tierIndex = ref(0)

// 位号档位：整档计费（超出当前档位升入下一档），年付整体省 20%
const tiers = computed(() => en.value ? [
  {label: '≤ 500', priceAnnual: 29, priceMonthly: 36, totalAnnual: '$348 / yr', storage: '≤ 5M rows/mo', rowsMonthly: '5M rows', daily: '≈167K/day', rate: '~2 rows/s', storageRows: '60M rows'},
  {label: '≤ 1,000', priceAnnual: 49, priceMonthly: 61, totalAnnual: '$588 / yr', storage: '≤ 10M rows/mo', rowsMonthly: '10M rows', daily: '≈333K/day', rate: '~4 rows/s', storageRows: '120M rows'},
  {label: '≤ 5,000', priceAnnual: 79, priceMonthly: 99, totalAnnual: '$948 / yr', storage: '≤ 50M rows/mo', rowsMonthly: '50M rows', daily: '≈1.67M/day', rate: '~19 rows/s', storageRows: '600M rows'},
  {label: '≤ 10,000', priceAnnual: 129, priceMonthly: 161, totalAnnual: '$1,548 / yr', storage: '≤ 100M rows/mo', rowsMonthly: '100M rows', daily: '≈3.33M/day', rate: '~39 rows/s', storageRows: '1.2B rows'},
] : [
  {label: '≤ 500', priceAnnual: 199, priceMonthly: 249, totalAnnual: '¥2,388', storage: '月增 ≤ 500 万条', rowsMonthly: '500 万条', daily: '日均 ≈ 16.7 万条', rate: '平均 2 条/秒', storageRows: '6,000 万条'},
  {label: '≤ 1,000', priceAnnual: 299, priceMonthly: 374, totalAnnual: '¥3,588', storage: '月增 ≤ 1,000 万条', rowsMonthly: '1,000 万条', daily: '日均 ≈ 33.3 万条', rate: '平均 4 条/秒', storageRows: '1.2 亿条'},
  {label: '≤ 5,000', priceAnnual: 599, priceMonthly: 749, totalAnnual: '¥7,188', storage: '月增 ≤ 5,000 万条', rowsMonthly: '5,000 万条', daily: '日均 ≈ 166.7 万条', rate: '平均 19 条/秒', storageRows: '6 亿条'},
  {label: '≤ 10,000', priceAnnual: 999, priceMonthly: 1_249, totalAnnual: '¥11,988', storage: '月增 ≤ 1 亿条', rowsMonthly: '1 亿条', daily: '日均 ≈ 333.3 万条', rate: '平均 39 条/秒', storageRows: '12 亿条'},
])

const currentTier = computed(() => tiers.value[tierIndex.value])

/* 档位明细：随选中档位联动，把计价数学完全摊开 */
const tierDetailOpen = ref(false)
const tierDetailRows = computed(() => {
  const t = currentTier.value
  return {
    before: en.value ? [
      {k: 'Point cap', v: `${t.label} points`},
      {k: 'Monthly writes', v: `≤ ${t.rowsMonthly}`},
    ] : [
      {k: '位号上限', v: `${t.label} 位号`},
      {k: '月增数据', v: `≤ ${t.rowsMonthly}`},
    ],
    after: en.value ? [
      {k: 'History storage', v: `≤ ${t.storageRows} (~12 months retention)`},
      {k: 'Deployment', v: '1 standalone instance · +$19 / node · mo for clusters'},
      {k: 'Overage', v: 'Either cap exceeded → next tier; beyond-tier usage is out of support scope'},
    ] : [
      {k: '历史存储', v: `≤ ${t.storageRows}（约 12 个月留存）`},
      {k: '部署实例', v: '1 个单机实例 · 分布式 +¥99 / 节点 · 月'},
      {k: '超出处理', v: '位号或数据量任一超出即升档，超出部分不在保障范围内'},
    ],
  }
})
const priceLabel = computed(() => en.value ? `$${billing.value === 'annual' ? currentTier.value.priceAnnual : currentTier.value.priceMonthly}` : `¥${billing.value === 'annual' ? currentTier.value.priceAnnual : currentTier.value.priceMonthly.toLocaleString('en-US')}`)
const nodeAddon = computed(() => billing.value === 'annual'
  ? (en.value ? '+$19 / node · month' : '+¥99 / 节点 · 月')
  : (en.value ? '+$24 / node · month' : '+¥124 / 节点 · 月'))

const copy = computed(() => en.value ? {
  eyebrow: 'PRICING',
  title: 'Open source at the core. Pay when you scale.',
  lead: 'The Community edition is fully open source under AGPL-3.0 — self-host it for free, forever. Pay only for the scale you run: points, deployment shape, billing cycle.',
  plansLabel: 'Plans',
  billingLabel: 'Billing cycle',
  monthly: 'Monthly',
  annual: 'Annual',
  saveBadge: 'Save 20%',
  pointsLabel: 'Points tier',
  pointsUnit: 'points',
  recommended: 'Recommended',
  perInstanceMonth: '/ instance · month',
  free: 'Free forever',
  custom: 'Custom',
  customQuote: 'priced by scale',
  annualNote: (total: string) => `Billed annually · ${total}`,
  monthlyNote: 'Billed monthly · change anytime',
  community: {
    name: 'Community',
    desc: 'For evaluation, development and self-hosted production under AGPL-3.0.',
    cta: 'Get started on GitHub',
    href: 'https://github.com/pnoker/iot-dc3',
    demo: 'Live demo',
    demoHref: 'https://demo.dc3.site',
    features: [
      'Full standalone deployment, all features',
      'All 36 standard protocol drivers',
      'Unlimited points (self-hosted)',
      'Distributed deployment available (self-operated)',
      'Community support (GitHub / Gitee Issues)',
      'AGPL-3.0 open-source license',
    ],
  },
  professional: {
    name: 'Professional',
    desc: 'The production plan, tiered by points and history volume.',
    cta: 'Contact us',
    features: [
      'Everything in Community',
      '1 production instance (standalone) included',
      `Distributed cluster: ${nodeAddon.value}`,
    ],
  },
  enterprise: {
    name: 'Enterprise',
    desc: 'For closed-source integration, OEM and mission-critical scale.',
    cta: 'Talk to us',
    features: [
      'Unlimited points and nodes',
      'Commercial license (AGPL exemption)',
      'SSO / LDAP, enhanced audit, HA review',
      'Custom driver development credits included',
    ],
  },
  dimensions: {
    kicker: 'HOW IT IS BILLED',
    title: 'Four dimensions. No hidden math.',
    lead: 'The price is points & history tier × deployment shape × billing cycle. Standard drivers are always included.',
    items: [
      {
        title: 'Points & history volume',
        desc: 'Point count is access scale — real load also depends on sampling frequency and history volume: the same 500 points write about 43M rows a day at 1-second sampling versus roughly 12k at hourly. Professional tiers cap both: points (≤ 500 / ≤ 1,000 / ≤ 5,000 / ≤ 10,000) and monthly history writes (5M – 100M rows). Exceeding either moves you up a tier.',
        price: 'Points or volume exceeded → next tier',
      },
      {
        title: 'Standalone vs distributed',
        desc: 'A standalone deployment counts as 1 instance, included in Professional. For distributed (Spring Cloud multi-node) clusters, each extra node is a flat add-on; Enterprise has no node limit.',
        price: `Nodes: ${nodeAddon.value}`,
      },
      {
        title: 'Protocol drivers',
        desc: 'All 36 standard drivers ship with every plan at no cost. A driver for a private or proprietary protocol is a one-off custom development, delivered with source code and docs.',
        price: en.value ? 'Custom driver: from $4,000 / driver' : 'Custom driver: from ¥30,000 / driver',
      },
      {
        title: 'Monthly vs annual',
        desc: 'Monthly is flexible — upgrade or downgrade tiers anytime. Annual saves 20% overall and supports a single consolidated invoice.',
        price: 'Annual saves 20%',
      },
    ],
  },
  compare: {
    kicker: 'COMPARE PLANS',
    title: 'Side by side',
    columns: {dimension: 'Dimension', community: 'Community', professional: 'Professional', enterprise: 'Enterprise'},
    rows: [
      {label: 'Starting price', values: ['$0 forever', '$49 / mo', 'Custom']},
      {label: 'Standard 36 drivers', values: [true, true, true]},
      {label: 'Points scale', values: ['Unlimited (self-managed)', 'Officially backed, up to ≤ 10,000', 'Unlimited / custom']},
      {label: 'History write cap', values: ['Unlimited (self-managed)', '5M – 100M rows / month', 'Unlimited / custom']},
      {label: 'Deployment shape', values: ['Standalone (distributed self-operated)', 'Standalone + distributed per node', 'Distributed + HA review']},
      {label: 'Custom driver development', values: [false, 'Per driver add-on', 'Credits included']},
      {label: 'AGPL commercial exemption', values: [false, false, true]},
    ],
  },
  services: {
    title: 'Need more? Professional services',
    lead: 'Private deployment · data migration · driver customization · team training — quoted per project.',
    cta: 'Start a conversation',
  },
  tierDetail: 'Tier details',
  contact: {
    title: 'Contact us',
    copy: 'Copy email',
    copied: 'Copied ✓',
    open: 'Open mail app',
    hint: 'We reply within 3 business days',
    close: 'Close',
  },
  closing: {
    title: 'Start free. Scale when it pays off.',
    lead: 'Every capability ships in the open-source Community edition. Upgrade when your production deployment needs official backing or commercial licensing.',
    start: 'Quick start',
    startHref: 'https://docs.dc3.site/en/',
    contact: 'Contact us',
  },
} : {
  eyebrow: 'PRICING',
  title: '开源核心，永久免费',
  lead: '社区版在 AGPL-3.0 下完整开源——自托管零成本起步，永久免费。只为运行的规模付费：位号、部署形态、付费周期。',
  plansLabel: '选择方案',
  billingLabel: '付费周期',
  monthly: '月付',
  annual: '年付',
  saveBadge: '省 20%',
  pointsLabel: '位号档位',
  pointsUnit: '位号',
  recommended: '推荐',
  perInstanceMonth: '/ 实例 · 月',
  free: '永久免费',
  custom: '定制报价',
  customQuote: '按规模评估',
  annualNote: (total: string) => `年付合计 ${total}`,
  monthlyNote: '月付 · 随时升降档',
  community: {
    name: '社区版',
    desc: '适合评估、开发以及遵守 AGPL-3.0 的自托管生产部署。',
    cta: '前往 GitHub 上手',
    href: 'https://github.com/pnoker/iot-dc3',
    demo: '在线演示',
    demoHref: 'https://demo.dc3.site',
    features: [
      '单机部署功能完整',
      '全部 36 个标准协议驱动',
      '位号不限（自托管）',
      '分布式能力开源可用（自行运维）',
      '社区支持（GitHub / Gitee Issues）',
      'AGPL-3.0 开源协议',
    ],
  },
  professional: {
    name: '专业版',
    desc: '面向生产环境，按位号与历史数据总量分档。',
    cta: '联系我们',
    features: [
      '包含社区版全部能力',
      '含 1 个生产实例（单机）',
      `分布式集群：${nodeAddon.value}`,
    ],
  },
  enterprise: {
    name: '企业版',
    desc: '面向闭源集成、OEM 与关键业务规模。',
    cta: '联系我们',
    features: [
      '位号与节点规模不限',
      'AGPL-3.0 商业授权（闭源豁免）',
      'SSO / LDAP · 审计增强 · 高可用评审',
      '含专属驱动开发额度',
    ],
  },
  dimensions: {
    kicker: '计价方式',
    title: '四个维度，清晰透明',
    lead: '价格 = 位号与历史数据档位 × 部署形态 × 付费周期。标准驱动所有方案免费包含。',
    items: [
      {
        title: '位号与历史数据总量',
        desc: '位号数是接入规模，采集频率与历史数据总量决定真实负载——同样 500 个位号，秒级采集一天写入约 4,300 万条，小时级仅约 1.2 万条。专业版档位同时约束位号数（≤ 500 / ≤ 1,000 / ≤ 5,000 / ≤ 10,000）与历史数据月增量（500 万 – 1 亿条），任一超出即升档。',
        price: '位号与数据量任一超出即升档',
      },
      {
        title: '单机与分布式',
        desc: '单机部署 = 1 个实例，专业版已包含。分布式（Spring Cloud 多节点）集群按节点加购；企业版节点规模不限。',
        price: `节点：${nodeAddon.value}`,
      },
      {
        title: '协议驱动',
        desc: '全部 36 个标准驱动随所有方案免费提供。私有协议驱动为一次性定制开发，交付源码与文档。',
        price: '专属驱动 ¥30,000 / 个起',
      },
      {
        title: '月付与年付',
        desc: '月付灵活，随时升降档位；年付整体省 20%，支持一次性开票。',
        price: '年付立省 20%',
      },
    ],
  },
  compare: {
    kicker: '方案对比',
    title: '一张表看懂差异',
    columns: {dimension: '维度', community: '社区版', professional: '专业版', enterprise: '企业版'},
    rows: [
      {label: '起步价格', values: ['¥0 永久', '¥299 / 月', '定制报价']},
      {label: '标准 36 协议驱动', values: [true, true, true]},
      {label: '位号规模', values: ['不限（自行运维）', '官方承接，最高 ≤ 10,000', '不限 / 定制']},
      {label: '历史数据月增上限', values: ['不限（自行运维）', '500 万 – 1 亿条', '不限 / 定制']},
      {label: '部署形态', values: ['单机（分布式自运维）', '单机 + 分布式按节点', '分布式 + 高可用评审']},
      {label: '专属驱动开发', values: [false, '按个加购', '含开发额度']},
      {label: 'AGPL 商业授权豁免', values: [false, false, true]},
    ],
  },
  services: {
    title: '还需要更多？专业服务',
    lead: '私有化实施 · 数据迁移 · 驱动定制 · 培训赋能 —— 按项目报价。',
    cta: '发起沟通',
  },
  tierDetail: '档位明细',
  contact: {
    title: '联系我们',
    copy: '复制邮箱',
    copied: '已复制 ✓',
    open: '打开邮件应用',
    hint: '工作日来信将在 3 个工作日内回复',
    close: '关闭',
  },
  closing: {
    title: '从免费开源开始，按规模平滑升级',
    lead: '全部能力都随开源社区版交付。当生产部署需要官方承接或商业授权时，再平滑升级。',
    start: '查看快速开始',
    startHref: 'https://docs.dc3.site/zh/',
    contact: '联系我们',
  },
})

/* ---------- 交互：指针追踪光斑（demo-card 家族配方） ---------- */
function trackPointer(event: PointerEvent) {
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${event.clientX - rect.left}px`)
  el.style.setProperty('--my', `${event.clientY - rect.top}px`)
}

function clearPointer(event: PointerEvent) {
  const el = event.currentTarget as HTMLElement
  el.style.removeProperty('--mx')
  el.style.removeProperty('--my')
}

/* ---------- 联系弹窗：mailto 在未配置邮件客户端的电脑上会静默失败，
   因此点击「联系我们」先弹窗展示邮箱（一键复制），配了客户端的用户再走「打开邮件应用」 ---------- */
const CONTACT_EMAIL = 'pnokers@icloud.com'
const contactOpen = ref(false)
const emailCopied = ref(false)
const contactCloseBtn = ref<HTMLButtonElement | null>(null)

function openContact() {
  contactOpen.value = true
}

function closeContact() {
  contactOpen.value = false
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(CONTACT_EMAIL)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = CONTACT_EMAIL
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
  emailCopied.value = true
  window.setTimeout(() => {
    emailCopied.value = false
  }, 2000)
}

function onContactKey(event: KeyboardEvent) {
  if (!contactOpen.value) return
  if (event.key === 'Escape') {
    closeContact()
    return
  }
  if (event.key === 'Tab') {
    // 焦点在弹窗内可聚焦元素之间轮询，不逃出弹窗
    const focusables = Array.from(
      document.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>(
        '.dc-contact-card button, .dc-contact-card a',
      ),
    )
    if (focusables.length === 0) return
    event.preventDefault()
    const activeIndex = focusables.indexOf(document.activeElement as HTMLButtonElement)
    const next = event.shiftKey
      ? focusables[(activeIndex - 1 + focusables.length) % focusables.length]
      : focusables[(activeIndex + 1) % focusables.length]
    next?.focus()
  }
}

watch(contactOpen, (open) => {
  document.body.classList.toggle('dc-pricing-contact-open', open)
  if (open) {
    nextTick(() => contactCloseBtn.value?.focus())
  } else {
    emailCopied.value = false
  }
})

/* ---------- 滚动渐入（VisionAtmosphere 的 IntersectionObserver 思路） ---------- */
let revealObserver: IntersectionObserver | null = null

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const targets = document.querySelectorAll<HTMLElement>('.pricing-page [data-reveal]')
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-revealed'))
    return
  }
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      ;(entry.target as HTMLElement).classList.add('is-revealed')
      revealObserver?.unobserve(entry.target)
    })
  }, {rootMargin: '0px 0px -8% 0px', threshold: 0.08})
  targets.forEach(el => revealObserver?.observe(el))
  document.addEventListener('keydown', onContactKey)
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  document.removeEventListener('keydown', onContactKey)
  document.body.classList.remove('dc-pricing-contact-open')
})
</script>

<template>
  <main class="pricing-page">
    <section class="pricing-shell pricing-hero">
      <p class="pricing-eyebrow" data-reveal>{{ copy.eyebrow }}</p>
      <h1 class="pricing-title" data-reveal>{{ copy.title }}</h1>
      <p class="pricing-lead" data-reveal>{{ copy.lead }}</p>
    </section>

    <section class="pricing-shell pricing-plans" :aria-label="copy.plansLabel">
      <div class="pricing-plans-head" data-reveal>
        <p class="pricing-toggle-label">{{ copy.billingLabel }}</p>
        <div class="pricing-toggle" role="group" :aria-label="copy.billingLabel">
          <button
            type="button"
            :class="{'is-active': billing === 'monthly'}"
            :aria-pressed="billing === 'monthly'"
            @click="billing = 'monthly'"
          >{{ copy.monthly }}</button>
          <button
            type="button"
            :class="{'is-active': billing === 'annual'}"
            :aria-pressed="billing === 'annual'"
            @click="billing = 'annual'"
          >{{ copy.annual }}</button>
          <span class="pricing-toggle-badge">{{ copy.saveBadge }}</span>
        </div>
      </div>

      <div class="pricing-grid">
        <!-- 社区版 -->
        <article class="pricing-card pricing-card-featured" data-reveal @pointermove="trackPointer" @pointerleave="clearPointer">
          <p class="pricing-badge">{{ copy.recommended }}</p>
          <header class="pricing-card-head">
            <h2 class="pricing-card-name">{{ copy.community.name }}</h2>
            <p class="pricing-card-desc">{{ copy.community.desc }}</p>
          </header>
          <p class="pricing-price">
            <span class="pricing-price-amount">{{ t('¥0', '$0') }}</span>
            <span class="pricing-price-unit">{{ copy.free }}</span>
          </p>
          <ul class="pricing-features">
            <li v-for="f in copy.community.features" :key="f">{{ f }}</li>
          </ul>
          <div class="pricing-cta-row">
            <a class="pricing-cta pricing-cta-brand" :href="copy.community.href">{{ copy.community.cta }}</a>
            <a class="pricing-cta pricing-cta-ghost" :href="copy.community.demoHref">{{ copy.community.demo }}</a>
          </div>
        </article>

        <!-- 专业版：位号档位 × 付费周期 -->
        <article class="pricing-card" data-reveal @pointermove="trackPointer" @pointerleave="clearPointer">
          <header class="pricing-card-head">
            <h2 class="pricing-card-name">{{ copy.professional.name }}</h2>
            <p class="pricing-card-desc">{{ copy.professional.desc }}</p>
          </header>

          <div class="pricing-tiers" role="group" :aria-label="copy.pointsLabel">
            <button
              v-for="(tr, i) in tiers"
              :key="tr.label"
              type="button"
              :class="{'is-active': tierIndex === i}"
              :aria-pressed="tierIndex === i"
              @click="tierIndex = i"
            >
              {{ tr.label }}<span>{{ copy.pointsUnit }}</span>
            </button>
          </div>

          <p class="pricing-price">
            <Transition name="price-swap" mode="out-in">
              <span :key="billing + '-' + tierIndex" class="pricing-price-amount">{{ priceLabel }}</span>
            </Transition>
            <span class="pricing-price-unit">{{ copy.perInstanceMonth }}</span>
          </p>
          <Transition name="price-swap" mode="out-in">
            <p :key="billing + '-' + tierIndex" class="pricing-price-sub">
              {{ (billing === 'annual' ? copy.annualNote(currentTier.totalAnnual) : copy.monthlyNote) + ' · ' + currentTier.storage }}
            </p>
          </Transition>

          <ul class="pricing-features">
            <li v-for="f in copy.professional.features" :key="f">{{ f }}</li>
          </ul>
          <div class="pricing-tier-detail-toggle">
            <button type="button" :aria-expanded="tierDetailOpen" @click="tierDetailOpen = !tierDetailOpen">
              {{ copy.tierDetail }}
              <svg :class="{open: tierDetailOpen}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <div class="pricing-tier-detail" :class="{open: tierDetailOpen}">
            <div class="pricing-tier-detail-inner">
              <dl>
                <div v-for="row in tierDetailRows.before" :key="row.k">
                  <dt>{{ row.k }}</dt>
                  <dd>{{ row.v }}</dd>
                </div>
                <div class="pricing-tier-hint">
                  <span class="pricing-tier-hint-tag">{{ t('按 30 天平摊', '30-day flat average') }}</span>
                  <span class="pricing-tier-hint-tag">{{ currentTier.daily }}</span>
                  <span class="pricing-tier-hint-tag">{{ currentTier.rate }}</span>
                  <span class="pricing-tier-hint-tag">{{ t('瞬时峰值不单独限流', 'bursts not throttled') }}</span>
                </div>
                <div v-for="row in tierDetailRows.after" :key="row.k">
                  <dt>{{ row.k }}</dt>
                  <dd>{{ row.v }}</dd>
                </div>
              </dl>
            </div>
          </div>
          <button class="pricing-cta pricing-cta-alt" type="button" @click="openContact">{{ copy.professional.cta }}</button>
        </article>

        <!-- 企业版 -->
        <article class="pricing-card" data-reveal @pointermove="trackPointer" @pointerleave="clearPointer">
          <header class="pricing-card-head">
            <h2 class="pricing-card-name">{{ copy.enterprise.name }}</h2>
            <p class="pricing-card-desc">{{ copy.enterprise.desc }}</p>
          </header>
          <p class="pricing-price">
            <span class="pricing-price-amount pricing-price-amount-sm">{{ copy.custom }}</span>
          </p>
          <p class="pricing-price-sub">{{ copy.customQuote }}</p>
          <ul class="pricing-features">
            <li v-for="f in copy.enterprise.features" :key="f">{{ f }}</li>
          </ul>
          <button class="pricing-cta pricing-cta-alt" type="button" @click="openContact">{{ copy.enterprise.cta }}</button>
        </article>
      </div>
    </section>

    <!-- 计价方式：四个维度 -->
    <section class="pricing-shell pricing-dimensions" aria-labelledby="pricing-dimensions-title">
      <header class="pricing-section-head" data-reveal>
        <p class="pricing-eyebrow">{{ copy.dimensions.kicker }}</p>
        <h2 :id="'pricing-dimensions-title'" class="pricing-section-title">{{ copy.dimensions.title }}</h2>
        <p class="pricing-section-lead">{{ copy.dimensions.lead }}</p>
      </header>
      <div class="pricing-dimension-grid">
        <article
          v-for="item in copy.dimensions.items"
          :key="item.title"
          class="pricing-dimension"
          data-reveal
          @pointermove="trackPointer"
          @pointerleave="clearPointer"
        >
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
          <p class="pricing-dimension-price">{{ item.price }}</p>
        </article>
      </div>
    </section>

    <!-- 方案对比 -->
    <section class="pricing-shell pricing-compare" aria-labelledby="pricing-compare-title">
      <header class="pricing-section-head" data-reveal>
        <p class="pricing-eyebrow">{{ copy.compare.kicker }}</p>
        <h2 :id="'pricing-compare-title'" class="pricing-section-title">{{ copy.compare.title }}</h2>
      </header>
      <div class="pricing-table-wrap" data-reveal>
        <table class="pricing-table">
          <thead>
            <tr>
              <th scope="col">{{ copy.compare.columns.dimension }}</th>
              <th scope="col">{{ copy.compare.columns.community }}</th>
              <th scope="col" class="is-featured">{{ copy.compare.columns.professional }}</th>
              <th scope="col">{{ copy.compare.columns.enterprise }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in copy.compare.rows" :key="row.label">
              <th scope="row">{{ row.label }}</th>
              <td v-for="(v, i) in row.values" :key="i">
                <span class="pricing-cell"
                  :class="{'is-yes': v === true, 'is-no': v === false}">
                  <template v-if="v === true">✓</template>
                  <template v-else-if="v === false">—</template>
                  <template v-else>{{ v }}</template>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 专业服务 -->
    <section class="pricing-shell pricing-services">
      <div class="pricing-services-inner" data-reveal @pointermove="trackPointer" @pointerleave="clearPointer">
        <div>
          <h2 class="pricing-services-title">{{ copy.services.title }}</h2>
          <p class="pricing-services-lead">{{ copy.services.lead }}</p>
        </div>
        <button class="pricing-cta pricing-cta-alt" type="button" @click="openContact">{{ copy.services.cta }}</button>
      </div>
    </section>

    <!-- 收束 CTA：家族化页面结尾（默认 footer 在该页隐藏） -->
    <section class="pricing-closing">
      <div class="pricing-shell pricing-closing-inner" data-reveal>
        <h2 class="pricing-closing-title">{{ copy.closing.title }}</h2>
        <p class="pricing-closing-lead">{{ copy.closing.lead }}</p>
        <div class="pricing-closing-actions">
          <a class="pricing-cta pricing-cta-brand" :href="copy.closing.startHref">{{ copy.closing.start }}</a>
          <button class="pricing-cta pricing-cta-alt" type="button" @click="openContact">{{ copy.closing.contact }}</button>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <Transition name="dc-contact">
        <div v-if="contactOpen" class="dc-contact-mask" @click.self="closeContact">
          <div class="dc-contact-card" role="dialog" aria-modal="true" :aria-label="copy.contact.title">
            <button ref="contactCloseBtn" class="dc-contact-close" type="button" :aria-label="copy.contact.close" @click="closeContact">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
            <p class="dc-contact-title">{{ copy.contact.title }}</p>
            <div class="dc-contact-row">
              <span class="dc-contact-email-text">{{ CONTACT_EMAIL }}</span>
              <button
                class="dc-contact-copy"
                :class="{'is-copied': emailCopied}"
                type="button"
                :title="copy.contact.copy"
                :aria-label="copy.contact.copy"
                @click="copyEmail"
              >
                <svg v-if="!emailCopied" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="9" y="9" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15 5.5V5a2.5 2.5 0 0 0-2.5-2.5h-7A2.5 2.5 0 0 0 3 5v7A2.5 2.5 0 0 0 5.5 14.5H6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                <svg v-else viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
            <a class="pricing-cta pricing-cta-brand dc-contact-mailto" href="mailto:pnokers@icloud.com">{{ copy.contact.open }}</a>
            <p class="dc-contact-hint">{{ copy.contact.hint }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<style scoped>
/* 页面级家族化背景：与看板画廊 demo-gallery-page 同配方（径向光斑 + 顶部渐亮 + 网格纹理） */
.pricing-page {
  position: relative;
  isolation: isolate;
  padding-top: 64px;
  color: var(--vp-c-text-1);
  background:
    radial-gradient(circle at 74% 8%, rgba(58, 192, 226, 0.12), transparent 26%),
    radial-gradient(circle at 12% 36%, rgba(91, 116, 235, 0.09), transparent 28%),
    linear-gradient(180deg, #f6fbfe 0%, var(--vp-c-bg) 42%, #f7fbfd 100%);
}

:global(.dark) .pricing-page {
  background:
    radial-gradient(circle at 74% 8%, rgba(40, 178, 216, 0.14), transparent 28%),
    radial-gradient(circle at 12% 36%, rgba(91, 116, 235, 0.13), transparent 28%),
    linear-gradient(180deg, #08131e 0%, var(--vp-c-bg) 44%, #08141f 100%);
}

.pricing-page::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image:
    linear-gradient(var(--pricing-line, rgba(104, 204, 237, 0.08)) 1px, transparent 1px),
    linear-gradient(90deg, var(--pricing-line, rgba(104, 204, 237, 0.08)) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, #000 0%, rgba(0, 0, 0, 0.82) 56%, transparent 94%);
  pointer-events: none;
}

:global(.dark) .pricing-page::before {
  --pricing-line: rgba(104, 204, 237, 0.08);
}

.pricing-shell {
  position: relative;
  z-index: 1;
  width: min(var(--dc3-container, 1152px), calc(100% - 48px));
  margin-inline: auto;
}

/* ---- 滚动渐入 ---- */
[data-reveal] {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 620ms ease, transform 720ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

[data-reveal].is-revealed {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* ---- Hero：导航下方即进内容，背景纹理填充 ---- */
.pricing-hero {
  padding: clamp(40px, 6vh, 72px) 0 44px;
  text-align: center;
}

.pricing-eyebrow {
  margin: 0 0 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--vp-c-brand-1);
}

.pricing-title {
  margin: 0 auto;
  max-width: 720px;
  font-size: clamp(30px, 5vw, 46px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
}

.pricing-lead {
  margin: 18px auto 0;
  max-width: 640px;
  font-size: 16px;
  line-height: 26px;
  color: var(--vp-c-text-2);
}

/* ---- 方案区 ---- */
.pricing-plans {
  padding-bottom: 16px;
}

.pricing-plans-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 26px;
}

.pricing-toggle-label {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.pricing-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid rgba(148, 216, 246, 0.35);
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 70%, transparent);
}

.pricing-toggle button {
  padding: 6px 18px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: color 200ms ease, background-color 200ms ease, box-shadow 200ms ease;
}

.pricing-toggle button.is-active {
  color: #fff;
  background: linear-gradient(135deg, #1296db, #4b58d2);
  box-shadow: 0 6px 16px rgba(18, 150, 219, 0.35);
}

.pricing-toggle-badge {
  margin-left: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(18, 150, 219, 0.12);
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 700;
}

.dark .pricing-toggle-badge {
  background: rgba(95, 195, 239, 0.14);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: stretch;
}

@media (max-width: 1199.98px) {
  .pricing-grid {
    grid-template-columns: 1fr;
    max-width: 560px;
    margin-inline: auto;
  }
}

/* ---- 卡片：玻璃配方 + demo-card 家族 hover（指针光斑 + 抬升 + 边框提亮） ---- */
.pricing-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 26px 24px 24px;
  border: 1px solid rgba(148, 216, 246, 0.3);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.82), transparent 38%),
    linear-gradient(135deg, color-mix(in srgb, var(--vp-c-bg-elv) 82%, transparent), rgba(115, 205, 241, 0.12) 58%, rgba(75, 88, 210, 0.08));
  box-shadow:
    0 18px 46px rgba(12, 89, 153, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    inset 0 -10px 24px rgba(55, 131, 203, 0.05);
  transition: transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1), border-color 240ms ease, box-shadow 260ms ease;
}

.pricing-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(280px circle at var(--mx, 50%) var(--my, 20%), rgba(18, 150, 219, 0.13), transparent 72%);
  opacity: 0;
  transition: opacity 240ms ease;
  pointer-events: none;
}

.pricing-card:hover {
  transform: translateY(-6px);
  border-color: rgba(18, 150, 219, 0.55);
  box-shadow:
    0 24px 58px rgba(12, 89, 153, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.pricing-card:hover::after {
  opacity: 1;
}

@media (hover: none) {
  .pricing-card:hover {
    transform: none;
  }
}

.dark .pricing-card {
  border-color: rgba(139, 210, 250, 0.18);
  background:
    radial-gradient(circle at 18% 0%, rgba(210, 247, 255, 0.13), transparent 38%),
    linear-gradient(135deg, rgba(29, 61, 84, 0.82), rgba(15, 31, 46, 0.9) 58%, rgba(48, 48, 111, 0.72));
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(231, 251, 255, 0.11),
    inset 0 -10px 24px rgba(0, 0, 0, 0.14);
}

.dark .pricing-card:hover {
  border-color: rgba(95, 195, 239, 0.5);
  box-shadow:
    0 24px 58px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(231, 251, 255, 0.14);
}

.pricing-card-featured {
  border-color: rgba(18, 150, 219, 0.55);
  box-shadow:
    0 22px 54px rgba(12, 89, 153, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -10px 24px rgba(55, 131, 203, 0.07);
}

.dark .pricing-card-featured {
  border-color: rgba(95, 195, 239, 0.5);
}

.pricing-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  margin: 0;
  padding: 3px 12px;
  border: 1px solid rgba(18, 150, 219, 0.45);
  border-radius: 999px;
  background: linear-gradient(135deg, #1296db, #4b58d2);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  box-shadow: 0 6px 16px rgba(18, 150, 219, 0.35);
}

.pricing-card-head {
  min-height: 76px;
}

.pricing-card-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.pricing-card-desc {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--vp-c-text-2);
}

/* 位号档位选择（专业版卡内） */
.pricing-tiers {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 16px;
}

.pricing-tiers button {
  padding: 7px 2px;
  font-size: 11.5px;
  border: 1px solid rgba(148, 216, 246, 0.4);
  border-radius: 10px;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 65%, transparent);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease, background-color 200ms ease, box-shadow 200ms ease;
}

.pricing-tiers button span {
  display: block;
  font-size: 10px;
  font-weight: 500;
  opacity: 0.72;
}

.pricing-tiers button.is-active {
  border-color: rgba(18, 150, 219, 0.65);
  background: rgba(18, 150, 219, 0.1);
  color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(18, 150, 219, 0.18);
}

.dark .pricing-tiers button.is-active {
  border-color: rgba(95, 195, 239, 0.6);
  background: rgba(95, 195, 239, 0.12);
  color: #5fc3ef;
}

.pricing-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 18px 0 0;
  min-height: 44px;
}

.pricing-price-amount {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
}

.pricing-price-amount-sm {
  font-size: 26px;
}

.pricing-price-unit {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.pricing-price-sub {
  margin: 6px 0 0;
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}

/* 价格切换动效 */
.price-swap-enter-active,
.price-swap-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.price-swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.price-swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .price-swap-enter-active,
  .price-swap-leave-active {
    transition: none;
  }
}

.pricing-features {
  flex: 1;
  margin: 20px 0 22px;
  padding: 0;
  list-style: none;
}

.pricing-features li {
  position: relative;
  padding: 0 0 0 24px;
  margin-bottom: 10px;
  font-size: 13.5px;
  line-height: 21px;
  color: var(--vp-c-text-2);
}

.pricing-features li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 6px;
  width: 12px;
  height: 7px;
  border-left: 2px solid #1296db;
  border-bottom: 2px solid #1296db;
  transform: rotate(-45deg);
}

.dark .pricing-features li::before {
  border-color: #5fc3ef;
}

.pricing-cta {
  position: relative;
  z-index: 1;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
}

.pricing-cta:hover {
  transform: translateY(-1px);
}

.pricing-cta-brand {
  color: #fff;
  background: linear-gradient(135deg, #1296db, #4b58d2);
  box-shadow: 0 10px 24px rgba(18, 150, 219, 0.35);
}

.pricing-cta-brand:hover {
  filter: brightness(1.06);
}

.pricing-cta-alt {
  border: 1px solid rgba(18, 150, 219, 0.4);
  color: var(--dc3-brand-cyan, #1296db);
  background: color-mix(in srgb, var(--vp-c-bg-elv) 70%, transparent);
}

/* 社区版双按钮：GitHub 主操作 + 在线演示次级 */
.pricing-cta-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 10px;
}

.pricing-cta-ghost {
  border: 1px solid rgba(18, 150, 219, 0.45);
  color: var(--dc3-brand-cyan, #1296db);
  background: rgba(18, 150, 219, 0.12);
}

.pricing-cta-ghost:hover {
  border-color: rgba(18, 150, 219, 0.7);
  background: rgba(18, 150, 219, 0.2);
  color: var(--dc3-brand-cyan, #1296db);
}

.dark .pricing-cta-ghost {
  border-color: rgba(95, 195, 239, 0.45);
  color: #5fc3ef;
  background: rgba(95, 195, 239, 0.12);
}

.dark .pricing-cta-ghost:hover {
  border-color: rgba(95, 195, 239, 0.7);
  background: rgba(95, 195, 239, 0.2);
}

.dark .pricing-cta-alt {
  color: #5fc3ef;
  border-color: rgba(95, 195, 239, 0.4);
}

/* ---- 档位明细折叠区 ---- */
.pricing-tier-detail-toggle {
  margin-bottom: 12px;
}

.pricing-tier-detail-toggle button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 14px;
  height: 42px;
  border: 1px solid rgba(18, 150, 219, 0.4);
  border-radius: 10px;
  background: rgba(18, 150, 219, 0.08);
  color: var(--dc3-brand-cyan, #1296db);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 200ms ease, background-color 200ms ease;
}

.pricing-tier-detail-toggle button:hover {
  border-color: rgba(18, 150, 219, 0.7);
  background: rgba(18, 150, 219, 0.14);
}

.dark .pricing-tier-detail-toggle button {
  border-color: rgba(95, 195, 239, 0.4);
  background: rgba(95, 195, 239, 0.1);
  color: #5fc3ef;
}

.dark .pricing-tier-detail-toggle button:hover {
  border-color: rgba(95, 195, 239, 0.7);
  background: rgba(95, 195, 239, 0.16);
}

.pricing-tier-detail-toggle svg {
  width: 12px;
  height: 12px;
  transition: transform 220ms ease;
}

.pricing-tier-detail-toggle svg.open {
  transform: rotate(180deg);
}

.pricing-tier-detail {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.pricing-tier-detail.open {
  grid-template-rows: 1fr;
}

.pricing-tier-detail-inner {
  overflow: hidden;
}

.pricing-tier-detail dl {
  margin: 0 0 14px;
  padding: 10px 14px;
  border: 1px dashed rgba(148, 216, 246, 0.45);
  border-radius: 10px;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 65%, transparent);
}

.pricing-tier-detail dl > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 0;
}

.pricing-tier-detail dt {
  flex-shrink: 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
  line-height: 18px;
}

.pricing-tier-detail dd {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 18px;
  text-align: right;
}

@media (prefers-reduced-motion: reduce) {
  .pricing-tier-detail {
    transition: none;
  }

  .pricing-tier-detail-toggle svg {
    transition: none;
  }
}

/* ---- 档位明细内的日均参考 tag 行（月增数据的补充口径） ---- */
.pricing-tier-hint {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 0 8px;
}

.pricing-tier-hint-tag {
  padding: 2px 10px;
  border: 1px solid rgba(18, 150, 219, 0.22);
  border-radius: 999px;
  background: rgba(18, 150, 219, 0.08);
  color: var(--dc3-brand-cyan, #1296db);
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  white-space: nowrap;
}

.dark .pricing-tier-hint-tag {
  border-color: rgba(95, 195, 239, 0.25);
  background: rgba(95, 195, 239, 0.1);
  color: #5fc3ef;
}

/* ---- 章节头（家族 eyebrow + 标题） ---- */
.pricing-section-head {
  margin: 72px 0 26px;
  text-align: center;
}

.pricing-section-title {
  margin: 0;
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}

.pricing-section-lead {
  margin: 12px auto 0;
  max-width: 620px;
  font-size: 14.5px;
  line-height: 24px;
  color: var(--vp-c-text-2);
}

/* ---- 计价方式四维 ---- */
.pricing-dimensions {
  margin-top: 8px;
}

/* 首卡（位号与历史数据总量）信息量最大，占 1.6 份宽，其余三卡等宽，减少尾部空白 */
.pricing-dimension-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 16px;
}

@media (max-width: 1199.98px) {
  .pricing-dimension-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 两列布局下首卡与末卡整行铺满，中间两卡等宽成行 */
  .pricing-dimension:first-child,
  .pricing-dimension:last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 767.98px) {
  .pricing-dimension-grid {
    grid-template-columns: 1fr;
  }
}

.pricing-dimension {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 22px 20px;
  border: 1px solid rgba(148, 216, 246, 0.3);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.82), transparent 38%),
    linear-gradient(135deg, color-mix(in srgb, var(--vp-c-bg-elv) 82%, transparent), rgba(115, 205, 241, 0.12) 58%, rgba(75, 88, 210, 0.08));
  transition: transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1), border-color 240ms ease, box-shadow 260ms ease;
}

.pricing-dimension::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 20%), rgba(18, 150, 219, 0.11), transparent 72%);
  opacity: 0;
  transition: opacity 240ms ease;
  pointer-events: none;
}

.pricing-dimension:hover {
  transform: translateY(-4px);
  border-color: rgba(18, 150, 219, 0.5);
  box-shadow: 0 18px 44px rgba(12, 89, 153, 0.18);
}

.pricing-dimension:hover::after {
  opacity: 1;
}

.dark .pricing-dimension {
  border-color: rgba(139, 210, 250, 0.18);
  background:
    radial-gradient(circle at 18% 0%, rgba(210, 247, 255, 0.13), transparent 38%),
    linear-gradient(135deg, rgba(29, 61, 84, 0.82), rgba(15, 31, 46, 0.9) 58%, rgba(48, 48, 111, 0.72));
}

.pricing-dimension h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.pricing-dimension p {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 21px;
  color: var(--vp-c-text-2);
}

/* 描述撑满剩余高度，底部价格行跨卡对齐沉底 */
.pricing-dimension > p:not(.pricing-dimension-price) {
  flex: 1 1 auto;
}

.pricing-dimension-price {
  margin-top: auto !important;
  padding-top: 14px;
  border-top: 1px dashed rgba(148, 216, 246, 0.45);
  color: var(--vp-c-brand-1) !important;
  font-size: 12.5px !important;
  font-weight: 600;
}

.dark .pricing-dimension-price {
  color: #5fc3ef !important;
}

/* ---- 对比表 ---- */
.pricing-compare {
  margin-bottom: 8px;
}

.pricing-table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(148, 216, 246, 0.3);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.82), transparent 38%),
    linear-gradient(135deg, color-mix(in srgb, var(--vp-c-bg-elv) 82%, transparent), rgba(115, 205, 241, 0.12) 58%, rgba(75, 88, 210, 0.08));
}

.dark .pricing-table-wrap {
  border-color: rgba(139, 210, 250, 0.18);
  background:
    radial-gradient(circle at 18% 0%, rgba(210, 247, 255, 0.13), transparent 38%),
    linear-gradient(135deg, rgba(29, 61, 84, 0.82), rgba(15, 31, 46, 0.9) 58%, rgba(48, 48, 111, 0.72));
}

.pricing-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 13.5px;
}

.pricing-table th,
.pricing-table td {
  padding: 13px 18px;
  border-bottom: 1px solid rgba(148, 216, 246, 0.18);
  text-align: center;
  color: var(--vp-c-text-2);
}

.pricing-table tbody tr:last-child th,
.pricing-table tbody tr:last-child td {
  border-bottom: 0;
}

.pricing-table thead th {
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 700;
  background: rgba(18, 150, 219, 0.07);
  border-bottom: 1px solid rgba(148, 216, 246, 0.35);
}

.pricing-table thead th.is-featured {
  color: var(--vp-c-brand-1);
}

.dark .pricing-table thead th.is-featured {
  color: #5fc3ef;
}

.pricing-table tbody th {
  text-align: left;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}

.pricing-table tbody tr {
  transition: background-color 180ms ease;
}

.pricing-table tbody tr:hover {
  background: rgba(18, 150, 219, 0.06);
}

.pricing-cell.is-yes {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.dark .pricing-cell.is-yes {
  color: #5fc3ef;
}

.pricing-cell.is-no {
  color: var(--vp-c-text-3);
}

/* ---- 服务条 ---- */
.pricing-services {
  margin-block: 28px 0;
}

.pricing-services-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  padding: 22px 26px;
  border: 1px solid rgba(148, 216, 246, 0.3);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.82), transparent 38%),
    linear-gradient(135deg, color-mix(in srgb, var(--vp-c-bg-elv) 82%, transparent), rgba(115, 205, 241, 0.12) 58%, rgba(75, 88, 210, 0.08));
  transition: transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1), border-color 240ms ease, box-shadow 260ms ease;
}

.pricing-services-inner::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(18, 150, 219, 0.1), transparent 72%);
  opacity: 0;
  transition: opacity 240ms ease;
  pointer-events: none;
}

.pricing-services-inner:hover {
  transform: translateY(-3px);
  border-color: rgba(18, 150, 219, 0.5);
  box-shadow: 0 18px 44px rgba(12, 89, 153, 0.18);
}

.pricing-services-inner:hover::after {
  opacity: 1;
}

.dark .pricing-services-inner {
  border-color: rgba(139, 210, 250, 0.18);
  background:
    radial-gradient(circle at 18% 0%, rgba(210, 247, 255, 0.13), transparent 38%),
    linear-gradient(135deg, rgba(29, 61, 84, 0.82), rgba(15, 31, 46, 0.9) 58%, rgba(48, 48, 111, 0.72));
}

.pricing-services-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.pricing-services-lead {
  margin: 6px 0 0;
  font-size: 13.5px;
  line-height: 21px;
  color: var(--vp-c-text-2);
}

.pricing-services-inner .pricing-cta {
  flex-shrink: 0;
  min-width: 150px;
}

/* ---- 收束 CTA（家族化页面结尾，默认 footer 隐藏） ---- */
.pricing-closing {
  position: relative;
  z-index: 1;
  margin-top: 40px;
  padding: 96px 24px 110px;
  text-align: center;
  background:
    radial-gradient(circle at 50% 0%, rgba(58, 192, 226, 0.12), transparent 46%),
    linear-gradient(180deg, transparent, color-mix(in srgb, var(--vp-c-bg-elv) 55%, transparent));
}

.pricing-closing-inner {
  max-width: 680px;
}

.pricing-closing-title {
  margin: 0;
  font-size: clamp(24px, 3.6vw, 34px);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}

.pricing-closing-lead {
  margin: 16px auto 0;
  max-width: 560px;
  font-size: 14.5px;
  line-height: 24px;
  color: var(--vp-c-text-2);
}

.pricing-closing-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 30px;
}

.pricing-closing-actions .pricing-cta {
  min-width: 168px;
}

/* ---- 联系弹窗（WeChatQRModal 同族玻璃配方） ---- */
:global(body.dc-pricing-contact-open) {
  overflow: hidden;
}

.dc-contact-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 35, 62, 0.4);
  backdrop-filter: blur(10px) saturate(1.2);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
}

.dark .dc-contact-mask {
  background: rgba(4, 12, 24, 0.55);
}

.dc-contact-card {
  position: relative;
  width: min(380px, 100%);
  padding: 26px 24px 22px;
  border: 1px solid rgba(148, 216, 246, 0.4);
  border-radius: var(--dc3-glass-radius);
  /* 高不透明度：弹窗内是关键信息（邮箱地址），清晰优先于通透 */
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.95), transparent 40%),
    linear-gradient(135deg, color-mix(in srgb, var(--vp-c-bg-elv) 96%, transparent), color-mix(in srgb, var(--vp-c-bg) 92%, transparent));
  box-shadow:
    0 18px 46px rgba(12, 89, 153, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px) saturate(1.45);
  -webkit-backdrop-filter: blur(24px) saturate(1.45);
  text-align: center;
}

.dark .dc-contact-card {
  border-color: rgba(139, 210, 250, 0.25);
  background:
    radial-gradient(circle at 18% 0%, rgba(210, 247, 255, 0.16), transparent 40%),
    linear-gradient(135deg, color-mix(in srgb, #1d3d54 94%, transparent), color-mix(in srgb, #0f1f2e 92%, transparent));
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba(231, 251, 255, 0.12);
}

.dc-contact-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  color: var(--vp-c-text-1);
}

/* 邮箱行：地址 + 旁边的一键复制小按钮 */
.dc-contact-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 8px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 85%, transparent);
}

.dc-contact-email-text {
  flex: 1;
  text-align: left;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--vp-c-text-1);
  word-break: break-all;
}

.dc-contact-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid rgba(18, 150, 219, 0.4);
  border-radius: 9px;
  background: rgba(18, 150, 219, 0.08);
  color: var(--dc3-brand-cyan, #1296db);
  cursor: pointer;
  transition: border-color 200ms ease, background-color 200ms ease, color 200ms ease;
}

.dc-contact-copy svg {
  width: 16px;
  height: 16px;
}

.dc-contact-copy:hover {
  border-color: rgba(18, 150, 219, 0.7);
  background: rgba(18, 150, 219, 0.14);
}

.dc-contact-copy.is-copied {
  border-color: rgba(52, 199, 123, 0.55);
  background: rgba(52, 199, 123, 0.12);
  color: #1fa864;
}

.dark .dc-contact-copy {
  border-color: rgba(95, 195, 239, 0.4);
  background: rgba(95, 195, 239, 0.1);
  color: #5fc3ef;
}

.dark .dc-contact-copy:hover {
  border-color: rgba(95, 195, 239, 0.7);
  background: rgba(95, 195, 239, 0.16);
}

.dark .dc-contact-copy.is-copied {
  border-color: rgba(82, 214, 148, 0.55);
  background: rgba(82, 214, 148, 0.14);
  color: #52d694;
}

.dc-contact-mailto {
  margin-top: 12px;
}

.dc-contact-hint {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--vp-c-text-3);
}

.dc-contact-close {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid rgba(148, 216, 246, 0.35);
  border-radius: 50%;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 70%, transparent);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: color 180ms ease, border-color 180ms ease, background-color 180ms ease;
}

.dc-contact-close svg {
  width: 14px;
  height: 14px;
}

.dc-contact-close:hover {
  color: #1296db;
  border-color: rgba(18, 150, 219, 0.45);
  background: rgba(18, 150, 219, 0.09);
}

.dark .dc-contact-close:hover {
  color: #5fc3ef;
  border-color: rgba(95, 195, 239, 0.4);
  background: rgba(95, 195, 239, 0.1);
}

.dc-contact-enter-active .dc-contact-mask {
  animation: dc-contact-scrim 200ms ease both;
}

.dc-contact-enter-active .dc-contact-card {
  animation: dc-contact-pop 220ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.dc-contact-leave-active .dc-contact-mask {
  animation: dc-contact-scrim 160ms ease reverse both;
}

.dc-contact-leave-active .dc-contact-card {
  animation: dc-contact-pop 160ms ease reverse both;
}

@keyframes dc-contact-scrim {
  from {
    background: rgba(15, 35, 62, 0);
    backdrop-filter: blur(0) saturate(1);
    -webkit-backdrop-filter: blur(0) saturate(1);
  }
  to {
    background: rgba(15, 35, 62, 0.4);
    backdrop-filter: blur(10px) saturate(1.2);
    -webkit-backdrop-filter: blur(10px) saturate(1.2);
  }
}

.dark .dc-contact-enter-active .dc-contact-mask,
.dark .dc-contact-leave-active .dc-contact-mask {
  animation-name: dc-contact-scrim-dark;
}

@keyframes dc-contact-scrim-dark {
  from {
    background: rgba(4, 12, 24, 0);
    backdrop-filter: blur(0) saturate(1);
    -webkit-backdrop-filter: blur(0) saturate(1);
  }
  to {
    background: rgba(4, 12, 24, 0.55);
    backdrop-filter: blur(10px) saturate(1.2);
    -webkit-backdrop-filter: blur(10px) saturate(1.2);
  }
}

@keyframes dc-contact-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dc-contact-enter-active .dc-contact-mask,
  .dc-contact-enter-active .dc-contact-card,
  .dc-contact-leave-active .dc-contact-mask,
  .dc-contact-leave-active .dc-contact-card {
    animation: none;
  }
}

/* ---- 移动端 ---- */
@media (max-width: 767.98px) {
  .pricing-page {
    padding-top: 56px;
  }

  .pricing-shell {
    width: calc(100% - 40px);
  }

  .pricing-hero {
    padding-top: 24px;
  }

  .pricing-table th,
  .pricing-table td {
    padding: 11px 12px;
  }
}
</style>
