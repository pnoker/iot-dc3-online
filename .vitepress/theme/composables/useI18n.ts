import {computed} from 'vue'
import {useData} from 'vitepress'

/**
 * 组件级 i18n:基于 page.relativePath 判定 zh/en(与现有 CardNav.vue 同构)。
 * - t(zh, enText):短文案 inline 双字面量,开发态对英文站漏译/中文残留告警。
 * - tf(dict, key, vars):长文案/领域文案字典查表 + {var} 插值。
 * 详见 docs/iiot-dashboards/architecture.md §6.1。
 */
export function useI18n() {
  const {page} = useData()
  const en = computed(() => page.value.relativePath.startsWith('en/'))

  const t = (zh: string, enText: string) => {
    if (import.meta.env.DEV && en.value && (!enText || /[一-龥]/.test(enText))) {
      console.warn('[i18n] 疑似漏译/中文残留:', zh)
    }
    return en.value ? enText : zh
  }

  const tf = <K extends string>(
    dict: Record<K, { zh: string; en: string }>,
    key: K,
    vars?: Record<string, unknown>,
  ) => {
    const s = dict[key]?.[en.value ? 'en' : 'zh'] ?? key
    return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : s
  }

  return {en, t, tf}
}
