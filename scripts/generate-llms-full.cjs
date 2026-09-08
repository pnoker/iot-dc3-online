#!/usr/bin/env node
/**
 * 生成 llms-full.txt —— llms.txt 的全量正文版，供 LLM 深度索引（AEO）。
 * 在 `vitepress build` 之后运行：遍历 dist 中的 SSR HTML，逐页提取「标题 + 渲染正文」。
 *
 * 为什么从构建产物 HTML 提取而不是源 Markdown：
 * 1. 搜索引擎与答案引擎消费的是渲染后的页面；首页/画廊的正文都在 Vue 组件里，
 *    读源 md 会拿到空的 <VisionPage /> 占位，读渲染产物才能覆盖全部真实文本。
 * 2. 顺带剥离所有组件标签与 HTML 噪音，输出即所见文本。
 */
const {readFileSync, writeFileSync, readdirSync, statSync, mkdirSync} = require('node:fs')
const {join, relative, dirname, resolve} = require('node:path')

const SITE_URL = 'https://dc3.site'
const ROOT = resolve(__dirname, '..')
const DIST = join(ROOT, '.vitepress/dist')
const OUT = join(DIST, 'llms-full.txt')

// VitePress 站点壳的纯 UI 文案，单独成行时对 LLM 无意义，剔除
const UI_NOISE_LINES = new Set([
  '简体中文', 'English', '外观', 'Appearance',
  '切换到深色模式', '切换到浅色模式',
  'Switch to dark theme', 'Switch to light theme',
  'Skip to content', '跳到主要内容',
  'Skip to content Return to top', '跳到主要内容 返回顶部',
  'Return to top', '返回顶部',
  '© 2016–2026',
  'IoT DC3 · 连接物理世界与 AI', 'IoT DC3 · Connect the Physical World to AI'
])

function walkHtml(dir, out = []) {
  let entries = []
  try { entries = readdirSync(dir) } catch { return out }
  entries.sort()
  for (const name of entries) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walkHtml(full, out)
    else if (name.endsWith('.html')) out.push(full)
  }
  return out
}

function urlOf(htmlPath) {
  const rel = relative(DIST, htmlPath).replace(/\\/g, '/')
  if (rel === 'index.html') return `${SITE_URL}/`
  if (rel.endsWith('/index.html')) return `${SITE_URL}/${rel.slice(0, -'index.html'.length)}`
  return `${SITE_URL}/${rel.replace(/\.html$/, '')}`
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&copy;/g, '©')
}

function extractText(html) {
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1].trim() || 'Untitled'
  let body = html.slice(html.indexOf('</head>') + 7)
    // 站点壳：导航、侧边栏、页脚、脚本样式与图标对 LLM 是噪音
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<header[\s\S]*?<\/header>/g, ' ')
    .replace(/<aside[\s\S]*?<\/aside>/g, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')

  const lines = body
    .split('\n')
    .map(line => decodeEntities(line).replace(/\s+/g, ' ').trim())
    .filter(line => line && !UI_NOISE_LINES.has(line))
  return {title, body: lines.join('\n')}
}

const files = walkHtml(DIST)
  // 根路径与 404 是 noindex 的语言跳转/错误页，不进入 AI 语料；
  // clean-urls 目录索引副本（ensure-clean-url-indexes 生成）与扁平 .html 页面重复，跳过
  .filter(file => {
    const rel = relative(DIST, file).replace(/\\/g, '/')
    if (rel === 'index.html' || rel === '404.html') return false
    if (rel.endsWith('/index.html')) return false
    return true
  })
  // 中文页在前，与 llms.txt 的阅读顺序一致
  .sort((a, b) => {
    const relA = relative(DIST, a).replace(/\\/g, '/')
    const relB = relative(DIST, b).replace(/\\/g, '/')
    const ordA = relA.startsWith('zh') ? 0 : 1
    const ordB = relB.startsWith('zh') ? 0 : 1
    return ordA - ordB || relA.localeCompare(relB)
  })

const parts = []
for (const file of files) {
  const {title, body} = extractText(readFileSync(file, 'utf8'))
  parts.push(`# ${title}\n\nURL: ${urlOf(file)}\n\n${body}\n\n---\n`)
}

mkdirSync(dirname(OUT), {recursive: true})
writeFileSync(OUT, parts.join('\n'), 'utf8')
console.log(`  ✅ llms-full.txt generated: ${files.length} pages (from SSR HTML) → ${OUT}`)
