<script setup lang="ts">
import { ArrowUpIcon } from "../icons";
import type { TableHeaderPosition } from "./table.types";

export type SortDir = "asc" | "desc";

export type DataTableColumn = {
  key: string;
  label: string;
  title?: string;
  sortable?: boolean;
  ariaLabel?: string;
  class?: string;
};

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[];
    sortKey?: string;
    sortDir?: SortDir;
    position?: TableHeaderPosition;
    verticalSeparators?: boolean;
  }>(),
  {
    sortDir: "asc",
    position: "static",
    verticalSeparators: false,
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
  <thead
    :class="[
      `is-${props.position}`,
      { 'vertical-separators': props.verticalSeparators },
    ]"
  >
    <tr>
      <th
        v-for="col in columns"
        :key="col.key"
        :title="col.title"
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
          :title="col.title"
          :aria-label="sortAriaLabel(col)"
          @click="emit('sort', col.key)"
        >
          <span class="button-content">
            {{ col.label }}
            <ArrowUpIcon class="sort-icon" :class="sortIconClass(col.key)"
          /></span>
        </button>
        <template v-else>{{ col.label }}</template>
      </th>
    </tr>
  </thead>
</template>

<style lang="scss" scoped>
._header-padding {
  @apply py-3.5 p-2.5;
}

th {
  @extend ._header-padding;
  @apply text-center whitespace-normal break-words capitalize font-semibold tracking-wider;

  &.left-alignment {
    @apply text-left;
  }
}

.table-sortable-header {
  @apply p-0;

  .sortable-button {
    @extend ._header-padding;
    @apply inline-flex
      items-center
      justify-center
      w-full
      cursor-pointer
      outline-none
      transition-transform
      duration-150
      border-transparent
      border-x-[1rem];
  }

  .button-content {
    @apply inline-flex
    items-center
    justify-between
    relative
    w-fit;

    .sort-icon {
      @apply inline-block
      absolute
      -right-5
      text-base
      text-transparent
      transition-transform
      duration-150;

      &.desc {
        @apply rotate-180;
      }
    }
  }

  &.left-alignment {
    .sortable-button {
      @apply border-x-0;
    }

    .button-content {
      @apply w-full text-left pr-5;

      .sort-icon {
        @apply right-0;
      }
    }
  }
}

.is-sticky > tr > th {
  @apply sticky top-0 z-10;
}

/* default theming */
th {
  @apply border-b border-b-info/50 bg-surface-elevated shadow-md text-typography-subtle;
}

.sortable-button {
  @apply text-info-light/70;

  .sort-icon.desc,
  .sort-icon.asc {
    @apply text-info-light/70;
  }

  &:hover,
  &:focus-visible {
    @apply text-info-light bg-info/[8%];

    .sort-icon {
      @apply text-info-light;
    }
  }
}

.vertical-separators > tr > th:not(:last-of-type) {
  @apply border-r border-r-info-dark/10;
}
</style>
