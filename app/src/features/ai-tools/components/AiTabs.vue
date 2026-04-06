<script setup lang="ts">
import { SlidersIcon, FileTextIcon } from '../../../ui/icons'

export type AiTab = 'optimizer' | 'summary'

const props = defineProps<{ activeTab: AiTab }>()
const emit = defineEmits<{ change: [tab: AiTab] }>()

const tabs: { id: AiTab; label: string }[] = [
  { id: 'optimizer', label: 'Optimizer' },
  { id: 'summary', label: 'Summary' },
]
</script>

<template>
  <div class="ai-tabs" role="tablist" aria-label="AI Tools">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="ai-tabs__tab"
      :class="{ 'ai-tabs__tab--active': activeTab === tab.id }"
      role="tab"
      :aria-selected="activeTab === tab.id"
      @click="emit('change', tab.id)"
    >
      <SlidersIcon v-if="tab.id === 'optimizer'" class="ai-tabs__icon" />
      <FileTextIcon v-else class="ai-tabs__icon" />
      {{ tab.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.ai-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;

  &__tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: theme('spacing[1.5]');
    padding: theme('spacing.3') theme('spacing.4');
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: theme('fontSize.sm');
    font-weight: 500;
    color: var(--color-text-secondary);
    transition: color 150ms ease, border-color 150ms ease;
    margin-bottom: -1px;

    &:hover:not(&--active) {
      color: var(--color-title);
    }

    &--active {
      color: #818cf8;
      border-bottom-color: #6366f1;
    }
  }

  &__icon {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }
}
</style>
