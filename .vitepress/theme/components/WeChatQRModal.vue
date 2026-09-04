<script setup lang="ts">
import {useData} from 'vitepress'
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'

const QR_URL = '/images/wechat-qr.png'

const {lang} = useData()
const isZh = computed(() => (lang.value || '').toLowerCase().startsWith('zh'))

const copy = computed(() => isZh.value
  ? {
    title: '找一位同行者',
    closeLabel: '关闭',
    caption: '一个人可以走得快，一群人才能走得远。IoT DC3 开源十年，正在从工业物联网走向 Physical AI——如果你也相信开源、想一起做点事业，扫码加我，聊聊看。'
  }
  : {
    title: 'Let\'s build together',
    closeLabel: 'Close',
    caption: 'Alone you go fast; together you go far. IoT DC3 is ten years of open source, now evolving from industrial IoT toward Physical AI. If you believe in open source and want to build something that matters — scan and say hi.'
  })

const open = ref(false)
const closeBtn = ref<HTMLButtonElement | null>(null)

function onDocClick(event: MouseEvent) {
  const target = (event.target as HTMLElement | null)?.closest?.(`a[href="${QR_URL}"]`)
  if (target) {
    event.preventDefault()
    open.value = true
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
  if (event.key === 'Tab' && open.value) {
    // 弹窗内唯一可聚焦元素是关闭按钮：把焦点留在弹窗内
    event.preventDefault()
    closeBtn.value?.focus()
  }
}

function close() {
  open.value = false
}

watch(open, (value) => {
  document.body.classList.toggle('dc-wechat-open', value)
  if (value) nextTick(() => closeBtn.value?.focus())
})

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
  document.body.classList.remove('dc-wechat-open')
})
</script>

<template>
  <Teleport to="body">
    <!-- 容器不做 opacity 动画：opacity<1 的祖先会抑制遮罩的 backdrop-filter 取景；
         遮罩以 blur 0→10 关键帧与卡片弹出同步渐入（与 book.dc3.site 同款弹窗） -->
    <Transition name="dc-wechat" :duration="240">
      <div v-if="open" class="dc-wechat-mask">
        <div class="dc-wechat-scrim" @click="close"></div>
        <div class="dc-wechat-card" role="dialog" aria-modal="true" :aria-label="copy.title">
          <button ref="closeBtn" class="dc-wechat-close" type="button" :aria-label="copy.closeLabel" @click="close">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <p class="dc-wechat-title">{{ copy.title }}</p>
          <div class="dc-wechat-qr"><img :src="QR_URL" alt="IoT DC3 微信二维码" width="220" height="220"></div>
          <p class="dc-wechat-caption">{{ copy.caption }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
:global(body.dc-wechat-open) {
  overflow: hidden;
}

.dc-wechat-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.dc-wechat-scrim {
  position: absolute;
  inset: 0;
  background: rgba(15, 35, 62, 0.4);
  backdrop-filter: blur(10px) saturate(1.2);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
}

.dark .dc-wechat-scrim {
  background: rgba(4, 12, 24, 0.55);
}

/* 玻璃卡配方与 book.dc3.site 弹窗 / 本站 VPMenu 同族 */
.dc-wechat-card {
  position: relative;
  width: min(360px, 100%);
  padding: 24px 24px 22px;
  border: 1px solid rgba(148, 216, 246, 0.3);
  border-radius: var(--dc3-glass-radius);
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.82), transparent 38%),
    linear-gradient(135deg, color-mix(in srgb, var(--vp-c-bg-elv) 82%, transparent), rgba(115, 205, 241, 0.12) 58%, rgba(75, 88, 210, 0.08));
  box-shadow:
    0 18px 46px rgba(12, 89, 153, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    inset 0 -10px 24px rgba(55, 131, 203, 0.05);
  backdrop-filter: blur(24px) saturate(1.45);
  -webkit-backdrop-filter: blur(24px) saturate(1.45);
  text-align: center;
}

.dark .dc-wechat-card {
  border-color: rgba(139, 210, 250, 0.18);
  background:
    radial-gradient(circle at 18% 0%, rgba(210, 247, 255, 0.13), transparent 38%),
    linear-gradient(135deg, rgba(29, 61, 84, 0.82), rgba(15, 31, 46, 0.9) 58%, rgba(48, 48, 111, 0.72));
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(231, 251, 255, 0.11),
    inset 0 -10px 24px rgba(0, 0, 0, 0.14);
}

.dc-wechat-title {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  color: var(--vp-c-text-1);
}

/* 二维码面板恒为白底，保证明暗主题下都可扫 */
.dc-wechat-qr {
  padding: 12px;
  border-radius: 14px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(18, 150, 219, 0.14);
}

.dc-wechat-qr img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 6px;
}

.dc-wechat-caption {
  margin: 14px 0 0;
  font-size: 12.5px;
  line-height: 20px;
  color: var(--vp-c-text-2);
  text-align: left;
}

.dc-wechat-close {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid rgba(148, 216, 246, 0.35);
  border-radius: 50%;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 70%, transparent);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: color 180ms ease, border-color 180ms ease, background-color 180ms ease;
}

.dc-wechat-close svg {
  width: 14px;
  height: 14px;
}

.dc-wechat-close:hover {
  color: #1296db;
  border-color: rgba(18, 150, 219, 0.45);
  background: rgba(18, 150, 219, 0.09);
}

.dark .dc-wechat-close:hover {
  color: #5fc3ef;
  border-color: rgba(95, 195, 239, 0.4);
  background: rgba(95, 195, 239, 0.1);
}

.dc-wechat-enter-active .dc-wechat-scrim {
  animation: dc-wechat-scrim 200ms ease both;
}

.dc-wechat-enter-active .dc-wechat-card {
  animation: dc-wechat-pop 220ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.dc-wechat-leave-active .dc-wechat-scrim {
  animation: dc-wechat-scrim 160ms ease reverse both;
}

.dc-wechat-leave-active .dc-wechat-card {
  animation: dc-wechat-pop 160ms ease reverse both;
}

@keyframes dc-wechat-scrim {
  from {
    background: rgba(15, 35, 62, 0);
    backdrop-filter: blur(0) saturate(1);
    -webkit-backdrop-filter: blur(0) saturate(1);
  }
  to {
    background: rgba(15, 35, 62, 0.4);
    backdrop-filter: blur(10px) saturate(1.2);
    -webkit-backdrop-filter: blur(10px) saturate(1.2);
  }
}

.dark .dc-wechat-enter-active .dc-wechat-scrim,
.dark .dc-wechat-leave-active .dc-wechat-scrim {
  animation-name: dc-wechat-scrim-dark;
}

@keyframes dc-wechat-scrim-dark {
  from {
    background: rgba(4, 12, 24, 0);
    backdrop-filter: blur(0) saturate(1);
    -webkit-backdrop-filter: blur(0) saturate(1);
  }
  to {
    background: rgba(4, 12, 24, 0.55);
    backdrop-filter: blur(10px) saturate(1.2);
    -webkit-backdrop-filter: blur(10px) saturate(1.2);
  }
}

@keyframes dc-wechat-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dc-wechat-enter-active .dc-wechat-scrim,
  .dc-wechat-enter-active .dc-wechat-card,
  .dc-wechat-leave-active .dc-wechat-scrim,
  .dc-wechat-leave-active .dc-wechat-card {
    animation: none;
  }
}
</style>
