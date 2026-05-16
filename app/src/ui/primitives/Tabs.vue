<script setup lang="ts">
import { onMounted, ref } from 'vue';

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

const tablistRef = ref<HTMLElement | null>(null);

function getTabButtons(): HTMLElement[] {
  return Array.from(tablistRef.value?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);
}

function handleKeydown(event: KeyboardEvent): void {
  const buttons = getTabButtons();
  const count = buttons.length;
  if (count === 0) {
    return;
  }

  const focused = buttons.findIndex((el) => el === document.activeElement);
  if (focused === -1) {
    return;
  }

  let next = -1;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    next = (focused + 1) % count;
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    next = (focused - 1 + count) % count;
  } else if (event.key === 'Home') {
    next = 0;
  } else if (event.key === 'End') {
    next = count - 1;
  }

  if (next !== -1) {
    event.preventDefault();
    buttons[next].focus();
  }
}

onMounted(() => {
  if (!props.activeTab && props.tabs.length) {
    emit('change', props.tabs[0].id);
  }
});
</script>

<template>
  <div
    ref="tablistRef"
    class="tabs"
    role="tablist"
    @keydown="handleKeydown"
  >
    <button
      v-for="tab in tabs"
      :id="`tab-${tab.id}`"
      :key="tab.id"
      class="tab"
      :class="{ 'tab-active': activeTab === tab.id }"
      role="tab"
      :aria-selected="activeTab === tab.id"
      :tabindex="(activeTab ?? tabs[0]?.id) === tab.id ? 0 : -1"
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
