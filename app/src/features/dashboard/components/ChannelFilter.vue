<script setup lang="ts">
defineProps<{
  channels: string[]
  selected: string[]
}>()

const emit = defineEmits<{
  toggle: [channel: string]
  clearAll: []
}>()
</script>

<template>
  <div class="channel-filter" role="group" aria-label="Filter by channel">
    <button
      class="btn-icon-secondary filter-btn"
      :class="selected.length === 0 ? 'active' : 'inactive'" 
      @click="emit('clearAll')"
    >
      All
    </button>
    <button
      v-for="channel in channels"
      :key="channel"
      class="btn-icon-secondary filter-btn"
      :class="selected.includes(channel) ? 'active' : 'inactive'"
      :aria-pressed="selected.includes(channel)"
      @click="emit('toggle', channel)"
    >
      {{ channel }}
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
  px-3
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
    focus-within:border-primary-400;
  }
}
</style>
