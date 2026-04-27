<script setup lang="ts">
import { ArrowUpIcon } from "../icons";

export type SortDir = "asc" | "desc";

export type DataTableColumn = {
  key: string;
  label: string;
  sortable?: boolean;
  ariaLabel?: string;
  class?: string;
};

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[];
    sortKey?: string;
    sortDir?: SortDir;
  }>(),
  {
    sortDir: "asc",
  },
);

const emit = defineEmits<{
  sort: [key: string];
}>();

function sortIconClass(key: string) {
  if (props.sortKey !== key) return {};
  return { asc: props.sortDir === "asc", desc: props.sortDir === "desc" };
}

function sortAriaLabel(col: DataTableColumn): string {
  const next =
    props.sortKey === col.key
      ? props.sortDir === "asc"
        ? "descending"
        : "ascending"
      : "ascending";
  return `Sort by ${(col.ariaLabel ?? col.label).toLowerCase()} ${next}`;
}
</script>

<template>
  <thead>
    <tr>
      <th
        v-for="col in columns"
        :key="col.key"
        :aria-label="!col.sortable && col.ariaLabel ? col.ariaLabel : undefined"
        :class="[
          col.sortable ? 'table-sortable-header' : 'table-header',
          col.class ?? '',
        ]"
      >
        <button
          v-if="col.sortable"
          type="button"
          class="sortable-button"
          :aria-label="sortAriaLabel(col)"
          @click="emit('sort', col.key)"
        >
          {{ col.label }}
          <span class="sort-icon-slot">
            <ArrowUpIcon class="sort-icon" :class="sortIconClass(col.key)" />
          </span>
        </button>
        <template v-else>{{ col.label }}</template>
      </th>
    </tr>
  </thead>
</template>

<style lang="scss" scoped>
.header-padding {
  @apply py-4 px-4;
}

th {
  @apply text-center capitalize font-semibold tracking-wider;

  &.left-alignment {
    @apply text-left;
  }
}

.sticky-header {
  th {
    @apply sticky top-0 z-10;
  }
}

.table-header {
  @extend .header-padding;
}

.sortable-button {
  @apply inline-flex
    items-center
    justify-center
    w-full
    cursor-pointer
    outline-none
    font-semibold 
    text-primary-lighter
    transition-transform
    duration-150
    border-4
    border-transparent
    py-3 px-4;

  .sort-icon {
    @apply text-base
      text-transparent
      inline-block
      transition-transform
      duration-150;

    &.desc {
      @apply text-primary-lighter rotate-180;
    }

    &.asc {
      @apply text-primary-lighter;
    }
  }
  &:hover,
  &:focus-visible {
    @apply bg-primary/15;
    .sort-icon {
      @apply text-primary-light;
    }
  }
}

.sort-icon-slot {
  @apply inline-flex w-0 h-4 overflow-visible relative;
}

.sort-icon {
  @apply absolute left-0.5 text-base text-transparent transition-transform duration-150;
}

.table-sortable-header {
  @apply border-b bg-surface-lift;

  &.left-alignment > .sortable-button {
    @apply justify-start pl-2.5;
  }
}

.table-header,
.table-sortable-header {
  @apply bg-surface-lift;
}

</style>
