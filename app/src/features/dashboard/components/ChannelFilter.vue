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
      class="filter-btn"
      :class="selected.length === 0 ? 'filter-btn--active' : 'filter-btn--inactive'"
      @click="emit('clearAll')"
    >
      All
    </button>

    <button
      v-for="channel in channels"
      :key="channel"
      class="filter-btn"
      :class="selected.includes(channel) ? 'filter-btn--active' : 'filter-btn--inactive'"
      :aria-pressed="selected.includes(channel)"
      @click="emit('toggle', channel)"
    >
      {{ channel }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.channel-filter {
  @apply flex flex-wrap items-center gap-2;
}

.filter-btn {
  @apply rounded-full border px-3 py-1 text-sm font-medium transition-colors
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2;

  &--active {
    @apply border-primary-400 bg-primary-500 text-white;
  }

  &--inactive {
    border-color: var(--color-border);
    background-color: var(--color-surface);
    color: var(--color-text-secondary);

    &:hover {
      border-color: theme('colors.primary.400');
      color: var(--color-text);
    }
  }
}
</style>
