<script setup lang="ts">
import { computed } from "vue";
import type { Channel } from "@/shared/types/channel";
import { Chip, DropdownPanel } from "@/ui";

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
  <DropdownPanel aria-label="Channel filters" class="min-w-[260px] max-w-[300px]">
    <div class="max-h-[300px] overflow-y-auto scrollbar-stable scrollbar-on-surface">
      <div class="dropdown-header">
        <span class="dropdown-title">Channels</span>
        <button v-if="hasSelection" class="clear-btn" @click="emit('clear')">
          Clear all
        </button>
      </div>

      <div class="dropdown-chips">
        <Chip
          v-for="channel in channels"
          :key="channel.id"
          :count="channel.campaigns.length"
          :active="selectedIds.includes(channel.id)"
          @click="emit('toggle', channel.id)"
        >
          {{ channel.name }}
        </Chip>
      </div>
    </div>
  </DropdownPanel>
</template>

<style lang="scss" scoped>
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
</style>
