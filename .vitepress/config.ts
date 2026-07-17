import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'IoT DC3',
  description: '开源、分布式的物联网(IoT)平台',
  lang: 'zh-CN',
  srcExclude: ['AGENTS.md'],
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'baidu-site-verification', content: 'codeva-sdVaJjqMyt' }],
    ['meta', { name: 'google-site-verification', content: 'usDnZo6QlDGIDaJP9mQPRxoNeOQpwCjiT1gQAjGU_4Q' }],
    ['meta', { name: 'google-adsense-account', content: 'ca-pub-7573143232245283' }],
    ['meta', { name: 'keywords', content: 'iot,IoT,DC3,物联网,开源,分布式,物联网平台,Spring Cloud,工业物联网' }],
    ['script', { async: 'true', src: 'https://www.googletagmanager.com/gtag/js?id=G-0S37KX68Y3' }],
    ['script', {}, `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-0S37KX68Y3');`],
    ['script', {}, `var _hmt=_hmt||[];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?a55f7c2cebfa7386c0067d6539f9f202";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s)})();`],
  ],
})
