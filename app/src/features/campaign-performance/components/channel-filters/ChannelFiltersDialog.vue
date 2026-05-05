<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import type { Channel } from '@/shared/data';
import { Button, Chip, Dropdown, DropdownPanel } from '@/ui';

import ChannelFilterChips from './ChannelFilterChips.vue';

const props = defineProps<{
  channels: Channel[];
  selectedIds: string[];
  overflowCount: number;
  hiddenSelectedCount: number;
}>();

const emit = defineEmits<{
  apply: [ids: string[]];
}>();

const anchorRef = ref<HTMLElement>();
const dropdownOpen = ref(false);
const pendingIds = ref<string[]>([]);

watch(dropdownOpen, (open) => {
  if (open) {
    pendingIds.value = [...props.selectedIds];
  }
});

const pendingHasSelection = computed(() => pendingIds.value.length > 0);
const pendingAllActive = computed(() => !pendingHasSelection.value);
const pendingSelectedCount = computed(() =>
  pendingHasSelection.value ? pendingIds.value.length : props.channels.length,
);
const allOverflow = computed(() => props.overflowCount === props.channels.length);
const totalCampaigns = computed(() => props.channels.reduce((s, c) => s + c.campaigns.length, 0));

function toggleDropdown(): void {
  dropdownOpen.value = !dropdownOpen.value;
}

function handleToggle(id: string): void {
  const next = pendingIds.value.includes(id)
    ? pendingIds.value.filter((i) => i !== id)
    : [...pendingIds.value, id];
  pendingIds.value = next.length === props.channels.length ? [] : next;
}

function handleClear(): void {
  pendingIds.value = [];
}

function applySelection(): void {
  emit('apply', pendingIds.value);
  dropdownOpen.value = false;
}
</script>

<template>
  <div
    ref="anchorRef"
    class="shrink-0"
  >
    <Chip
      :active="dropdownOpen || hiddenSelectedCount > 0"
      :aria-expanded="dropdownOpen"
      :aria-haspopup="true"
      :aria-label="`${overflowCount} more channels${hiddenSelectedCount > 0 ? `, ${hiddenSelectedCount} selected` : ''}`"
      class="more-chip"
      @click="toggleDropdown"
      @keydown.escape.prevent="dropdownOpen = false"
    >
      <template v-if="allOverflow">{{ channels.length }} channels</template
      ><template v-else>+{{ overflowCount }} more</template
      ><template v-if="hiddenSelectedCount > 0"> · {{ hiddenSelectedCount }}</template>
    </Chip>
    <Dropdown
      v-model:open="dropdownOpen"
      :anchor="anchorRef"
      :align="'right'"
      :max-height="300"
    >
      <DropdownPanel
        aria-label="Channel filters"
        class="filters-panel"
      >
        <p class="panel-header">
          <span class="panel-title">Channels</span>
          <span class="selection-count"
            >{{ pendingSelectedCount }} / {{ channels.length }} selected</span
          >
        </p>
        <div class="scrollbar-stable-both scrollbar-on-surface panel-content">
          <ChannelFilterChips
            layout="plain"
            :channels="channels"
            :total-campaigns="totalCampaigns"
            :selected-ids="pendingIds"
            :all-active="pendingAllActive"
            :all-readonly="pendingAllActive"
            @clear="handleClear"
            @toggle="handleToggle"
          />
        </div>
        <div class="panel-footer">
          <Button
            variant="outline"
            size="smaller"
            @click="dropdownOpen = false"
            >Cancel</Button
          >
          <Button
            variant="primary"
            size="smaller"
            @click="applySelection"
            >Apply</Button
          >
        </div>
      </DropdownPanel>
    </Dropdown>
  </div>
</template>

<style lang="scss" scoped>
.more-chip {
  @apply mt-0.5;
}

.filters-panel {
  @apply min-w-32  
    w-full
    max-w-[90%]
    max-h-96
    grid
    grid-cols-1
    grid-rows-[min-content_minmax(0,1fr)_min-content];
}

.panel-header {
  @apply flex
    items-center
    justify-between
    px-3
    py-2
    border-b
    h-11;

  .panel-title {
    @apply text-sm font-semibold text-typography-muted capitalize tracking-wide;
  }

  .selection-count {
    @apply text-xs text-typography-subtle font-medium normal-case whitespace-nowrap;
  }
}

.panel-content {
  @apply w-full h-full overflow-y-auto py-2 px-0;
}

.panel-footer {
  @apply flex
  items-center
  justify-end gap-6
  px-3 py-2 
  border-t;
}
</style>
