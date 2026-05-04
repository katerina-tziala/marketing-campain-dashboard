<script setup lang="ts">
import { computed, ref } from "vue";
import type { Channel } from "@/shared/data";
import { Button, Chip } from "@/ui";
import ChannelFilterChips from "./ChannelFilterChips.vue";

const props = defineProps<{
  channels: Channel[];
  selectedIds: string[];
  overflowCount: number;
  hiddenSelectedCount: number;
}>();

const emit = defineEmits<{
  toggle: [id: string];
  clear: [];
}>();

const dropdownOpen = ref(false);

const hasSelection = computed(() => props.selectedIds.length > 0);
const selectedChannelCount = computed(() =>
  hasSelection.value ? props.selectedIds.length : props.channels.length,
);
const allOverflow = computed(() => props.overflowCount === props.channels.length);

function toggleDropdown(): void {
  dropdownOpen.value = !dropdownOpen.value;
}
</script>

<template>
  <div class="relative shrink-0">
    <!-- Backdrop -->
    <div
      v-if="dropdownOpen"
      class="fixed inset-0 z-40"
      aria-hidden="true"
      @click="dropdownOpen = false"
    />

    <Chip
      :active="dropdownOpen || hiddenSelectedCount > 0"
      :aria-expanded="dropdownOpen"
      :aria-haspopup="true"
      :aria-label="`${overflowCount} more channels${hiddenSelectedCount > 0 ? `, ${hiddenSelectedCount} selected` : ''}`"
      class="more-chip"
      @click="toggleDropdown"
      @keydown.escape.prevent="dropdownOpen = false"
    >
      <template v-if="allOverflow">{{ channels.length }} channels</template><template v-else>+{{ overflowCount }} more</template><template v-if="hiddenSelectedCount > 0"> · {{ hiddenSelectedCount }}</template>
    </Chip>

    <!-- Panel — absolutely positioned relative to the trigger wrapper -->
    <div
      v-if="dropdownOpen"
      class="panel"
      role="dialog"
      aria-label="Channel filters"
      @keydown.escape="dropdownOpen = false"
    >
      <div class="panel-header">
        <p class="panel-title">
          <span class="text-sm">Channels</span>
          <span class="selection-count">{{ selectedChannelCount }} / {{ channels.length }} selected</span>
        </p>
        <Button
          v-if="hasSelection"
          variant="info-text-only"
          size="small"
          @click="emit('clear')"
        >
          Show all
        </Button>
      </div>

      <div class="scrollbar-info-on-surface panel-content">
        <ChannelFilterChips
          layout="plain"
          :channels="channels"
          :total-campaigns="0"
          :selected-ids="selectedIds"
          :show-all="false"
          @toggle="emit('toggle', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.more-chip {
  @apply mt-0.5;
}

.panel {
  @apply absolute right-0 top-full mt-1.5 z-50
    min-w-32 max-w-[89vw] w-max
    max-h-[240px]
    flex flex-col
    bg-surface-raised border rounded-md shadow-lg overflow-hidden;
}

.panel-header {
  @apply sticky top-0
    flex items-center justify-between
    px-3 py-2
    bg-surface-elevated
    border-b
    h-11
    shrink-0;
}

.panel-title {
  @apply flex items-center gap-2 text-xs font-semibold text-typography-muted capitalize tracking-wide;
}

.selection-count {
  @apply text-typography-subtle font-medium normal-case whitespace-nowrap;
}

.panel-content {
  @apply flex-1 min-h-0 overflow-y-auto py-1.5 px-1.5;
}
</style>
