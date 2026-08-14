// 从 public/images/og-image-{zh,en}.svg 生成 og-image 用的 PNG(og-zh.png / og-en.png)。
// 运行: pnpm gen:og (需本地已安装 playwright chromium)
// PNG 为提交产物;仅当 SVG 变更后需要重新生成本地执行并提交。
import {chromium} from 'playwright'
import {fileURLToPath} from 'node:url'
import {mkdirSync} from 'node:fs'
import {dirname, join} from 'node:path'

const imagesDir = dirname(fileURLToPath(new URL('../public/images/og-image-zh.svg', import.meta.url)))
const targets = [
  {svg: 'og-image-zh.svg', png: 'og-zh.png'},
  {svg: 'og-image-en.svg', png: 'og-en.png'}
]

mkdirSync(imagesDir, {recursive: true})
const browser = await chromium.launch()
const page = await browser.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1})

for (const {svg, png} of targets) {
  await page.goto('file://' + join(imagesDir, svg))
  await page.screenshot({path: join(imagesDir, png), clip: {x: 0, y: 0, width: 1200, height: 630}})
  console.log(`generated ${png}`)
}

await browser.close()
