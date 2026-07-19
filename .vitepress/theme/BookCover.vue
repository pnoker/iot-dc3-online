<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps<{english: boolean}>()

const highlightColors = ['#2563eb', '#10b981', '#f59e0b', '#2563eb']
const copy = computed(() => props.english ? {
  lang: 'en',
  tag: 'CONNECTED INTELLIGENCE',
  tagWidth: 164,
  title: [
    {text: 'AIoT', y: 106},
    {text: 'Technology', y: 140},
    {text: '& Practice', y: 174}
  ],
  titleSize: 34,
  titleSpacing: 0,
  subtitle: 'From IoT Platforms to Agent Applications',
  subtitleSize: 10.5,
  subtitleY: 211,
  highlights: [
    'Five layers · Intelligence · IoT platform foundation',
    'LLMs · Agent · MCP · Tools · Skills · CLI · Intelligent Ops',
    'IoT DC3 open source throughout the book',
    '14 chapters · 72 architecture diagrams · Engineering methods'
  ],
  highlightSize: 7.2,
  author: 'Henry Zhang',
  authorTitle: 'IoT DC3 Creator · Architect · IoT Expert',
  brand: ['From Connectivity to', 'Intelligence'],
  brandSub: 'IoT DC3'
} : {
  lang: 'zh-CN',
  tag: '万物智联',
  tagWidth: 62,
  title: [
    {text: 'AIoT', y: 112},
    {text: '技术与实践', y: 157}
  ],
  titleSize: 41,
  titleSpacing: 1.5,
  subtitle: '—— 从物联网平台到智能体应用',
  subtitleSize: 12.5,
  subtitleY: 204,
  highlights: [
    '五层架构 · 智能层 · 物联网平台底座',
    '大模型 · Agent · MCP · Tools · Skills · CLI · 智能运维',
    'IoT DC3 开源项目贯穿全书',
    '14 章 · 72 张架构图 · 工程方法论'
  ],
  highlightSize: 7.6,
  author: '张红元',
  authorTitle: 'IoT DC3 开源作者 · 架构师 · 物联网专家',
  brand: ['从连接到智能'],
  brandSub: 'Connecting to Intelligence'
})
</script>

<template>
  <svg
    class="book-cover-art"
    :lang="copy.lang"
    viewBox="0 0 480 680"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="book-cover-background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#eef4ff" />
        <stop offset="0.34" stop-color="#e0f2fe" />
        <stop offset="0.63" stop-color="#f0fbff" />
        <stop offset="1" stop-color="#fef6ec" />
      </linearGradient>
      <linearGradient id="book-cover-title" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#1d4ed8" />
        <stop offset="0.58" stop-color="#0891b2" />
        <stop offset="1" stop-color="#059669" />
      </linearGradient>
      <linearGradient id="book-cover-divider" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#2563eb" />
        <stop offset="0.56" stop-color="#10b981" />
        <stop offset="1" stop-color="#f59e0b" />
      </linearGradient>
      <radialGradient id="book-cover-blue-glow">
        <stop offset="0" stop-color="#60a5fa" stop-opacity="0.34" />
        <stop offset="1" stop-color="#60a5fa" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="book-cover-green-glow">
        <stop offset="0" stop-color="#34d399" stop-opacity="0.25" />
        <stop offset="1" stop-color="#34d399" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="book-cover-amber-glow">
        <stop offset="0" stop-color="#fbbf24" stop-opacity="0.2" />
        <stop offset="1" stop-color="#fbbf24" stop-opacity="0" />
      </radialGradient>
      <pattern id="book-cover-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0H0V20" fill="none" stroke="#2563eb" stroke-opacity="0.055" stroke-width="0.7" />
      </pattern>
    </defs>

    <rect width="480" height="680" fill="url(#book-cover-background)" />
    <rect width="480" height="680" fill="url(#book-cover-grid)" />
    <circle cx="448" cy="52" r="145" fill="url(#book-cover-blue-glow)" />
    <circle cx="22" cy="656" r="138" fill="url(#book-cover-green-glow)" />
    <circle cx="474" cy="405" r="116" fill="url(#book-cover-amber-glow)" />

    <g class="constellation primary">
      <path d="M326 92L365 72L403 96L442 82M403 96L428 132L389 150L350 136L326 92M389 150L416 192L365 206L333 177L350 136" />
      <path class="orbit" d="M326 92C360 52 431 55 449 100C461 134 435 187 395 207" />
      <circle cx="326" cy="92" r="4" class="blue" />
      <circle cx="365" cy="72" r="3" class="cyan" />
      <circle cx="403" cy="96" r="4.5" class="teal" />
      <circle cx="442" cy="82" r="3" class="green" />
      <circle cx="428" cy="132" r="4.5" class="cyan" />
      <circle cx="389" cy="150" r="5" class="blue" />
      <circle cx="416" cy="192" r="4" class="green" />
      <circle cx="365" cy="206" r="3.5" class="amber" />
      <circle cx="333" cy="177" r="3" class="blue" />
      <circle cx="350" cy="136" r="3.5" class="teal" />
    </g>

    <g class="constellation secondary">
      <path d="M455 355L422 405L452 443L390 470L330 450L282 500M422 405L390 470L350 510" />
      <path class="orbit" d="M455 355C430 365 411 389 405 425C398 467 365 500 326 516" />
      <circle cx="455" cy="355" r="3.5" class="green" />
      <circle cx="422" cy="405" r="3" class="cyan" />
      <circle cx="452" cy="443" r="3.5" class="amber" />
      <circle cx="390" cy="470" r="4" class="teal" />
      <circle cx="330" cy="450" r="3.5" class="blue" />
      <circle cx="350" cy="510" r="2.8" class="green" />
      <circle cx="282" cy="500" r="3.5" class="blue" />
    </g>

    <g class="cover-copy">
      <rect x="50" y="58" :width="copy.tagWidth" height="20" rx="10" class="tag-outline" />
      <text :x="50 + copy.tagWidth / 2" y="68" class="tag-text">{{ copy.tag }}</text>

      <text
        v-for="line in copy.title"
        :key="line.text"
        x="50"
        :y="line.y"
        class="cover-title"
        :font-size="copy.titleSize"
        :letter-spacing="copy.titleSpacing"
      >{{ line.text }}</text>

      <text x="50" :y="copy.subtitleY" class="cover-subtitle" :font-size="copy.subtitleSize">{{ copy.subtitle }}</text>
      <rect x="50" y="242" width="49" height="3" rx="1.5" fill="url(#book-cover-divider)" />

      <g v-for="(highlight, index) in copy.highlights" :key="highlight">
        <circle cx="52.5" :cy="278 + index * 21" r="2.6" :fill="highlightColors[index]" />
        <text x="63" :y="278 + index * 21" class="cover-highlight" :font-size="copy.highlightSize">{{ highlight }}</text>
      </g>
    </g>

    <g class="cover-footer">
      <g class="logo-mark" transform="translate(50 586)">
        <circle cx="14" cy="14" r="4.2" fill="#0891b2" />
        <circle cx="4" cy="14" r="2.2" fill="#2563eb" />
        <circle cx="24" cy="14" r="2.2" fill="#10b981" />
        <circle cx="9" cy="5" r="2.2" fill="#06b6d4" />
        <circle cx="19" cy="5" r="2.2" fill="#2563eb" />
        <circle cx="9" cy="23" r="2.2" fill="#10b981" />
        <circle cx="19" cy="23" r="2.2" fill="#06b6d4" />
        <path d="M4 14L9 5L19 5L24 14L19 23L9 23Z" fill="none" stroke="#0891b2" stroke-width="1.3" opacity="0.72" />
      </g>
      <text x="90" y="598" class="author-name">{{ copy.author }}</text>
      <text x="90" y="614" class="author-title">{{ copy.authorTitle }}</text>

      <text
        v-for="(line, index) in copy.brand"
        :key="line"
        x="430"
        :y="598 + index * 11"
        class="brand-title"
      >{{ line }}</text>
      <text x="430" :y="copy.brand.length > 1 ? 626 : 614" class="brand-subtitle">{{ copy.brandSub }}</text>
    </g>
  </svg>
</template>

<style scoped>
.book-cover-art {
  display: block;
  width: 100%;
  height: 100%;
  background: #eef4ff;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  shape-rendering: geometricPrecision;
  text-rendering: geometricPrecision;
}

.constellation path {
  fill: none;
  stroke: #38bdf8;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-opacity: 0.48;
  stroke-width: 1.1;
}

.constellation .orbit {
  stroke: #2563eb;
  stroke-dasharray: 2 6;
  stroke-opacity: 0.12;
  stroke-width: 0.8;
}

.constellation circle {
  stroke: #fff;
  stroke-width: 1.2;
}

.constellation .blue { fill: #2563eb; }
.constellation .cyan { fill: #06b6d4; }
.constellation .teal { fill: #0891b2; }
.constellation .green { fill: #10b981; }
.constellation .amber { fill: #f59e0b; }

.tag-outline {
  fill: rgba(255, 255, 255, 0.52);
  stroke: rgba(37, 99, 235, 0.42);
  stroke-width: 1;
}

.tag-text {
  fill: #2563eb;
  font-size: 6.5px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-anchor: middle;
  dominant-baseline: middle;
}

.cover-title {
  fill: url(#book-cover-title);
  font-weight: 800;
  dominant-baseline: middle;
}

.cover-subtitle {
  fill: #334155;
  font-weight: 450;
  dominant-baseline: middle;
}

.cover-highlight {
  fill: #475569;
  font-weight: 520;
  dominant-baseline: middle;
}

.author-name {
  fill: #0f172a;
  font-size: 11px;
  font-weight: 750;
  dominant-baseline: middle;
}

.author-title {
  fill: #64748b;
  font-size: 6px;
  font-weight: 450;
  letter-spacing: 0.15px;
  dominant-baseline: middle;
}

.brand-title,
.brand-subtitle {
  text-anchor: end;
  dominant-baseline: middle;
}

.brand-title {
  fill: #0891b2;
  font-size: 8px;
  font-weight: 720;
}

.brand-subtitle {
  fill: #94a3b8;
  font-size: 6.5px;
  letter-spacing: 0.8px;
}
</style>
