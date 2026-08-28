import {execSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {defineConfig} from 'vitepress'
import {transformHead} from './seo'

const LANG_DETECT = `(function(){var K='dc3-lang',B='/';var p;try{p=localStorage.getItem(K);}catch(e){}var r=location.pathname;if(r.length&&r[r.length-1]!=='/')r=r+'/';var rel=r.indexOf(B)===0?r.slice(B.length):r;var onEn=rel.indexOf('en/')===0;var onZh=rel.indexOf('zh/')===0;if(!onEn&&!onZh){if(!p){p=/^en/i.test(navigator.language)?'en':'zh';try{localStorage.setItem(K,p);}catch(e){}}location.replace(B+p+'/');}})();`

const WECHAT_ICON = {
  svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.67 4.24c-4.06 0-7.35 2.7-7.35 6.04 0 1.91 1.09 3.62 2.79 4.73l-.72 2.17 2.54-1.27c.86.27 1.78.41 2.74.41.32 0 .64-.02.95-.05a5.82 5.82 0 0 1-.25-1.65c0-3.33 3.16-6.03 7.05-6.03.1 0 .2 0 .3.01-.91-2.52-4.08-4.36-8.05-4.36Zm-2.5 3.2a.88.88 0 1 1 0 1.76.88.88 0 0 1 0-1.76Zm4.92 0a.88.88 0 1 1 0 1.76.88.88 0 0 1 0-1.76Z"/><path d="M21.68 14.62c0-2.75-2.77-4.98-6.18-4.98s-6.18 2.23-6.18 4.98 2.77 4.98 6.18 4.98c.81 0 1.58-.13 2.29-.35l2.13 1.06-.6-1.81c1.43-.92 2.36-2.34 2.36-3.88Zm-8.24-.89a.74.74 0 1 1 0-1.48.74.74 0 0 1 0 1.48Zm4.12 0a.74.74 0 1 1 0-1.48.74.74 0 0 1 0 1.48Z"/></svg>'
}

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
    ['script', {async: 'true', src: 'https://www.googletagmanager.com/gtag/js?id=G-2QGF1Y0WBE'}],
    ['script', {}, `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-2QGF1Y0WBE');`],
    ['script', {}, `var _hmt=_hmt||[];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?32c28f6454ac3d0332773a40a2cc4f84";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s)})();`],
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
        socialLinks: createSocialLinks('查看微信二维码'),
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [],
        darkModeSwitchLabel: 'Appearance',
        darkModeSwitchTitle: 'Switch to dark theme',
        lightModeSwitchTitle: 'Switch to light theme',
        footer: {
          message: 'IoT DC3 · Connect the Physical World to AI',
          copyright: '© 2016–2026'
        },
        socialLinks: createSocialLinks('View WeChat QR code'),
      }
    }
  },

  themeConfig: {
    logo: '/images/logo.svg',
    siteTitle: 'IoT DC3',
  },
})
