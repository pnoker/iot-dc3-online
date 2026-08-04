import {ref, onMounted, onBeforeUnmount, inject, watchEffect, type Ref} from 'vue'

/**
 * 五因子领域化数据生成器(逼真 mock 的核心)。
 * value(t) = baseline + trend + cycle + noise + events + integrate(coupling)
 * 解决三个"一眼假"缺陷:
 *  ① cycle 支持乘性 / shape(光伏钟形可过零),非纯加性;
 *  ② events step 持续阶跃(到 duration 止)+ rate 泊松可复现,非 1 秒毛刺;
 *  ③ integrate 维护内部状态(SOC/管存等积分量),coupling 可闭环。
 * SSR 安全 + 后台/全局暂停。可种子 PRNG + 高斯噪声(视觉回归可复现)。
 * 详见 docs/iiot-dashboards/quality.md §1.3。
 */
export type CycleMode = 'additive' | 'multiplicative' | 'shape'

export interface FactorSpec {
  baseline: number
  trend?: (t: number) => number
  cycle?: (t: number) => number // 归一化 -1..1
  cycleMode?: CycleMode // 默认 multiplicative;可过零领域用 shape
  cycleAmp?: number // 乘性幅度(默认 0.25)
  shape?: (hour: number) => number // shape 模式:如光伏日照钟形(夜间 0)
  noiseAmp?: number // 高斯噪声 σ
  events?: { at?: number; rate?: number; type: 'step' | 'spike'; size: number; duration?: number }[]
  integrate?: (state: number, v: number, dt: number) => { value: number; state: number }
  unit: string
}

function mulberry32(s: number) {
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let r = Math.imul(s ^ (s >>> 15), 1 | s)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
function gauss(rng: () => number, amp: number) {
  const u = Math.max(rng(), 1e-9)
  const v = rng()
  return amp * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function useDomainSeries(
  spec: FactorSpec,
  opts: { intervalMs?: number; window?: number; seed?: number } = {},
) {
  const {intervalMs = 1000, window = 120, seed = 42} = opts
  const rng = mulberry32(seed)
  const series = ref<[number, number][]>([])
  const current = ref(spec.baseline)
  let integState = spec.baseline
  let t = 0
  const ev = (spec.events ?? []).map((e) => ({
    ...e,
    active: false,
    nextAt: e.at ?? (e.rate ? -Math.log(Math.max(rng(), 1e-9)) / e.rate : 0),
  }))
  const paused = inject<Ref<boolean>>('dc3d-paused', ref(false))

  const tick = () => {
    t += intervalMs / 1000
    const hour = (t / 3600) % 24 // UTC+8 本地小时(architecture §6.4)
    let v = spec.baseline
    if (spec.shape) {
      v = spec.shape(hour) // 如光伏钟形:夜间 0(shape 直接决定值)
    } else if (spec.cycle) {
      const amp = spec.cycleAmp ?? 0.25
      // additive:baseline + 幅度振荡;multiplicative:baseline 上下浮动(不叠加基线)
      v =
        (spec.cycleMode ?? 'multiplicative') === 'additive'
          ? spec.baseline + spec.cycle(t) * spec.baseline * amp
          : spec.baseline * (1 + spec.cycle(t) * amp)
    }
    if (spec.trend) v += spec.trend(t) // trend 在 cycle 之后叠加(累计量单调增)
    if (spec.noiseAmp) v += gauss(rng, spec.noiseAmp)
    for (const e of ev) {
      if (e.rate && t >= e.nextAt) {
        e.active = true
        e.nextAt = t + -Math.log(Math.max(rng(), 1e-9)) / e.rate
      } else if (e.at !== undefined && t >= e.at) {
        e.active = true
      }
      if (e.active) {
        v += e.size
        if (e.type === 'spike') e.active = false
        else if (e.duration && t >= (e.at ?? 0) + e.duration) e.active = false
      }
    }
    v = Math.max(0, v)
    if (spec.integrate) {
      const r = spec.integrate(integState, v, intervalMs / 1000)
      integState = r.state
      v = r.value
    }
    current.value = +v.toFixed(2)
    series.value.push([t, current.value])
    if (series.value.length > window) series.value.shift()
  }

  let timer: ReturnType<typeof setInterval> | undefined
  const start = () => {
    if (timer === undefined) timer = setInterval(tick, intervalMs)
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

  return {series, current}
}
