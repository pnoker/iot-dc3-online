/**
 * 构建后处理：为 cleanUrls 的扁平页面补建目录索引副本。
 *
 * 背景：`cleanUrls: true` 时 VitePress 产出 `zh/pricing.html`；GitHub Pages
 * 只对物理目录 `zh/pricing/index.html` 响应 `/zh/pricing/`，扁平文件仅响应
 * `/zh/pricing.html`。站内导航/sitemap 统一使用目录式 URL，因此每个非目录
 * 页面都补一份 `<dir>/index.html`，保证 clean URL 直接可达（原 .html 保留，
 * 兼容旧链接与 .html 直链）。
 *
 * 在 `vitepress build` 之后、llms-full 提取之前运行，无副作用。
 */
const {copyFileSync, mkdirSync, readdirSync, statSync} = require('node:fs')
const {join, relative, resolve} = require('node:path')

const ROOT = resolve(__dirname, '..')
const DIST = join(ROOT, '.vitepress', 'dist')

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

let created = 0
for (const file of walk(DIST)) {
  if (!file.endsWith('.html') || file.endsWith('index.html')) continue
  const rel = relative(DIST, file)
  // 根级页面（index.html、404.html）没有目录式 URL，跳过
  if (!rel.includes('\\') && !rel.includes('/')) continue
  const dirIndex = join(file, '..', 'index.html')
  const dirName = file.slice(0, -'.html'.length)
  mkdirSync(dirName, {recursive: true})
  copyFileSync(file, join(dirName, 'index.html'))
  created++
}
console.log(`  ✅ directory indexes created for clean URLs: ${created} pages`)
