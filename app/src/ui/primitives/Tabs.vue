<script setup lang="ts">
import { onMounted } from 'vue';

import type { Component } from 'vue';

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
    emit('change', props.tabs[0].id);
  }
});
</script>

<template>
  <div
    class="tabs"
    role="tablist"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab"
      :class="{ 'tab-active': activeTab === tab.id }"
      role="tab"
      :aria-selected="activeTab === tab.id"
      @click="emit('change', tab.id)"
    >
      <component
        :is="tab.icon"
        class="tab-icon"
      />
      {{ tab.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.tabs {
  @apply border-b
  	flex
  	w-full;
}

.tab {
  @apply -mb-[1px]
  	border-b-2
  	border-transparent
  	cursor-pointer
  	duration-150
  	ease-in-out
  	flex
  	flex-wrap
  	font-medium
  	gap-2
  	grow
  	items-center
  	justify-center
  	outline-none
  	px-4
  	py-3
  	text-sm
  	text-typography-subtle
  	tracking-wider
  	transition-colors;

  &.tab-active {
    @apply border-primary
    	text-primary-light;
  }

  .tab-icon {
    @apply shrink-0
    	text-base;
  }

  &:hover,
  &:focus-visible {
    @apply bg-primary/20
    	text-primary-lighter;
  }
}
</style>
