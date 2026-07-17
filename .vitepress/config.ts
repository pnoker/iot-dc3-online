import {defineConfig} from 'vitepress'

const LANG_DETECT = `(function(){var K='dc3-lang',B='/';var p;try{p=localStorage.getItem(K);}catch(e){}var r=location.pathname;if(r.length&&r[r.length-1]!=='/')r=r+'/';var rel=r.indexOf(B)===0?r.slice(B.length):r;var onEn=rel.indexOf('en/')===0;var onZh=rel.indexOf('zh/')===0;if(!onEn&&!onZh){if(!p){p=/^en/i.test(navigator.language)?'en':'zh';try{localStorage.setItem(K,p);}catch(e){}}location.replace(B+p+'/');}})();`

export default defineConfig({
  base: '/',
  lang: 'zh-CN',
  title: 'IoT DC3',
  cleanUrls: true,

  srcExclude: ['AGENTS.md'],

  head: [
    ['link', {rel: 'icon', href: '/favicon.ico'}],
    ['link', {rel: 'icon', type: 'image/svg+xml', href: '/images/logo.svg'}],
    ['meta', {name: 'theme-color', content: '#1296db'}],
    ['meta', {name: 'baidu-site-verification', content: 'codeva-sdVaJjqMyt'}],
    ['meta', {name: 'google-site-verification', content: 'usDnZo6QlDGIDaJP9mQPRxoNeOQpwCjiT1gQAjGU_4Q'}],
    ['meta', {name: 'google-adsense-account', content: 'ca-pub-7573143232245283'}],
    ['script', {async: 'true', src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7573143232245283', crossorigin: 'anonymous'}],
    ['meta', {name: 'keywords', content: 'iot,IoT,DC3,物联网,开源,分布式,物联网平台,Spring Cloud,工业物联网'}],
    ['script', {async: 'true', src: 'https://www.googletagmanager.com/gtag/js?id=G-0S37KX68Y3'}],
    ['script', {}, `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-0S37KX68Y3');`],
    ['script', {}, `var _hmt=_hmt||[];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?a55f7c2cebfa7386c0067d6539f9f202";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s)})();`],
    ['script', {}, LANG_DETECT],
  ],

  locales: {
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        footer: {message: 'Copyright © 2016 ～ 2026 张红元'},
        socialLinks: [
          {icon: 'github', link: 'https://github.com/pnoker/iot-dc3'},
          {icon: 'gitee', link: 'https://gitee.com/pnoker/iot-dc3'},
          {icon: 'x', link: 'https://x.com/IoTDC3'},
        ],
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        footer: {message: 'Copyright © 2016 ~ 2026 Henry'},
        socialLinks: [
          {icon: 'github', link: 'https://github.com/pnoker/iot-dc3'},
          {icon: 'gitee', link: 'https://gitee.com/pnoker/iot-dc3'},
          {icon: 'x', link: 'https://x.com/IoTDC3'},
        ],
      }
    }
  },

  themeConfig: {
    logo: '/images/logo.svg',
    siteTitle: 'IoT DC3',
  },
})
