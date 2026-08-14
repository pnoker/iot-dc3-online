<script setup lang="ts">
import {DOMAINS} from '../../mock/registry'
import {useI18n} from '../../composables/useI18n'

const {en, t} = useI18n()

const vizLabel = (k: string) =>
  ({
    matrix: t('矩阵', 'Matrix'),
    map: t('地图', 'Map'),
    topology: t('拓扑', 'Topology'),
    profile: t('剖面', 'Profile'),
    gauge: t('仪表', 'Gauge'),
    '3d': '3D',
  }[k] ?? k)

const demoUrl = (id: string) => (en.value ? '/en/demo/' : '/zh/demo/') + id
</script>

<template>
  <div class="gallery">
    <div class="g-grid">
      <a
        v-for="d in DOMAINS"
        :key="d.id"
        class="g-card dc3d-glass"
        :style="{'--accent': d.accent}"
        :href="demoUrl(d.id)"
        :aria-label="en ? d.name_en : d.name_zh"
      >
        <div
          class="g-cover"
          :style="{background: 'radial-gradient(120% 120% at 20% 10%, ' + d.accent + '33, transparent 60%)'}"
        >
          <span class="g-icon">{{ d.icon }}</span>
          <span class="g-dot" />
        </div>
        <div class="g-body">
          <h3>
            {{ en ? d.name_en : d.name_zh }}<small v-if="en">{{ d.name_zh }}</small>
          </h3>
          <p class="g-tag">{{ en ? d.tagline_en : d.tagline_zh }}</p>
          <p class="g-sig">{{ d.signature }}</p>
          <div class="g-foot">
            <span class="g-viz">{{ vizLabel(d.vizType) }}</span>
            <span class="g-enter">{{ t('进入看板', 'Enter') }} →</span>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.gallery {
  width: 100%;
  max-width: 1504px;
  margin: 0 auto;
  padding: clamp(16px, 3vw, 40px);
}
.g-head h1 {
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 800;
  margin: 0 0 6px;
  color: var(--vp-c-text-1);
}
.g-head p {
  color: var(--vp-c-text-2);
  margin: 0 0 24px;
}
.g-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dc3d-gap);
}
@media (min-width: 560px) {
  .g-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .g-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1440px) {
  .g-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
.g-card {
  display: flex;
  flex-direction: column;
  text-align: left;
  text-decoration: none;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  color: var(--vp-c-text-1);
  transition: transform 0.25s, border-color 0.25s;
}
.g-card::after {
  content: '';
  position: absolute;
  inset: -2px -2px auto -2px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  filter: blur(3px);
  opacity: 0;
  transition: opacity 0.3s;
}
.g-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow:
    0 16px 38px color-mix(in srgb, var(--accent) 32%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}
.dark .g-card:hover {
  box-shadow:
    0 18px 40px color-mix(in srgb, var(--accent) 40%, transparent),
    inset 0 1px 0 rgba(231, 251, 255, 0.16);
}
.g-card:hover::after {
  opacity: 1;
}
.g-cover {
  position: relative;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--vp-c-divider);
}
.g-icon {
  font-size: 40px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}
.g-dot {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dc3d-normal);
  animation: dc3d-gbreathe 1.6s ease-in-out infinite;
}
@keyframes dc3d-gbreathe {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}
.g-body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.g-body h3 {
  font-size: 16px;
  margin: 0;
  color: var(--vp-c-text-1);
}
.g-body h3 small {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-weight: 400;
  margin-left: 6px;
}
.g-tag {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.g-sig {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 0;
}
.g-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
}
.g-viz {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
}
.g-enter {
  font-size: 13px;
  color: var(--accent);
  font-weight: 600;
}
@media (prefers-reduced-motion: reduce) {
  .g-dot {
    animation: none;
  }
  .g-card:hover {
    transform: none;
  }
}
</style>
