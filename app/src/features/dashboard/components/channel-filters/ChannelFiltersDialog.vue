<script setup lang="ts">
import { computed, ref } from "vue";
import type { Channel } from "@/shared/types/channel";
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
      class="info-outline paddingless filter-trigger-button"
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
      >{{ hiddenCount }}</Badge
    >

    <Dropdown v-model:open="dropdownOpen" :anchor="triggerButtonEl" :gap="2">
      <DropdownPanel
        aria-label="Channel filters"
        class="min-w-[260px] max-w-[310px]"
      >
        <div class="dropdown-header">
          <p class="dropdown-title">Channels</p>
          <Button
            v-if="hasSelection"
            class="ghost small"
            @click="emit('clear')"
          >
            Select all
          </Button>
        </div>

        <div class="dropdown-content scrollbar-stable scrollbar-on-surface">
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
}

.selected-filters-badge {
  @apply absolute -top-2.5 -right-2.5 min-w-6 max-h-6;
}

.filter-trigger-button.info-outline.active {
  @apply bg-background border-info/65 text-info-light;
  > .icon-wrapper {
    @apply bg-info/15;
  }
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
  @apply text-xs font-semibold text-typography-muted capitalize tracking-wide;
}

.dropdown-content {
  @apply max-h-[300px] overflow-y-auto;
}
</style>
