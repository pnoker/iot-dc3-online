import {ref, onMounted, onBeforeUnmount, inject, watchEffect, type Ref} from 'vue'

/**
 * 简单实时序列(平滑随机游走),用于无周期需求的轻量场景与跑通链路。
 * - SSR 安全:setInterval 在 onMounted 内起、onBeforeUnmount 清。
 * - 后台暂停:visibilitychange 隐藏即停(参照 CardNav.vue)。
 * - 全局暂停:inject DashboardShell 提供的 dc3d-paused。
 * 真正"逼真"的领域数据用 useDomainSeries(五因子)。
 * 详见 docs/iiot-dashboards/architecture.md §5.2。
 */
export function useRealtimeData(
  base: number,
  opts: { volatility?: number; interval?: number; window?: number } = {},
) {
  const {volatility = 0.02, interval = 1500, window = 60} = opts
  const series = ref<number[]>(Array.from({length: window}, () => base))
  let cur = base
  let timer: ReturnType<typeof setInterval> | undefined
  const paused = inject<Ref<boolean>>('dc3d-paused', ref(false))

  const tick = () => {
    cur = Math.max(0, cur * (1 + (Math.random() - 0.5) * 2 * volatility))
    series.value.push(+cur.toFixed(2))
    if (series.value.length > window) series.value.shift()
  }
  const start = () => {
    if (timer === undefined) timer = setInterval(tick, interval)
  }
  const stop = () => {
    if (timer !== undefined) {
      clearInterval(timer)
      timer = undefined
    }
  }

  onMounted(() => {
    start()
    const onVis = () => (document.hidden ? stop() : paused.value ? null : start())
    document.addEventListener('visibilitychange', onVis)
    watchEffect(() => (paused.value || document.hidden ? stop() : start()))
    onBeforeUnmount(() => {
      stop()
      document.removeEventListener('visibilitychange', onVis)
    })
  })

  return {series, current: () => cur}
}
