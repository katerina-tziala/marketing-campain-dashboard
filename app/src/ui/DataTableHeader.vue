<script setup lang="ts">
import { ArrowUpIcon } from './icons'

export type SortDir = 'asc' | 'desc'

export type DataTableColumn = {
  key: string
  label: string
  sortable?: boolean
  ariaLabel?: string
  class?: string
}

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[]
    sticky?: boolean
    sortKey?: string
    sortDir?: SortDir
  }>(),
  {
    sticky: false,
    sortDir: 'asc',
  },
)

const emit = defineEmits<{
  sort: [key: string]
}>()

function sortIconClass(key: string) {
  if (props.sortKey !== key) return {}
  return { asc: props.sortDir === 'asc', desc: props.sortDir === 'desc' }
}

function sortAriaLabel(col: DataTableColumn): string {
  const next =
    props.sortKey === col.key
      ? props.sortDir === 'asc'
        ? 'descending'
        : 'ascending'
      : 'ascending'
  return `Sort by ${(col.ariaLabel ?? col.label).toLowerCase()} ${next}`
}
</script>

<template>
  <thead :class="{ 'data-table-sticky-header': sticky }">
    <tr>
      <th
        v-for="col in columns"
        :key="col.key"
        :aria-label="!col.sortable && col.ariaLabel ? col.ariaLabel : undefined"
        :class="[
          col.sortable ? 'data-table-sortable-header' : 'data-table-header',
          col.class ?? '',
        ]"
      >
        <button
          v-if="col.sortable"
          type="button"
          :aria-label="sortAriaLabel(col)"
          @click="emit('sort', col.key)"
        >
          {{ col.label }}
          <ArrowUpIcon class="sort-icon" :class="sortIconClass(col.key)" />
        </button>
        <template v-else>{{ col.label }}</template>
      </th>
    </tr>
  </thead>
</template>

<style lang="scss" scoped>

.data-table-header {
  @apply capitalize
    py-2 px-4
    font-semibold
    tracking-wider
    text-primary-300
    border-b
    border-primary-500
    bg-surface;
}

.data-table-sortable-header {
  @apply p-0 border-b border-primary-500;

  > button {
    @apply flex
      items-center
      gap-1.5
      cursor-pointer
      bg-transparent
      border-0
      py-3
      px-4
      text-center
      font-semibold
      text-primary-300
      transition-transform
      duration-150;

    &:not(:disabled) {
      &:hover,
      &:focus-visible {
        @apply bg-primary-500/15;
      }
    }

    .sort-icon {
      @apply text-base text-primary-100/40 inline-block transition-transform duration-150;

      &.desc {
        @apply text-primary-300 rotate-180;
      }

      &.asc {
        @apply text-primary-300;
      }
    }
  }
}

.data-table-sticky-header {
  .data-table-header,
  .data-table-sortable-header {
    @apply sticky top-0 z-10 bg-primary-1000;
  }
}
</style>
