<script setup lang="ts">
defineProps<{title: string; accessibleTitle: string}>()
</script>

<template>
  <section class="dc3d-panel cc">
    <i class="dc3d-corner tl" />
    <i class="dc3d-corner tr" />
    <i class="dc3d-corner bl" />
    <i class="dc3d-corner br" />
    <header class="dc3d-panel-head">
      <h3 class="dc3d-panel-title">{{ title }}</h3>
      <div class="dc3d-panel-actions"><slot name="actions" /></div>
    </header>
    <div class="cc-body"><slot /></div>
    <details v-if="$slots.caption" class="cc-caption">
      <summary>查看原始数据 / View raw data</summary>
      <div class="cc-caption-body"><slot name="caption" /></div>
    </details>
  </section>
</template>

<style scoped>
.cc {
  padding: 0 0 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cc-body {
  flex: 1;
  padding: 6px 12px;
}
.cc-caption {
  font-size: 12px;
  color: var(--dc3d-text-dim);
  padding: 0 12px 4px;
}
.cc-caption summary {
  cursor: pointer;
  user-select: none;
}
.cc-caption-body {
  padding-top: 6px;
  overflow-x: auto;
}
.cc-caption-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: var(--dc3d-text);
}
.cc-caption-body :deep(th),
.cc-caption-body :deep(td) {
  border: 1px solid var(--dc3d-panel-border);
  padding: 4px 8px;
  text-align: left;
}
</style>
