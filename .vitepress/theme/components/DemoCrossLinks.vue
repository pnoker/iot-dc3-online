<script setup lang="ts">
import {computed} from 'vue'
import {useData} from 'vitepress'

const INDUSTRIES: Record<string, {zh: string, en: string}> = {
  'smart-factory': {zh: '智慧工厂', en: 'Smart Factory'},
  'water-network': {zh: '智慧水务', en: 'Water Network'},
  'microgrid': {zh: '能源微电网', en: 'Microgrid'},
  'precision-agri': {zh: '精准农业', en: 'Precision Agriculture'},
  'smart-building': {zh: '智慧楼宇', en: 'Smart Building'},
  'smart-traffic': {zh: '智慧交通', en: 'Smart Traffic'},
  'oil-gas': {zh: '油气管网', en: 'Oil & Gas'},
  'smart-mine': {zh: '智慧矿山', en: 'Smart Mine'},
  'smart-port': {zh: '智慧港口', en: 'Smart Port'},
  'cold-chain': {zh: '冷链物流', en: 'Cold Chain'},
  'eco-monitor': {zh: '智慧环保', en: 'Eco Monitoring'},
  'ev-charging': {zh: '新能源充电', en: 'EV Charging'}
}

const {page} = useData()

const locale = computed(() => page.value.relativePath.startsWith('zh/') ? 'zh' : 'en')
const slug = computed(() => page.value.relativePath.split('/')[2]?.replace(/\.md$/, '') ?? '')
const current = computed(() => INDUSTRIES[slug.value]?.[locale.value] ?? '')
const others = computed(() =>
  Object.entries(INDUSTRIES)
    .filter(([key]) => key !== slug.value)
    .map(([key, labels]) => ({slug: key, label: labels[locale.value]}))
)
const labels = computed(() => locale.value === 'zh'
  ? {home: '首页', gallery: '看板画廊', more: '更多行业看板：'}
  : {home: 'Home', gallery: 'Dashboards', more: 'More industry dashboards:'})
</script>

<template>
  <nav class="demo-crosslinks" aria-label="Breadcrumb and related dashboards">
    <p class="dc-crumbs">
      <a :href="`/${locale}/`">{{ labels.home }}</a>
      <span class="dc-sep">/</span>
      <a :href="`/${locale}/demo/`">{{ labels.gallery }}</a>
      <span class="dc-sep">/</span>
      <span class="dc-current">{{ current }}</span>
    </p>
    <p class="dc-more">
      <span class="dc-more-label">{{ labels.more }}</span>
      <template v-for="(item, index) in others" :key="item.slug">
        <a :href="`/${locale}/demo/${item.slug}`">{{ item.label }}</a><span v-if="index < others.length - 1" class="dc-sep dc-dot">·</span>
      </template>
    </p>
  </nav>
</template>

<style scoped>
/* 仅出现在行业看板页（深色画布语境），配色对齐 .demo-article */
.demo-crosslinks {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px 64px;
  font-size: 13px;
  line-height: 2;
  text-align: left;
  color: #cfe8f7b8;
}

.demo-crosslinks a {
  color: #cfe8f7d9;
  text-decoration: none;
  transition: color 0.2s;
}

.demo-crosslinks a:hover {
  color: #4db8ff;
}

.dc-sep {
  margin: 0 8px;
  color: #cfe8f740;
}

.dc-current {
  color: #e6f4ffeb;
  font-weight: 600;
}

.dc-more {
  margin-top: 2px;
}

.dc-more-label {
  margin-right: 6px;
  color: #cfe8f799;
}

.dc-dot {
  margin: 0 6px;
}
</style>
