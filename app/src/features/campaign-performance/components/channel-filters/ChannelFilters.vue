<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import type { Channel } from '@/shared/data';

import ChannelFilterChips from './ChannelFilterChips.vue';
import ChannelFiltersDialog from './ChannelFiltersDialog.vue';

const props = defineProps<{
  channels: Channel[];
  selectedIds: string[];
}>();

const emit = defineEmits<{
  toggle: [id: string];
  clear: [];
  apply: [ids: string[]];
}>();

const MULTI_ROW_BREAKPOINT = 540; // px — parent width at which 2-row strip is allowed

const rootRef = ref<HTMLElement>();
const chipsRef = ref<InstanceType<typeof ChannelFilterChips>>();

const hasOverflow = ref(false);
const allowedRows = ref(1);
const dialogToggled = ref(false);

const isAllActive = computed(() => props.selectedIds.length === 0);
const totalCampaigns = computed(() => props.channels.reduce((s, c) => s + c.campaigns.length, 0));

// maxVisible: undefined = render all (measurement mode); number = chip capacity from measurement.
const maxVisible = ref<number | undefined>(undefined);

// Channels to show in the strip, always capped at maxVisible slots.
// Selected chips that fall outside the first-N window replace unselected
// chips from the end of that window (preserving total count = maxVisible).
// Sorted by original order normally; selected-first after a dialog toggle.
const visibleChannels = computed((): Channel[] => {
  if (!hasOverflow.value || maxVisible.value === undefined) {
    return props.channels;
  }

  const capacity = maxVisible.value;
  const firstN = props.channels.slice(0, capacity);
  const extraSelected = props.channels
    .slice(capacity)
    .filter((c) => props.selectedIds.includes(c.id));

  let combined: Channel[];

  if (!extraSelected.length) {
    combined = firstN;
  } else {
    const unselectedInFirstN = firstN.filter((c) => !props.selectedIds.includes(c.id));
    const slotsToFree = Math.min(extraSelected.length, unselectedInFirstN.length);

    if (!slotsToFree) {
      combined = firstN;
    } else {
      const toRemoveIds = new Set(unselectedInFirstN.slice(-slotsToFree).map((c) => c.id));
      combined = [
        ...firstN.filter((c) => !toRemoveIds.has(c.id)),
        ...extraSelected.slice(0, slotsToFree),
      ];
    }
  }

  if (dialogToggled.value) {
    return [...combined].sort((a, b) => {
      const aS = props.selectedIds.includes(a.id) ? 0 : 1;
      const bS = props.selectedIds.includes(b.id) ? 0 : 1;
      return aS - bS;
    });
  }

  const indexMap = new Map(props.channels.map((c, i) => [c.id, i]));
  return [...combined].sort((a, b) => (indexMap.get(a.id) ?? 0) - (indexMap.get(b.id) ?? 0));
});

const overflowCount = computed(() =>
  hasOverflow.value ? props.channels.length - visibleChannels.value.length : 0,
);

// Which selected channels are hidden in the dialog (not present in the strip).
const hiddenSelectedCount = computed(() => {
  if (!hasOverflow.value) {
    return 0;
  }
  const visibleIds = new Set(visibleChannels.value.map((c) => c.id));
  return props.selectedIds.filter((id) => !visibleIds.has(id)).length;
});

function toggleFromStrip(id: string): void {
  dialogToggled.value = false;
  emit('toggle', id);
}

function applyFromDialog(ids: string[]): void {
  dialogToggled.value = true;
  emit('apply', ids);
}

function clear(): void {
  dialogToggled.value = false;
  emit('clear');
}

// ── Overflow measurement ───────────────────────────────────────────────────
//
// Strategy: render all chips first, then use offsetTop to group them into
// rows. On wider containers (≥ MULTI_ROW_BREAKPOINT) up to 2 rows are kept;
// on narrower containers only 1. Truncate to (visible count − 1), reserving
// the last slot for the +N more chip.
// hasOverflow is intentionally NOT reset at start — resetting it destroys
// ChannelFiltersDialog mid-measurement, closing any open dropdown.

async function measure(): Promise<void> {
  maxVisible.value = undefined;

  await nextTick();

  const chips = chipsRef.value?.getChannelChipEls() ?? [];
  if (!chips.length) {
    hasOverflow.value = false;
    return;
  }

  const containerWidth = rootRef.value?.clientWidth ?? 0;
  allowedRows.value = containerWidth >= MULTI_ROW_BREAKPOINT ? 2 : 1;

  // Collect unique row tops in DOM order.
  const rowTops: number[] = [];
  const seen = new Set<number>();
  for (const chip of chips) {
    if (!seen.has(chip.offsetTop)) {
      seen.add(chip.offsetTop);
      rowTops.push(chip.offsetTop);
    }
  }

  if (rowTops.length <= allowedRows.value) {
    hasOverflow.value = false;
    return;
  }

  const allowedTops = new Set(rowTops.slice(0, allowedRows.value));
  const visibleChips = chips.filter((c) => allowedTops.has(c.offsetTop));
  maxVisible.value = Math.max(0, visibleChips.length - 1);
  hasOverflow.value = true;
}

watch(
  () => props.channels,
  () => {
    dialogToggled.value = false;
    nextTick(measure);
  },
);
watch(
  () => props.selectedIds,
  () => nextTick(measure),
);

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  nextTick(measure);

  resizeObserver = new ResizeObserver(() => nextTick(measure));
  if (rootRef.value) {
    resizeObserver.observe(rootRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div
    ref="rootRef"
    class="channel-filters"
    role="group"
    aria-label="Filter by channel"
  >
    <ChannelFilterChips
      ref="chipsRef"
      :channels="visibleChannels"
      :total-campaigns="totalCampaigns"
      :selected-ids="selectedIds"
      :all-active="isAllActive"
      :all-readonly="isAllActive"
      :single-row="hasOverflow && allowedRows === 1"
      @clear="clear"
      @toggle="toggleFromStrip"
    />
    <ChannelFiltersDialog
      v-if="hasOverflow"
      :channels="channels"
      :selected-ids="selectedIds"
      :overflow-count="overflowCount"
      :hidden-selected-count="hiddenSelectedCount"
      @apply="applyFromDialog"
    />
  </div>
</template>

<style lang="scss" scoped>
.channel-filters {
  @apply relative flex items-start gap-2;
}
</style>
