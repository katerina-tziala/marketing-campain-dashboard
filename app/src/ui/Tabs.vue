<script setup lang="ts">
import { onMounted } from 'vue'
import type { Component } from 'vue'

export type Tab<T = string> = {
  id: T
  label: string
  icon?: Component
}

const props = defineProps<{
  tabs: Tab[]
  activeTab?: string
}>()

const emit = defineEmits<{
  change: [tab: string]
}>()

onMounted(() => {
  if (!props.activeTab && props.tabs.length) {
    emit('change', props.tabs[0].id)
  }
})
</script>

<template>
  <div class="tabs" role="tablist" aria-label="AI Tools">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tabs__tab"
      :class="{ 'tabs__tab--active': activeTab === tab.id }"
      role="tab"
      :aria-selected="activeTab === tab.id"
      @click="emit('change', tab.id)"
    >
      <component :is="tab.icon" class="tabs__icon" />
      {{ tab.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.tabs {
  @apply flex w-full border-b border-surface-border bg-surface-secondary-10/20;

  &__tab {
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

    &:hover:not(&--active) {
      color: var(--color-title); 
      @apply bg-primary-500/10;
    }

    &--active {
      @apply text-primary-400 border-primary-500;
    }
  }

  &__icon {
    @apply shrink-0 text-lg;
  }
}
</style>
