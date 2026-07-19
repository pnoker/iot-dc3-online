import {existsSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import type {HeadConfig, TransformContext} from 'vitepress'

const SITE_URL = 'https://dc3.site'
const SITE_ROOT = fileURLToPath(new URL('.', import.meta.url))
const SITE_IMAGE = `${SITE_URL}/images/logo.svg`
const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

const LOCALES = {
  zh: {hreflang: 'zh-CN', homeLabel: '首页'},
  en: {hreflang: 'en-US', homeLabel: 'Home'}
} as const

const HOME_DESCRIPTIONS = {
  zh: 'IoT DC3 是一个多协议、云原生、AI 赋能的开源工业物联网平台，提供设备接入、数据采集、边云协同与智能运维能力。',
  en: 'IoT DC3 is a multi-protocol, cloud-native, AI-powered open-source industrial IoT platform for device connectivity, data acquisition, edge-to-cloud delivery, and intelligent operations.'
} as const

const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'IoT DC3',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: SITE_IMAGE
  },
  sameAs: [
    'https://github.com/pnoker/iot-dc3',
    'https://gitee.com/pnoker/iot-dc3',
    'https://x.com/IoTDC3'
  ]
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

function getStructuredData(locale: keyof typeof LOCALES, canonicalUrl: string, title: string, description: string) {
  const graph = [
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
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        name: LOCALES[locale].homeLabel,
        item: canonicalUrl
      }]
    }
  ]

  return JSON.stringify({'@context': 'https://schema.org', '@graph': graph}).replace(/</g, '\\u003c')
}

export function transformHead(context: TransformContext): HeadConfig[] {
  const locale = getLocale(context.pageData.relativePath)
  if (context.pageData.isNotFound || !locale) {
    return [['meta', {name: 'robots', content: 'noindex,follow'}]]
  }

  const title = getTitle(context)
  const description = getDescription(context, locale)
  const canonicalUrl = getUrl(getRoutePath(context.pageData.relativePath))
  const availableLocales = getAvailableLocales(context.pageData.relativePath)
  const alternateLocales = availableLocales.filter(alternateLocale => alternateLocale !== locale)

  return [
    ['meta', {name: 'description', content: description}],
    ['meta', {name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'}],
    ['meta', {name: 'author', content: 'IoT DC3 Contributors'}],
    ['link', {rel: 'canonical', href: canonicalUrl}],
    ['link', {rel: 'alternate', type: 'text/plain', href: `${SITE_URL}/llms.txt`, title: 'AI-readable site summary'}],
    ...availableLocales.map(alternateLocale => ['link', {
      rel: 'alternate',
      hreflang: LOCALES[alternateLocale].hreflang,
      href: getUrl(getRoutePath(`${alternateLocale}/index.md`))
    }] as HeadConfig),
    ['link', {rel: 'alternate', hreflang: 'x-default', href: getUrl('/zh/')}],
    ['meta', {property: 'og:type', content: 'website'}],
    ['meta', {property: 'og:site_name', content: 'IoT DC3'}],
    ['meta', {property: 'og:title', content: title}],
    ['meta', {property: 'og:description', content: description}],
    ['meta', {property: 'og:url', content: canonicalUrl}],
    ['meta', {property: 'og:image', content: SITE_IMAGE}],
    ['meta', {property: 'og:locale', content: LOCALES[locale].hreflang.replace('-', '_')}],
    ...alternateLocales.map(alternateLocale => ['meta', {
      property: 'og:locale:alternate',
      content: LOCALES[alternateLocale].hreflang.replace('-', '_')
    }] as HeadConfig),
    ['meta', {name: 'twitter:card', content: 'summary_large_image'}],
    ['meta', {name: 'twitter:title', content: title}],
    ['meta', {name: 'twitter:description', content: description}],
    ['meta', {name: 'twitter:image', content: SITE_IMAGE}],
    ['script', {type: 'application/ld+json'}, getStructuredData(locale, canonicalUrl, title, description)]
  ]
}
