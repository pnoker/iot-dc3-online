<script setup lang="ts">
import {useData} from 'vitepress'
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'

const QR_URL = '/images/wechat-qr.png'

const {lang} = useData()
const isZh = computed(() => (lang.value || '').toLowerCase().startsWith('zh'))

const copy = computed(() => isZh.value
  ? {
    title: '找一位同行者',
    caption: '一个人可以走得快，一群人才能走得远。IoT DC3 开源十年，正在从工业物联网走向 Physical AI——如果你也相信开源、想一起做点事业，扫码加我，聊聊看。'
  }
  : {
    title: 'Let\'s build together',
    caption: 'Alone you go fast; together you go far. IoT DC3 is ten years of open source, now evolving from industrial IoT toward Physical AI. If you believe in open source and want to build something that matters — scan and say hi.'
  })

const open = ref(false)

function onDocClick(event: MouseEvent) {
  const target = (event.target as HTMLElement | null)?.closest?.(`a[href="${QR_URL}"]`)
  if (target) {
    event.preventDefault()
    open.value = true
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

function close() {
  open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dc-wechat-fade">
      <div v-if="open" class="dc-wechat-mask" @click.self="close">
        <div class="dc-wechat-card" role="dialog" aria-modal="true" :aria-label="copy.title">
          <button class="dc-wechat-close" aria-label="Close / 关闭" @click="close">×</button>
          <p class="dc-wechat-title">{{ copy.title }}</p>
          <img class="dc-wechat-qr" :src="QR_URL" alt="IoT DC3 微信二维码" width="220" height="220">
          <p class="dc-wechat-caption">{{ copy.caption }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dc-wechat-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(8, 18, 30, 0.72);
  backdrop-filter: blur(4px);
}

.dc-wechat-card {
  position: relative;
  max-width: 320px;
  padding: 28px 28px 22px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 24px 64px rgba(4, 14, 26, 0.45);
  text-align: center;
}

.dc-wechat-close {
  position: absolute;
  top: 6px;
  right: 10px;
  border: none;
  background: none;
  font-size: 22px;
  line-height: 1;
  color: #9aa7b4;
  cursor: pointer;
}

.dc-wechat-close:hover {
  color: #33475b;
}

.dc-wechat-title {
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 700;
  color: #1f2d3d;
}

.dc-wechat-qr {
  display: block;
  width: 220px;
  height: auto;
  margin: 0 auto;
  border-radius: 8px;
}

.dc-wechat-caption {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.8;
  color: #5a6b7d;
  text-align: left;
}

.dc-wechat-fade-enter-active,
.dc-wechat-fade-leave-active {
  transition: opacity 0.18s ease;
}

.dc-wechat-fade-enter-from,
.dc-wechat-fade-leave-to {
  opacity: 0;
}
</style>
