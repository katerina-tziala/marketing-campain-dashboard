<script setup lang="ts">
import { computed } from "vue";
import type { Channel } from "@/shared/types/channel";

const props = defineProps<{
  channels: Channel[];
  selectedIds: string[];
}>();

const emit = defineEmits<{
  toggle: [id: string];
  clear: [];
  close: [];
}>();

const hasSelection = computed(() => props.selectedIds.length > 0);
</script>

<template>
  <div class="filter-dropdown" role="dialog" aria-label="Channel filters">
    <div class="dropdown-header">
      <span class="dropdown-title">Channels</span>
      <button v-if="hasSelection" class="clear-btn" @click="emit('clear')">
        Clear all
      </button>
    </div>

    <div class="dropdown-chips">
      <button
        v-for="channel in channels"
        :key="channel.id"
        class="filter-chip"
        :class="selectedIds.includes(channel.id) ? 'active' : 'inactive'"
        :aria-pressed="selectedIds.includes(channel.id)"
        @click="emit('toggle', channel.id)"
      >
        {{ channel.name }}
        <span class="chip-count">{{ channel.campaigns.length }}</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter-dropdown {
  @apply bg-surface-elevated
    border
    rounded-xl
    shadow-lg
    min-w-[260px] max-w-[340px]
    max-h-[300px]
    overflow-y-auto
    scrollbar-stable scrollbar-on-surface;
}

.dropdown-header {
  @apply sticky top-0
    flex items-center justify-between
    px-3 py-2
    bg-surface-elevated
    border-b;
}

.dropdown-title {
  @apply text-xs font-semibold text-typography-muted uppercase tracking-wide;
}

.clear-btn {
  @apply text-xs text-typography-subtle
    transition-colors
    outline-none
    hover:text-danger
    focus-visible:text-danger;
}

.dropdown-chips {
  @apply flex flex-wrap gap-2 p-3;
}

.filter-chip {
  @apply flex items-center gap-1
    rounded-full
    border
    pr-1 pl-2 py-1
    text-sm font-medium
    transition-colors
    outline-none
    shrink-0;

  &.active {
    @apply border-primary bg-primary text-on-primary;
  }

  &.inactive {
    @apply border bg-surface text-typography-subtle
      hover:border-primary-light
      focus-visible:border-primary-light;
  }
}

.chip-count {
  @apply inline-flex items-center justify-center
    rounded-full px-1.5 min-w-[1.25rem] h-5
    text-xs font-normal bg-on-primary/10;
}
</style>
