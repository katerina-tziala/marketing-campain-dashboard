<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import type { Channel } from "@/shared/types";
import ChannelFilterChips from "./ChannelFilterChips.vue";
import ChannelFiltersDialog from "./ChannelFiltersDialog.vue";

const props = defineProps<{
  channels: Channel[];
  selectedIds: string[];
}>();

const emit = defineEmits<{
  toggle: [id: string];
  clear: [];
}>();

const measureRef = ref<InstanceType<typeof ChannelFilterChips>>();
const chipsRef = ref<InstanceType<typeof ChannelFilterChips>>();

const hasOverflow = ref(false);
const hiddenSelectedIds = ref<string[]>([]);

// ── Chip display ───────────────────────────────────────────────────────────

const isAllActive = computed(() => props.selectedIds.length === 0);
const showAllChip = computed(() => !hasOverflow.value || isAllActive.value);
const allChipReadOnly = computed(() => hasOverflow.value && isAllActive.value);
const totalCampaigns = computed(() =>
  props.channels.reduce((s, c) => s + c.campaigns.length, 0),
);

const displayedChips = computed((): Channel[] => {
  if (!hasOverflow.value) return props.channels;
  if (isAllActive.value) return [];
  return [...props.channels]
    .filter((c) => props.selectedIds.includes(c.id))
    .sort((a, b) => a.name.localeCompare(b.name));
});

// ── Filter chip helpers ────────────────────────────────────────────────────

function toggle(id: string): void {
  emit("toggle", id);
}

function clear(): void {
  emit("clear");
}

// ── Overflow measurement ───────────────────────────────────────────────────
//
// hasOverflow is measured against measureRef (hidden, always all chips) so
// that selection changes never affect the overflow state — only container
// width and channel data do.
//
// hiddenSelectedIds is measured against chipsRef (visible strip) using
// offsetTop, which reflects natural flex layout regardless of max-height.

function measureOverflow(): void {
  hasOverflow.value = measureRef.value?.hasOverflow() ?? false;
}

function measureHidden(): void {
  if (!chipsRef.value || !hasOverflow.value || isAllActive.value) {
    hiddenSelectedIds.value = [];
    return;
  }
  const chips = chipsRef.value.getChannelChipEls();
  if (!chips.length) {
    hiddenSelectedIds.value = [];
    return;
  }
  const firstRowTop = chips[0].offsetTop;
  hiddenSelectedIds.value = chips
    .filter((c) => c.offsetTop !== firstRowTop)
    .map((c) => c.dataset.channelId!)
    .filter((id) => props.selectedIds.includes(id));
}

function measure(): void {
  measureOverflow();
  nextTick(measureHidden);
}

watch(
  () => props.selectedIds,
  () => nextTick(measureHidden),
);
watch(
  () => props.channels,
  () => nextTick(measure),
);
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  nextTick(measure);

  resizeObserver = new ResizeObserver(() => nextTick(measure));
  const measureEl = measureRef.value?.getRootEl();
  if (measureEl) resizeObserver.observe(measureEl);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div class="channel-filters" role="group" aria-label="Filter by channel">
    <ChannelFilterChips
      ref="measureRef"
      variant="probe"
      :channels="channels"
      :total-campaigns="totalCampaigns"
    />
    <ChannelFiltersDialog
      v-if="hasOverflow"
      :channels="channels"
      :selected-ids="selectedIds"
      :hidden-count="hiddenSelectedIds.length"
      @toggle="toggle"
      @clear="clear"
    />
    <ChannelFilterChips
      ref="chipsRef"
      :channels="displayedChips"
      :total-campaigns="totalCampaigns"
      :selected-ids="selectedIds"
      :show-all="showAllChip"
      :all-active="isAllActive"
      :all-readonly="allChipReadOnly"
      :single-row="hasOverflow"
      @clear="clear"
      @toggle="toggle"
    />
  </div>
</template>

<style lang="scss" scoped>
.channel-filters {
  @apply relative flex items-start gap-2;
}
</style>
