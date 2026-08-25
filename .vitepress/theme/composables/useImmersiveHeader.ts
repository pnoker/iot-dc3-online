import {onBeforeUnmount, onMounted} from 'vue'

interface ImmersiveHeaderOptions {
  contentSelector: string
  layoutSelector?: string
}

const headerProperties = [
  '--dc3-nav-progress',
  '--dc3-nav-width',
  '--dc3-nav-height',
  '--dc3-nav-offset',
  '--dc3-nav-padding',
]

export function useImmersiveHeader({
  contentSelector,
  layoutSelector = '.dc3-vision-layout',
}: ImmersiveHeaderOptions) {
  let frame = 0
  let progress = 0
  let targetProgress = 0
  let expandedWidth = 0
  let reducedMotion = false

  function easedProgress(scrollY: number) {
    const raw = Math.min(1, Math.max(0, (scrollY - 4) / 96))
    return raw * raw * (3 - 2 * raw)
  }

  function applyProgress(nextProgress: number) {
    const root = document.documentElement
    root.style.setProperty('--dc3-nav-progress', nextProgress.toFixed(4))

    // 顶部状态由 CSS 使用响应式默认宽度，避免首帧异步内容和滚动条时机造成跳变。
    if (nextProgress < 0.0001) {
      headerProperties.slice(1).forEach((property) => root.style.removeProperty(property))
      return
    }

    const viewportWidth = document.querySelector<HTMLElement>(layoutSelector)?.getBoundingClientRect().width
      || document.documentElement.clientWidth
    const compact = viewportWidth < 768
    const medium = viewportWidth >= 768 && viewportWidth < 1280
    const startGutter = compact ? 24 : medium ? 48 : 64
    const endGutter = compact ? 24 : medium ? 48 : 64
    const responsiveStartWidth = compact || medium
      ? viewportWidth - startGutter
      : Math.min(1360, viewportWidth - startGutter)
    const startWidth = expandedWidth || responsiveStartWidth
    const contentWidth = document.querySelector<HTMLElement>(contentSelector)?.getBoundingClientRect().width
    const endWidth = contentWidth || Math.min(1152, viewportWidth - endGutter)
    const endPadding = compact ? 8 : medium ? 10 : 12

    root.style.setProperty('--dc3-nav-width', `${startWidth + (endWidth - startWidth) * nextProgress}px`)
    root.style.setProperty('--dc3-nav-height', `${64 - 12 * nextProgress}px`)
    root.style.setProperty('--dc3-nav-offset', `${6 * nextProgress}px`)
    root.style.setProperty('--dc3-nav-padding', `${endPadding * nextProgress}px`)
  }

  function animate() {
    const delta = targetProgress - progress
    progress += delta * 0.18

    if (Math.abs(delta) < 0.001) progress = targetProgress
    applyProgress(progress)

    if (progress !== targetProgress) {
      frame = requestAnimationFrame(animate)
    } else {
      frame = 0
      document.documentElement.classList.remove('dc3-nav-animating')
    }
  }

  function syncState() {
    const nextProgress = easedProgress(window.scrollY)
    if (!expandedWidth && progress < 0.0001 && nextProgress > 0) {
      expandedWidth = document.querySelector<HTMLElement>('.VPNavBar > .wrapper > .container')
        ?.getBoundingClientRect().width || 0
    }
    targetProgress = nextProgress

    if (reducedMotion) {
      progress = targetProgress
      applyProgress(progress)
      return
    }

    if (!frame) {
      document.documentElement.classList.add('dc3-nav-animating')
      frame = requestAnimationFrame(animate)
    }
  }

  function syncViewport() {
    expandedWidth = 0
    applyProgress(progress)
    if (progress < 0.0001) {
      expandedWidth = document.querySelector<HTMLElement>('.VPNavBar > .wrapper > .container')
        ?.getBoundingClientRect().width || 0
    }
  }

  onMounted(() => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    progress = easedProgress(window.scrollY)
    targetProgress = progress
    applyProgress(progress)
    if (progress < 0.0001) syncViewport()
    window.addEventListener('scroll', syncState, {passive: true})
    window.addEventListener('resize', syncViewport, {passive: true})
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', syncState)
    window.removeEventListener('resize', syncViewport)
    document.documentElement.classList.remove('dc3-nav-animating')
    headerProperties.forEach((property) => document.documentElement.style.removeProperty(property))
    expandedWidth = 0
  })
}
