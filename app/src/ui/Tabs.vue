<script setup lang="ts">
import { onMounted } from "vue";
import type { Component } from "vue";

export type Tab<T = string> = {
  id: T;
  label: string;
  icon?: Component;
};

const props = defineProps<{
  tabs: Tab[];
  activeTab?: string;
}>();

const emit = defineEmits<{
  change: [tab: string];
}>();

onMounted(() => {
  if (!props.activeTab && props.tabs.length) {
    emit("change", props.tabs[0].id);
  }
});
</script>

<template>
  <div class="tabs" role="tablist" aria-label="AI Tools">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab"
      :class="{ 'tab-active': activeTab === tab.id }"
      role="tab"
      :aria-selected="activeTab === tab.id"
      @click="emit('change', tab.id)"
    >
      <component :is="tab.icon" class="tab-icon" />
      {{ tab.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.tabs {
  @apply flex w-full border-b border;
}

.tab {
  @apply flex
      items-center
      justify-center
      gap-2
      grow
      px-4
      py-3
      text-typography-subtle
      border-b-2
      cursor-pointer
      text-sm
      font-medium
      tracking-wider
      border-transparent
      -mb-[1px]
      transition-colors
      duration-150
      ease-in-out;

  &.tab-active {
    @apply text-primary-light border-primary;
  }

  .tab-icon {
    @apply shrink-0 text-lg;
  }

  &:hover:not(.tab-active) {
    @apply bg-primary/20 text-primary-lighter;
  }
}
</style>
