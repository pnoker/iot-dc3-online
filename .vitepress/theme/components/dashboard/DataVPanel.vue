<script setup lang="ts">
/**
 * DataV 科技面板外壳:BorderBox 科技边框 + 标题栏 + SEC 编号。
 * 替代手搓 .dc3d-corner,统一 12 领域看板面板外观。
 * DataV 组件 client-only(全局 app.use 已 SSR 隔离),此壳用 <ClientOnly> 包 BorderBox 防 hydration 抖动。
 */
import {computed} from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    accessibleTitle?: string
    border?: number // BorderBox 编号 1-13,默认 13
    color?: string[] // 边框双色
  }>(),
  {border: 13, color: () => ['#00e5ff', '#2b9bff']},
)
const borderComp = computed(() => `DvBorderBox${props.border}`)
</script>

<template>
  <div class="dvp" role="group" :aria-label="accessibleTitle || title">
    <ClientOnly>
      <component :is="borderComp" :color="color" backgroundColor="rgba(8,22,45,0.55)">
        <div class="dvp-inner">
          <header class="dvp-head">
            <span class="dvp-bar" />
            <h3 class="dvp-title">{{ title }}</h3>
            <span class="dvp-actions"><slot name="actions" /></span>
          </header>
          <div class="dvp-body"><slot /></div>
        </div>
      </component>
      <!-- SSR/降级 fallback:无 DataV 时用实色面板 -->
      <template #fallback>
        <div class="dvp-fallback">
          <header class="dvp-head"><span class="dvp-bar" /><h3 class="dvp-title">{{ title }}</h3></header>
          <div class="dvp-body"><slot /></div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.dvp {
  position: relative;
  width: 100%;
  height: 100%;
}
/* DataV BorderBox 内容区:inset 留出 BorderBox 装饰边框空间(边框图形约占 12-18px),
   避免内容压在边框/角标上("顶出"感);底部留足内边距。 */
.dvp-inner {
  position: absolute;
  inset: 14px 18px 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.dvp-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 6px 14px 12px;
  box-sizing: border-box;
}
.dvp-fallback {
  position: static;
  background: var(--dc3d-panel-bg);
  border: 1px solid var(--dc3d-panel-border);
  border-radius: var(--dc3d-radius);
  height: 100%;
}
.dvp-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0 6px;
  flex-shrink: 0;
}
.dvp-bar {
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, var(--dc3d-neon-cyan), var(--dc3d-magenta));
  box-shadow: 0 0 8px var(--dc3d-neon-cyan);
}
.dvp-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--dc3d-text);
  margin: 0;
  flex: 1;
  text-shadow: 0 0 6px rgba(0, 229, 255, 0.25);
}
.dvp-actions {
  font-size: 12px;
  color: var(--dc3d-text-dim);
  font-family: var(--dc3d-mono);
}
.dvp-body {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden; /* 裁剪子图表溢出,防止叠到相邻面板 */
}
</style>
