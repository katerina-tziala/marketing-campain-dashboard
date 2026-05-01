<script setup lang="ts">
import { computed, ref } from "vue";
import type { Channel } from "@/shared/data";
import { Chip } from "@/ui";

const props = withDefaults(
  defineProps<{
    variant?: "visible" | "probe";
    layout?: "strip" | "plain";
    channels: Channel[];
    totalCampaigns: number;
    selectedIds?: string[];
    showAll?: boolean;
    allActive?: boolean;
    allReadonly?: boolean;
    singleRow?: boolean;
  }>(),
  {
    variant: "visible",
    layout: "strip",
    selectedIds: () => [],
    showAll: true,
    allActive: false,
    allReadonly: false,
    singleRow: false,
  },
);

const emit = defineEmits<{
  clear: [];
  toggle: [id: string];
}>();

const rootRef = ref<HTMLElement>();

const isProbe = computed(() => props.variant === "probe");

function isSelected(id: string): boolean {
  return props.selectedIds.includes(id);
}

function onClear(): void {
  if (!props.allReadonly && !isProbe.value) {
    emit("clear");
  }
}

function onToggle(id: string): void {
  if (!isProbe.value) {
    emit("toggle", id);
  }
}

function getRootEl(): HTMLElement | undefined {
  return rootRef.value;
}

function getChannelChipEls(): HTMLElement[] {
  if (!rootRef.value) return [];
  return Array.from(
    rootRef.value.querySelectorAll<HTMLElement>("[data-channel-id]"),
  );
}

function hasOverflow(): boolean {
  if (!rootRef.value) return false;
  return rootRef.value.scrollHeight > rootRef.value.clientHeight + 1;
}

defineExpose({
  getRootEl,
  getChannelChipEls,
  hasOverflow,
});
</script>

<template>
  <div
    ref="rootRef"
    class="channel-filter-chips"
    :class="{
      plain: layout === 'plain',
      probe: isProbe,
      'single-row': singleRow,
    }"
    :aria-hidden="isProbe || undefined"
  >
    <Chip
      v-if="showAll"
      :count="totalCampaigns"
      :active="allActive"
      :readonly="allReadonly || isProbe"
      :tabindex="isProbe ? -1 : undefined"
      :disabled="isProbe || undefined"
      @click="onClear"
    >
      All
    </Chip>
    <Chip
      v-for="channel in channels"
      :key="channel.id"
      :data-channel-id="channel.id"
      :count="channel.campaigns.length"
      :active="isSelected(channel.id)"
      :readonly="isProbe"
      :tabindex="isProbe ? -1 : undefined"
      :disabled="isProbe || undefined"
      @click="onToggle(channel.id)"
    >
      {{ channel.name }}
    </Chip>
  </div>
</template>

<style lang="scss" scoped>
.channel-filter-chips {
  @apply flex flex-wrap gap-2.5 p-1;

  &:not(.plain) {
    @apply flex-1 overflow-hidden;
  }

  &.plain {
    @apply gap-2 p-3 max-h-none;
  }

  max-height: var(--channel-filter-max-height, 4.8rem);

  &.probe {
    @apply absolute inset-x-0 top-0 invisible pointer-events-none select-none pr-9;
  }

  &.single-row {
    @apply max-h-9;
  }
}
</style>
