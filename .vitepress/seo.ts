import {existsSync, readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import type {HeadConfig, TransformContext} from 'vitepress'

const SITE_URL = 'https://dc3.site'
const SITE_ROOT = fileURLToPath(new URL('.', import.meta.url))
const LOGO_IMAGE = `${SITE_URL}/images/logo.svg`
// OG 图带版本号:微信/X 等平台按整条 URL 缓存卡片图,图片更新后必须换 URL 才会重新抓取(改图时同步 bump)
const OG_IMAGE_VERSION = 'v3'
const OG_IMAGE = {
  zh: `${SITE_URL}/images/og-zh.png?${OG_IMAGE_VERSION}`,
  en: `${SITE_URL}/images/og-en.png?${OG_IMAGE_VERSION}`
} as const
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 630
const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

const LOCALES = {
  zh: {hreflang: 'zh-CN', homeLabel: '首页', breadcrumbDelimiter: ' / '},
  en: {hreflang: 'en-US', homeLabel: 'Home', breadcrumbDelimiter: ' / '}
} as const

const HOME_DESCRIPTIONS = {
  zh: 'IoT DC3 是面向 Physical AI 的开源工业物联网 Runtime：连接物理世界与 AI，将设备、数据、工具与智能体连成一个安全、可控、可追溯的实时闭环。',
  en: 'IoT DC3 is an open-source Industrial IoT Runtime for Physical AI: connect the physical world to AI — devices, data, tools and agents in one safe, controllable, traceable real-time loop.'
} as const

const DEMO_INDEX_TITLES = {
  zh: '工业物联网可视化看板',
  en: 'Industrial IoT Visualization Dashboards'
} as const

const KEYWORDS = {
  zh: 'IoT,物联网,工业物联网,物联网平台,IIoT,DC3,开源,云原生,Spring Cloud,设备接入,多协议,数据采集,边云协同,智能运维,AI,智能体,物理智能,Physical AI,Runtime,MCP,可视化看板',
  en: 'IoT,industrial IoT,IIoT,IoT platform,open source,cloud-native,multi-protocol,device connectivity,data acquisition,edge-to-cloud,smart operations,AI,AI agents,physical AI,runtime,MCP,agent infrastructure,dashboard,DC3'
} as const

const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'IoT DC3',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: LOGO_IMAGE
  },
  sameAs: [
    'https://github.com/pnoker/iot-dc3',
    'https://gitee.com/pnoker/iot-dc3',
    'https://x.com/IoTDC3'
  ]
}

interface FaqEntry {
  question: string
  answer: string
}

function getLocale(relativePath: string): keyof typeof LOCALES | null {
  const locale = relativePath.split('/')[0] as keyof typeof LOCALES
  return locale in LOCALES ? locale : null
}

function getRoutePath(relativePath: string) {
  const route = relativePath
    .replace(/\\/g, '/')
    .replace(/\.md$/, '')
    .replace(/\/index$/, '/')

  return route ? `/${route}` : '/'
}

function getUrl(routePath: string) {
  return new URL(routePath, SITE_URL).href
}

function getAvailableLocales(relativePath: string) {
  const pathWithoutLocale = relativePath.replace(/^(zh|en)\//, '')
  return (Object.keys(LOCALES) as Array<keyof typeof LOCALES>)
    .filter(locale => existsSync(resolve(SITE_ROOT, '..', locale, pathWithoutLocale)))
}

function getTitle(context: TransformContext) {
  return context.pageData.title || context.title || 'IoT DC3'
}

function getDescription(context: TransformContext, locale: keyof typeof LOCALES) {
  const description = context.pageData.frontmatter.description
  return typeof description === 'string' && description.trim()
    ? description.trim()
    : HOME_DESCRIPTIONS[locale]
}

/**
 * 跳转页（frontmatter head 带 http-equiv refresh）不是一份可索引的文档：
 * 不输出 description/OG/JSON-LD，也不生成第二个 canonical，robots 置为 noindex，
 * 让 frontmatter 里那条指向目标的 canonical 成为唯一声明。
 */
function isRedirectPage(context: TransformContext) {
  const head = context.pageData.frontmatter.head
  return Array.isArray(head) && head.some(
    entry => Array.isArray(entry)
      && entry[0] === 'meta'
      && entry[1]?.['http-equiv']?.toLowerCase() === 'refresh'
  )
}

/**
 * 从源 Markdown 提取「常见问题 / FAQ」小节作为 FAQPage 结构化数据。
 * 页面 Markdown 是唯一事实来源，构建期提取，避免维护第二份 FAQ 副本。
 */
function extractFaq(relativePath: string): FaqEntry[] {
  try {
    const source = readFileSync(resolve(SITE_ROOT, '..', relativePath), 'utf8')
    const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
    const lines = body.split(/\r?\n/)
    const start = lines.findIndex(line => /^##\s+(常见问题|FAQ)\s*$/.test(line))
    if (start === -1) return []

    const faq: FaqEntry[] = []
    let question = ''
    const answerLines: string[] = []
    const flush = () => {
      const answer = answerLines.join(' ')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[*_`#>]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      if (question && answer) faq.push({question, answer})
      question = ''
      answerLines.length = 0
    }

    for (let i = start + 1; i < lines.length; i++) {
      const line = lines[i]
      if (/^##\s/.test(line)) break
      if (/^###\s/.test(line)) {
        flush()
        question = line.replace(/^###\s+/, '').trim()
      } else if (question && line.trim() && !/^</.test(line.trim())) {
        answerLines.push(line.trim())
      }
    }
    flush()
    return faq.slice(0, 10)
  } catch {
    return []
  }
}

function isDemoDetail(relativePath: string) {
  return /^(zh|en)\/demo\/[^/]+\.md$/.test(relativePath)
}

function isDemoIndex(relativePath: string) {
  return /^(zh|en)\/demo\/index\.md$/.test(relativePath)
}

function getBreadcrumbItems(locale: keyof typeof LOCALES, canonicalUrl: string, relativePath: string, title: string) {
  const homeUrl = getUrl(`/${locale}/`)
  const demoIndexUrl = getUrl(`/${locale}/demo/`)
  const demoIndexTitle = DEMO_INDEX_TITLES[locale]

  if (isDemoDetail(relativePath)) {
    return [
      {'@type': 'ListItem', position: 1, name: LOCALES[locale].homeLabel, item: homeUrl},
      {'@type': 'ListItem', position: 2, name: demoIndexTitle, item: demoIndexUrl},
      {'@type': 'ListItem', position: 3, name: title, item: canonicalUrl}
    ]
  }
  if (isDemoIndex(relativePath)) {
    return [
      {'@type': 'ListItem', position: 1, name: LOCALES[locale].homeLabel, item: homeUrl},
      {'@type': 'ListItem', position: 2, name: demoIndexTitle, item: canonicalUrl}
    ]
  }
  return [{'@type': 'ListItem', position: 1, name: LOCALES[locale].homeLabel, item: canonicalUrl}]
}

function getStructuredData(
  locale: keyof typeof LOCALES,
  canonicalUrl: string,
  relativePath: string,
  title: string,
  description: string
) {
  const graph: Record<string, unknown>[] = [
    ORGANIZATION,
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE_URL,
      name: 'IoT DC3',
      publisher: {'@id': ORGANIZATION_ID},
      inLanguage: LOCALES[locale].hreflang
    },
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: title,
      description,
      inLanguage: LOCALES[locale].hreflang,
      isPartOf: {'@id': WEBSITE_ID},
      breadcrumb: {'@id': `${canonicalUrl}#breadcrumb`}
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: getBreadcrumbItems(locale, canonicalUrl, relativePath, title)
    }
  ]

  // 首页额外声明软件实体，帮助搜索引擎与 AI 答案引擎理解「IoT DC3 是什么软件」
  if (/^(zh|en)\/index\.md$/.test(relativePath)) {
    graph.push({
      '@type': 'SoftwareApplication',
      name: 'IoT DC3',
      url: SITE_URL,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Linux, Docker, Kubernetes',
      description: HOME_DESCRIPTIONS[locale],
      license: 'https://spdx.org/licenses/AGPL-3.0-only.html',
      offers: {'@type': 'Offer', price: '0', priceCurrency: 'USD'},
      publisher: {'@id': ORGANIZATION_ID},
      sameAs: ORGANIZATION.sameAs
    })
  }

  const faq = extractFaq(relativePath)
  if (faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      url: canonicalUrl,
      inLanguage: LOCALES[locale].hreflang,
      mainEntity: faq.map(({question, answer}) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {'@type': 'Answer', text: answer}
      }))
    })
  }

  return JSON.stringify({'@context': 'https://schema.org', '@graph': graph}).replace(/</g, '\\u003c')
}

export function transformHead(context: TransformContext): HeadConfig[] {
  const locale = getLocale(context.pageData.relativePath)
  if (context.pageData.isNotFound || !locale) {
    return [['meta', {name: 'robots', content: 'noindex,follow'}]]
  }
  if (isRedirectPage(context)) {
    return [['meta', {name: 'robots', content: 'noindex,follow'}]]
  }

  const title = getTitle(context)
  const description = getDescription(context, locale)
  const canonicalUrl = getUrl(getRoutePath(context.pageData.relativePath))
  const availableLocales = getAvailableLocales(context.pageData.relativePath)
  const alternateLocales = availableLocales.filter(alternateLocale => alternateLocale !== locale)
  const pathWithoutLocale = context.pageData.relativePath.replace(/^(zh|en)\//, '')

  return [
    ['meta', {name: 'description', content: description}],
    ['meta', {name: 'keywords', content: KEYWORDS[locale]}],
    ['meta', {name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'}],
    ['meta', {name: 'author', content: 'IoT DC3 Contributors'}],
    ['link', {rel: 'canonical', href: canonicalUrl}],
    ['link', {rel: 'alternate', type: 'text/plain', href: `${SITE_URL}/llms.txt`, title: 'AI-readable site summary'}],
    ['link', {rel: 'alternate', type: 'text/plain', href: `${SITE_URL}/llms-full.txt`, title: 'AI-readable full content'}],
    ...availableLocales.map(alternateLocale => ['link', {
      rel: 'alternate',
      hreflang: LOCALES[alternateLocale].hreflang,
      href: getUrl(getRoutePath(`${alternateLocale}/${pathWithoutLocale}`))
    }] as HeadConfig),
    ['link', {rel: 'alternate', hreflang: 'x-default', href: getUrl('/zh/')}],
    ['meta', {property: 'og:type', content: 'website'}],
    ['meta', {property: 'og:site_name', content: 'IoT DC3'}],
    ['meta', {property: 'og:title', content: title}],
    ['meta', {property: 'og:description', content: description}],
    ['meta', {property: 'og:url', content: canonicalUrl}],
    ['meta', {property: 'og:image', content: OG_IMAGE[locale]}],
    ['meta', {property: 'og:image:width', content: String(OG_IMAGE_WIDTH)}],
    ['meta', {property: 'og:image:height', content: String(OG_IMAGE_HEIGHT)}],
    ['meta', {property: 'og:image:alt', content: `${title} - IoT DC3`}],
    ['meta', {property: 'og:locale', content: LOCALES[locale].hreflang.replace('-', '_')}],
    ...alternateLocales.map(alternateLocale => ['meta', {
      property: 'og:locale:alternate',
      content: LOCALES[alternateLocale].hreflang.replace('-', '_')
    }] as HeadConfig),
    ['meta', {name: 'twitter:card', content: 'summary_large_image'}],
    ['meta', {name: 'twitter:title', content: title}],
    ['meta', {name: 'twitter:description', content: description}],
    ['meta', {name: 'twitter:image', content: OG_IMAGE[locale]}],
    ['script', {type: 'application/ld+json'}, getStructuredData(locale, canonicalUrl, context.pageData.relativePath, title, description)]
  ]
}
