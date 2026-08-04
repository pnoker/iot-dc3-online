import {ref, onMounted, onBeforeUnmount} from 'vue'

/**
 * 读取 VitePress 暗色态(html.dark)并监听切换。
 * SSR 安全:document / MutationObserver 仅在 onMounted 内访问
 * (VitePress build 期 setup() 在 Node 端同步执行,无 document)。
 * 详见 docs/iiot-dashboards/architecture.md §3.3。
 */
export function useTheme() {
  const isDark = ref(!import.meta.env.SSR && document.documentElement.classList.contains('dark'))
  let mo: MutationObserver | undefined

  onMounted(() => {
    isDark.value = document.documentElement.classList.contains('dark')
    mo = new MutationObserver(() => {
      isDark.value = document.documentElement.classList.contains('dark')
    })
    mo.observe(document.documentElement, {attributes: true, attributeFilter: ['class']})
  })

  onBeforeUnmount(() => mo?.disconnect())

  return {isDark}
}
