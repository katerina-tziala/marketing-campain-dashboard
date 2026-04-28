<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { Channel } from '@/shared/types/channel'
import { useCampaignStore } from '@/stores/campaign.store'
import { Chip, SlidersIcon, Dropdown } from '@/ui'
import ChannelFiltersDropdown from './ChannelFiltersDropdown.vue'

const props = defineProps<{
  channels: Channel[]
}>()

const store = useCampaignStore()

const measureRef = ref<HTMLElement>()
const chipsRef = ref<HTMLElement>()
const triggerButtonRef = ref<HTMLButtonElement>()

const hasOverflow = ref(false)
const hiddenSelectedIds = ref<string[]>([])
const dropdownOpen = ref(false)

// ── Chip display ───────────────────────────────────────────────────────────

const isAllActive = computed(() => store.selectedChannelsIds.length === 0)
const showAllChip = computed(() => !hasOverflow.value || isAllActive.value)
const allChipReadOnly = computed(() => hasOverflow.value && isAllActive.value)
const totalCampaigns = computed(() => props.channels.reduce((s, c) => s + c.campaigns.length, 0))

const displayedChips = computed((): Channel[] => {
  if (!hasOverflow.value) return props.channels
  if (isAllActive.value) return []
  return [...props.channels]
    .filter(c => store.selectedChannelsIds.includes(c.id))
    .sort((a, b) => a.name.localeCompare(b.name))
})

// ── Filter chip helpers ────────────────────────────────────────────────────

function isSelected(id: string): boolean {
  return store.selectedChannelsIds.includes(id)
}

function toggle(id: string): void {
  const current = store.selectedChannelsIds
  const next = current.includes(id)
    ? current.filter(i => i !== id)
    : [...current, id]
  store.setChannelFilter(next.length === props.channels.length ? [] : next)
}

function clear(): void {
  store.setChannelFilter([])
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
  if (!measureRef.value) return
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
  hasOverflow.value = measureRef.value.scrollHeight > 4.5 * rootFontSize + 1
}

function measureHidden(): void {
  if (!chipsRef.value || !hasOverflow.value || isAllActive.value) {
    hiddenSelectedIds.value = []
    return
  }
  const chips = Array.from(chipsRef.value.querySelectorAll<HTMLElement>('[data-channel-id]'))
  if (!chips.length) { hiddenSelectedIds.value = []; return }
  const firstRowTop = chips[0].offsetTop
  hiddenSelectedIds.value = chips
    .filter(c => c.offsetTop !== firstRowTop)
    .map(c => c.dataset.channelId!)
    .filter(id => store.selectedChannelsIds.includes(id))
}

function measure(): void {
  measureOverflow()
  nextTick(measureHidden)
}

watch(() => store.selectedChannelsIds, () => nextTick(measureHidden))
watch(() => props.channels, () => nextTick(measure))
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(measure)

  if (measureRef.value) {
    resizeObserver = new ResizeObserver(() => nextTick(measure))
    resizeObserver.observe(measureRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

function toggleDropdown(): void {
  dropdownOpen.value = !dropdownOpen.value
}
</script>

<template>
  <div class="channel-filters" role="group" aria-label="Filter by channel">

    <!-- Hidden measurement strip — always has All + all channel chips, never interactive.
         Absolutely positioned so it doesn't affect layout but spans the full container
         width for accurate scrollHeight readings. -->
    <div ref="measureRef" class="chips-measure" aria-hidden="true">
      <button class="filter-chip inactive" tabindex="-1" disabled>
        All <span class="chip-count">{{ totalCampaigns }}</span>
      </button>
      <button
        v-for="channel in channels"
        :key="channel.id"
        class="filter-chip inactive"
        tabindex="-1"
        disabled
      >
        {{ channel.name }}
        <span class="chip-count">{{ channel.campaigns.length }}</span>
      </button>
    </div>

    <!-- Filter trigger — visible only in overflow mode; z-50 keeps it above the backdrop -->
    <div v-if="hasOverflow" class="filter-trigger">
      <button
        ref="triggerButtonRef"
        class="filter-icon-btn"
        :class="{ active: dropdownOpen }"
        :aria-expanded="dropdownOpen"
        :aria-pressed="store.selectedChannelsIds.length > 0"
        :aria-label="`Open channel filter${hiddenSelectedIds.length > 0 ? `, ${hiddenSelectedIds.length} selected not visible` : ''}`"
        @click="toggleDropdown"
        @keydown.escape.prevent="dropdownOpen = false"
      >
        <SlidersIcon class="w-4 h-4" />
      </button>

      <span
        v-if="hiddenSelectedIds.length > 0"
        class="filter-count-badge"
        aria-hidden="true"
      >
        {{ hiddenSelectedIds.length }}
      </span>
    </div>

    <!-- Visible chip strip -->
    <div ref="chipsRef" class="chips-container" :class="{ 'single-row': hasOverflow }">

      <!-- All chip:
           State A → interactive, active when no filter, click clears
           State B no selection → read-only display, always active
           State B with selection → not shown -->
      <Chip
        v-if="showAllChip"
        :active="isAllActive"
        :readonly="allChipReadOnly"
        @click="!allChipReadOnly && clear()"
      >
        All
        <span class="chip-count">{{ totalCampaigns }}</span>
      </Chip>

      <!-- Channel chips:
           State A → all channels, interactive
           State B no selection → none (only All chip)
           State B with selection → selected channels sorted by name, interactive (click deselects) -->
      <Chip
        v-for="channel in displayedChips"
        :key="channel.id"
        :data-channel-id="channel.id"
        :active="isSelected(channel.id)"
        @click="toggle(channel.id)"
      >
        {{ channel.name }}
        <span class="chip-count">{{ channel.campaigns.length }}</span>
      </Chip>
    </div>

    <Dropdown v-model:open="dropdownOpen" :anchor="triggerButtonRef" :gap="0">
      <ChannelFiltersDropdown
        :channels="channels"
        :selected-ids="store.selectedChannelsIds"
        @toggle="toggle"
        @clear="clear"
        @close="dropdownOpen = false"
      />
    </Dropdown>

  </div>
</template>

<style lang="scss" scoped>
.channel-filters {
  @apply relative flex items-start gap-2;
}

.chips-measure {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  @apply flex flex-wrap gap-2.5 overflow-hidden pr-9;
  max-height: var(--channel-filter-max-height, 4.8rem);
  visibility: hidden;
  pointer-events: none;
  user-select: none; 
}

.filter-trigger {
  @apply relative shrink-0;
  z-index: 50;
}

.filter-icon-btn {
  @apply flex items-center justify-center
    w-8 h-8
    rounded-lg
    border
    bg-surface
    text-typography-subtle
    transition-colors
    outline-none
    hover:border-primary-light hover:text-primary-light
    focus-visible:ring-2 focus-visible:ring-primary/40;

  &.active {
    @apply border-primary text-primary bg-primary/10;
  }
}

.filter-count-badge {
  @apply absolute -top-1.5 -right-1.5
    flex items-center justify-center
    min-w-[1.125rem] h-[1.125rem] px-1
    rounded-full
    text-[10px] font-bold leading-none
    bg-primary text-on-primary
    pointer-events-none select-none;
}

.chips-container {
  @apply flex flex-wrap gap-2.5 flex-1 overflow-hidden p-1;
  max-height: var(--channel-filter-max-height, 4.8rem);

  &.single-row {
    max-height: 2.25rem;
  }
}


.chip-count {
  @apply inline-flex items-center justify-center
    rounded-full px-1.5 min-w-[1.25rem] h-5
    text-xs font-normal bg-on-primary/10;
}

</style>
