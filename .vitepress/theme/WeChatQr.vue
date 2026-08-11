<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const {lang} = useData()
const isEnglish = computed(() => lang.value.startsWith('en'))
const triggerLabel = computed(() => isEnglish.value ? 'Show WeChat QR code' : '显示微信二维码')
const title = computed(() => isEnglish.value ? 'WeChat · pnoker' : '微信 · pnoker')
const hint = computed(() => isEnglish.value ? 'Scan to add me as a contact' : '扫码添加我为好友')
const qrAlt = computed(() => isEnglish.value ? 'pnoker WeChat QR code' : 'pnoker 的微信二维码')
</script>

<template>
  <div class="wechat-contact">
    <button
      class="wechat-trigger"
      type="button"
      :aria-label="triggerLabel"
      aria-describedby="wechat-qr-card"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.67 4.24c-4.06 0-7.35 2.7-7.35 6.04 0 1.91 1.09 3.62 2.79 4.73l-.72 2.17 2.54-1.27c.86.27 1.78.41 2.74.41.32 0 .64-.02.95-.05a5.82 5.82 0 0 1-.25-1.65c0-3.33 3.16-6.03 7.05-6.03.1 0 .2 0 .3.01-.91-2.52-4.08-4.36-8.05-4.36Zm-2.5 3.2a.88.88 0 1 1 0 1.76.88.88 0 0 1 0-1.76Zm4.92 0a.88.88 0 1 1 0 1.76.88.88 0 0 1 0-1.76Z" />
        <path d="M21.68 14.62c0-2.75-2.77-4.98-6.18-4.98s-6.18 2.23-6.18 4.98 2.77 4.98 6.18 4.98c.81 0 1.58-.13 2.29-.35l2.13 1.06-.6-1.81c1.43-.92 2.36-2.34 2.36-3.88Zm-8.24-.89a.74.74 0 1 1 0-1.48.74.74 0 0 1 0 1.48Zm4.12 0a.74.74 0 1 1 0-1.48.74.74 0 0 1 0 1.48Z" />
      </svg>
    </button>

    <div id="wechat-qr-card" class="wechat-card" role="tooltip">
      <div class="wechat-card-heading">
        <span class="wechat-status" aria-hidden="true"></span>
        <div>
          <strong>{{ title }}</strong>
          <span>{{ hint }}</span>
        </div>
      </div>
      <div class="wechat-qr-frame">
        <img src="/images/wechat-qr.png" :alt="qrAlt" width="664" height="664">
      </div>
    </div>
  </div>
</template>

<style scoped>
.wechat-contact {
  --wechat-rgb: 7, 193, 96;
  position: relative;
  display: none;
  flex: none;
  margin-left: 3px;
}

@media (min-width: 1280px) {
  .wechat-contact {
    display: block;
  }
}

.wechat-trigger {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid rgba(var(--wechat-rgb), 0.25);
  border-radius: 50%;
  background:
    radial-gradient(circle at 28% 8%, rgba(255, 255, 255, 0.86), transparent 44%),
    linear-gradient(145deg, rgba(var(--wechat-rgb), 0.2), rgba(var(--wechat-rgb), 0.07));
  box-shadow:
    0 5px 14px rgba(var(--wechat-rgb), 0.13),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -6px 12px rgba(var(--wechat-rgb), 0.05);
  color: rgb(6, 151, 75);
  cursor: default;
  backdrop-filter: blur(12px) saturate(1.25);
  -webkit-backdrop-filter: blur(12px) saturate(1.25);
  transition: color 220ms ease, border-color 220ms ease, transform 220ms ease, box-shadow 220ms ease;
}

.wechat-trigger svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
}

.wechat-trigger:hover,
.wechat-trigger:focus-visible,
.wechat-contact:focus-within .wechat-trigger {
  border-color: rgba(var(--wechat-rgb), 0.52);
  color: rgb(4, 132, 64);
  outline: none;
  transform: translateY(-1px);
  box-shadow:
    0 8px 20px rgba(var(--wechat-rgb), 0.2),
    0 0 0 3px rgba(var(--wechat-rgb), 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.wechat-card {
  position: absolute;
  top: calc(100% + 14px);
  right: -8px;
  z-index: 80;
  width: 224px;
  padding: 13px;
  border: 1px solid rgba(132, 207, 239, 0.42);
  border-radius: 22px;
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.95), transparent 38%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(224, 246, 255, 0.72) 52%, rgba(226, 228, 255, 0.62));
  box-shadow:
    0 22px 55px rgba(8, 64, 111, 0.2),
    0 6px 16px rgba(10, 108, 178, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    inset 0 -12px 28px rgba(42, 125, 195, 0.06);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(-7px) scale(0.97);
  transform-origin: calc(100% - 20px) top;
  backdrop-filter: blur(24px) saturate(1.5);
  -webkit-backdrop-filter: blur(24px) saturate(1.5);
  transition: opacity 180ms ease, visibility 180ms ease, transform 240ms cubic-bezier(.2, .8, .2, 1);
}

.wechat-card::before {
  position: absolute;
  top: -6px;
  right: 16px;
  width: 11px;
  height: 11px;
  border-top: 1px solid rgba(132, 207, 239, 0.42);
  border-left: 1px solid rgba(132, 207, 239, 0.42);
  background: rgba(250, 254, 255, 0.88);
  content: '';
  transform: rotate(45deg);
}

.wechat-card::after {
  position: absolute;
  right: 0;
  bottom: 100%;
  width: 48px;
  height: 15px;
  content: '';
}

.wechat-contact:hover .wechat-card,
.wechat-contact:focus-within .wechat-card {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}

.wechat-card-heading {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 3px 11px;
  color: var(--vp-c-text-1);
}

.wechat-card-heading div {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.wechat-card-heading strong {
  font-size: 13px;
  line-height: 18px;
  font-weight: 680;
  letter-spacing: 0.01em;
}

.wechat-card-heading span:not(.wechat-status) {
  color: var(--vp-c-text-2);
  font-size: 11px;
  line-height: 16px;
}

.wechat-status {
  width: 9px;
  height: 9px;
  flex: none;
  border: 2px solid rgba(255, 255, 255, 0.94);
  border-radius: 50%;
  background: rgb(var(--wechat-rgb));
  box-shadow: 0 0 0 3px rgba(var(--wechat-rgb), 0.12), 0 3px 7px rgba(var(--wechat-rgb), 0.28);
}

.wechat-qr-frame {
  overflow: hidden;
  padding: 6px;
  border: 1px solid rgba(10, 108, 178, 0.11);
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(8, 64, 111, 0.09), inset 0 0 0 1px rgba(255, 255, 255, 0.96);
}

.wechat-qr-frame img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 10px;
}

.dark .wechat-trigger {
  border-color: rgba(var(--wechat-rgb), 0.23);
  background:
    radial-gradient(circle at 28% 8%, rgba(219, 255, 238, 0.16), transparent 44%),
    linear-gradient(145deg, rgba(var(--wechat-rgb), 0.16), rgba(16, 54, 45, 0.22));
  color: rgb(77, 216, 139);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(226, 255, 240, 0.12);
}

.dark .wechat-card {
  border-color: rgba(139, 210, 250, 0.2);
  background:
    radial-gradient(circle at 18% 0%, rgba(210, 247, 255, 0.13), transparent 38%),
    linear-gradient(145deg, rgba(24, 43, 59, 0.92), rgba(17, 31, 45, 0.9) 52%, rgba(32, 33, 76, 0.82));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(231, 251, 255, 0.12);
}

.dark .wechat-card::before {
  border-color: rgba(139, 210, 250, 0.2);
  background: rgba(25, 44, 60, 0.96);
}

@media (prefers-reduced-motion: reduce) {
  .wechat-trigger,
  .wechat-card {
    transition: none;
  }
}
</style>
