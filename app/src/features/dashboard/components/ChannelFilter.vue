<script setup lang="ts">
import type { Channel } from '@/shared/types/channel'
import { useCampaignStore } from '@/stores/campaign.store'

const props = defineProps<{
  channels: Channel[]
}>()

const store = useCampaignStore()

function toggle(channelId: string): void {
  const current = store.selectedChannelsIds
  const next = current.includes(channelId)
    ? current.filter(id => id !== channelId)
    : [...current, channelId]
  store.setChannelFilter(next.length === props.channels.length ? [] : next)
}
</script>

<template>
  <div class="channel-filter" role="group" aria-label="Filter by channel">
    <button
      class="btn-secondary filter-btn all"
      :class="store.selectedChannelsIds.length === 0 ? 'active' : 'inactive'"
      @click="store.setChannelFilter([])"
    >
      All
    </button>
    <button
      v-for="channel in channels"
      :key="channel.id"
      class="btn-secondary filter-btn"
      :class="store.selectedChannelsIds.includes(channel.id) ? 'active' : 'inactive'"
      :aria-pressed="store.selectedChannelsIds.includes(channel.id)"
      @click="toggle(channel.id)"
    >
      {{ channel.name }}
      <span class="filter-count">{{ channel.campaigns.length }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.channel-filter {
  @apply flex flex-wrap items-center gap-2.5;
}

.filter-btn {
  @apply rounded-full
  border-2 
  pr-1
  pl-2
  py-1
  text-sm
  font-medium
  transition-colors
  outline-none;

  &.active {
    @apply border-primary-500 bg-primary-500 text-white;
  }

  &.inactive {
    @apply border-surface-border
    bg-surface
    text-typography-subtle
    hover:border-primary-400
    focus-visible:border-primary-400;
  }

  &.all {
    @apply px-3;
  }
}

.filter-count {
  @apply inline-flex items-center justify-center
  rounded-full
  px-1.5
  min-w-[1.25rem]
  h-5
  text-xs
  font-normal
  bg-white/10;
}
</style>
