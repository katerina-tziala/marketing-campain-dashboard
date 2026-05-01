<script setup lang="ts">
import { computed, ref } from "vue";
import type { Channel } from "@/shared/data";
import { Badge, Button, Dropdown, DropdownPanel, FunnelIcon } from "@/ui";
import ChannelFilterChips from "./ChannelFilterChips.vue";

const props = defineProps<{
  channels: Channel[];
  selectedIds: string[];
  hiddenCount: number;
}>();

const emit = defineEmits<{
  toggle: [id: string];
  clear: [];
}>();

const dropdownOpen = ref(false);
const triggerButtonRef = ref<InstanceType<typeof Button>>();
const triggerButtonEl = computed(() => triggerButtonRef.value?.getRootEl());

const hasSelection = computed(() => props.selectedIds.length > 0);
const selectedChannelCount = computed(() =>
  hasSelection.value ? props.selectedIds.length : props.channels.length,
);
const triggerLabel = computed(
  () =>
    `Open channel filter${
      props.hiddenCount > 0 ? `, ${props.hiddenCount} selected not visible` : ""
    }`,
);

function toggleDropdown(): void {
  dropdownOpen.value = !dropdownOpen.value;
}
</script>

<template>
  <div class="relative shrink-0 z-[50]">
    <Button
      ref="triggerButtonRef"
      class="info-outline filter-trigger-button"
      :class="{ active: dropdownOpen }"
      :aria-expanded="dropdownOpen"
      :aria-pressed="hasSelection"
      :aria-label="triggerLabel"
      @click="toggleDropdown"
      @keydown.escape.prevent="dropdownOpen = false"
    >
      <span class="icon-wrapper">
        <FunnelIcon class="text-xl" />
      </span>
    </Button>

    <Badge
      v-if="hiddenCount > 0 && !dropdownOpen"
      class="small bold info selected-filters-badge"
      >+{{ hiddenCount }}</Badge
    >

    <Dropdown v-model:open="dropdownOpen" :anchor="triggerButtonEl" :gap="2">
      <DropdownPanel
        aria-label="Channel filters"
        class="min-w-[260px] max-w-[310px] pb-2.5"
      >
        <div class="dropdown-header">
          <p class="dropdown-title">
            <span class="text-sm">Channels</span>
            <span class="selection-count"
              >{{ selectedChannelCount }} / {{ channels.length }} selected</span
            >
          </p>
          <Button
            v-if="hasSelection"
            class="info-text-only small"
            @click="emit('clear')"
          >
            Show all
          </Button>
        </div>

        <div
          class="dropdown-content scrollbar-stable scrollbar-info-on-surface"
        >
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
    </Dropdown>
  </div>
</template>

<style lang="scss" scoped>
.filter-trigger-button {
  @apply h-8 w-8 min-h-8 min-w-8 p-0 mt-0.5;
  > .icon-wrapper {
    @apply inline-block w-full h-full flex items-center justify-center;
  }

  &.info-outline.active {
    @apply bg-info-darker border-info-darker text-info text-typography drop-shadow-sm;
  }
}

.selected-filters-badge {
  @apply absolute -top-2.5 -right-2.5 min-w-6 max-h-6;
}

.dropdown-header {
  @apply sticky top-0
    flex items-center justify-between
    px-3 py-2
    bg-surface-elevated
    border-b
    h-11;
}

.dropdown-title {
  @apply flex
    items-center
    gap-2
    text-xs
    font-semibold
    text-typography-muted
    capitalize
    tracking-wide;
}

.selection-count {
  @apply text-typography-subtle font-medium normal-case whitespace-nowrap;
}

.dropdown-content {
  @apply max-h-[320px] overflow-y-auto;
}
</style>
