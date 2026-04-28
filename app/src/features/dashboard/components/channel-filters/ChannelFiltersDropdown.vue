<script setup lang="ts">
import { computed } from "vue";
import type { Channel } from "@/shared/types/channel";
import { DropdownPanel } from "@/ui";
import ChannelFilterChips from "./ChannelFilterChips.vue";

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
    <div>
      <div class="dropdown-header">
        <span class="dropdown-title">Channels</span>
        <button v-if="hasSelection" class="clear-btn" @click="emit('clear')">
          Clear all
        </button>
      </div>

      <ChannelFilterChips
        layout="plain"
        :channels="channels"
        :total-campaigns="0"
        :selected-ids="selectedIds"
        :show-all="false"
        @toggle="emit('toggle', $event)"
      />
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

</style>
