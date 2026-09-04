import {execSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {defineConfig} from 'vitepress'
import {transformHead} from './seo'

const LANG_DETECT = `(function(){var K='dc3-lang',B='/';var p;try{p=localStorage.getItem(K);}catch(e){}var r=location.pathname;if(r.length&&r[r.length-1]!=='/')r=r+'/';var rel=r.indexOf(B)===0?r.slice(B.length):r;var onEn=rel.indexOf('en/')===0;var onZh=rel.indexOf('zh/')===0;if(!onEn&&!onZh){if(!p){p=/^en/i.test(navigator.language)?'en':'zh';try{localStorage.setItem(K,p);}catch(e){}}location.replace(B+p+'/');}})();`

// 微信公众号：官方双气泡标识（simple-icons），与 book.dc3.site 同一图形源；
// fill=currentColor 跟随圆钮的微信品牌绿（style.css 按 href$=/images/wechat-qr.png 着色）
const WECHAT_ICON = {
  svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>'
}

// 与 book.dc3.site 同源的导航品牌标题：主标题 + 星芒 + AGENTIC 徽标，副行 slogan。
// VitePress 用 v-html 渲染 siteTitle；.dc3-brand-a11y 为读屏完整文案。
const BRAND_SPARK = '<svg class="dc3-brand-spark" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M6 .8c.35 3.05 2.15 4.85 5.2 5.2C8.15 6.35 6.35 8.15 6 11.2 5.65 8.15 3.85 6.35.8 6 3.85 5.65 5.65 3.85 6 .8Z"/></svg>'

const navSiteTitle = ({title, signal, accessible}: {
  title: string
  signal: string
  accessible: string
}) => `<span class="dc3-brand-copy" aria-hidden="true"><span class="dc3-brand-title"><strong>${title}</strong>${BRAND_SPARK}<span class="dc3-brand-agentic">AGENTIC</span></span><span class="dc3-brand-signal">${signal}</span></span><span class="dc3-brand-a11y">${accessible}</span>`

const NAV_SITE_TITLE_ZH = navSiteTitle({
  title: 'IoT DC3',
  signal: '感知、推理、行动、进化',
  accessible: 'IoT DC3，AGENTIC：感知、推理、行动、进化',
})

const NAV_SITE_TITLE_EN = navSiteTitle({
  title: 'IoT DC3',
  signal: 'Sense · Reason · Act · Evolve',
  accessible: 'IoT DC3, AGENTIC: Sense, Reason, Act, Evolve',
})

const createSocialLinks = (wechatLabel: string) => [
  {icon: 'github', link: 'https://github.com/pnoker/iot-dc3', ariaLabel: 'GitHub'},
  {icon: 'gitee', link: 'https://gitee.com/pnoker/iot-dc3', ariaLabel: 'Gitee'},
  {icon: 'x', link: 'https://x.com/IoTDC3', ariaLabel: 'X'},
  {icon: WECHAT_ICON, link: '/images/wechat-qr.png', ariaLabel: wechatLabel},
]

const lastmodCache = new Map<string, string | undefined>()

// sitemap 的 lastmod 取源文件最后一次实质提交日期，取不到则省略该字段
function gitLastmod(url: string): string | undefined {
  if (lastmodCache.has(url)) return lastmodCache.get(url)
  let result: string | undefined
  try {
    const path = url.replace(/^\/+/, '')
    const sourceFile = !/^(zh|en)\//.test(path)
      ? 'index.md'
      : path.endsWith('/') ? `${path}index.md` : `${path}.md`
    const date = execSync(`git log -1 --format=%cs -- "${sourceFile}"`, {
      encoding: 'utf8',
      cwd: fileURLToPath(new URL('..', import.meta.url))
    }).trim()
    result = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined
  } catch {
    result = undefined
  }
  lastmodCache.set(url, result)
  return result
}

export default defineConfig({
  base: '/',
  lang: 'zh-CN',
  title: 'IoT DC3',
  description: 'IoT DC3 is a multi-protocol, cloud-native, AI-powered, open-source industrial IoT platform evolving toward AI agents.',
  cleanUrls: true,
  sitemap: {
    hostname: 'https://dc3.site',
    transformItems: items => items
      .map(item => {
        // VitePress 内部 url 无前导斜杠（'zh/demo/cold-chain'，根为 ''）
        const path = item.url.startsWith('/') ? item.url : `/${item.url}`
        // links 里指向根路径 '' 的是默认 locale（noindex 的语言跳转页），剔除
        const links = item.links?.filter(link => link.url !== '' && link.url !== '/')
        return {
          ...item,
          ...(links ? {links} : {}),
          lastmod: gitLastmod(item.url)
        }
      })
      // 根路径与 vision 页均为 noindex 跳转页，不应出现在 sitemap
      .filter(item => {
        const path = item.url.startsWith('/') ? item.url : `/${item.url}`
        return path !== '/' && !/^\/(zh|en)\/vision$/.test(path)
      })
  },

  srcExclude: ['AGENTS.md'],

  head: [
    ['link', {rel: 'icon', type: 'image/svg+xml', href: '/images/logo.svg'}],
    ['meta', {name: 'theme-color', content: '#1296db'}],
    ['meta', {name: 'baidu-site-verification', content: 'codeva-sdVaJjqMyt'}],
    ['meta', {name: 'google-site-verification', content: 'usDnZo6QlDGIDaJP9mQPRxoNeOQpwCjiT1gQAjGU_4Q'}],
    ['meta', {name: 'google-adsense-account', content: 'ca-pub-7573143232245283'}],
    ['script', {async: 'true', src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7573143232245283', crossorigin: 'anonymous'}],
    ['script', {async: 'true', src: 'https://www.googletagmanager.com/gtag/js?id=G-2QGF1Y0WBE'}],
    ['script', {}, `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-2QGF1Y0WBE');`],
    ['script', {}, `if(!/^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname)){var _hmt=_hmt||[];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?32c28f6454ac3d0332773a40a2cc4f84";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s)})();}`],
    ['script', {}, LANG_DETECT],
  ],

  transformHead,

  locales: {
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [],
        darkModeSwitchLabel: '外观',
        darkModeSwitchTitle: '切换到深色模式',
        lightModeSwitchTitle: '切换到浅色模式',
        footer: {
          message: 'IoT DC3 · 连接物理世界与 AI',
          copyright: '© 2016–2026'
        },
        socialLinks: createSocialLinks('微信公众号'),
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [],
        siteTitle: NAV_SITE_TITLE_EN,
        darkModeSwitchLabel: 'Appearance',
        darkModeSwitchTitle: 'Switch to dark theme',
        lightModeSwitchTitle: 'Switch to light theme',
        footer: {
          message: 'IoT DC3 · Connect the Physical World to AI',
          copyright: '© 2016–2026'
        },
        socialLinks: createSocialLinks('WeChat Official Account'),
      }
    }
  },

  themeConfig: {
    logo: '/images/logo.svg',
    // zh locale 继承此配置；en 在自己的 themeConfig 里覆盖
    siteTitle: NAV_SITE_TITLE_ZH,
  },
})
