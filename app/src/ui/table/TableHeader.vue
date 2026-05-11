<script setup lang="ts">
import { ArrowUpIcon } from '../icons';
import type { TableHeaderPosition } from './table.types';

export type SortDir = 'asc' | 'desc';

export type DataTableColumn = {
  key: string;
  label: string;
  title?: string;
  sortable?: boolean;
  ariaLabel?: string;
  visuallyHiddenLabel?: boolean;
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
    sortKey: undefined,
    sortDir: 'asc',
    position: 'static',
    verticalSeparators: false,
  },
);

const emit = defineEmits<{
  sort: [key: string];
}>();

function sortIconClass(key: string): Record<string, boolean> {
  if (props.sortKey !== key) {
    return {};
  }
  return { asc: props.sortDir === 'asc', desc: props.sortDir === 'desc' };
}

function sortAriaLabel(col: DataTableColumn): string {
  const next =
    props.sortKey === col.key
      ? props.sortDir === 'asc'
        ? 'descending'
        : 'ascending'
      : 'ascending';
  return `Sort by ${(col.ariaLabel ?? col.label).toLowerCase()} ${next}`;
}
</script>

<template>
  <thead :class="[`is-${props.position}`, { 'vertical-separators': props.verticalSeparators }]">
    <tr>
      <th
        v-for="col in columns"
        :key="col.key"
        :title="col.title"
        :aria-label="!col.sortable && col.ariaLabel ? col.ariaLabel : undefined"
        :class="[col.sortable ? 'table-sortable-header' : 'table-header', col.class ?? '']"
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
            <ArrowUpIcon
              class="sort-icon"
              :class="sortIconClass(col.key)"
          /></span>
        </button>
        <span
          v-else
          :class="{ 'sr-only': col.visuallyHiddenLabel }"
        >
          {{ col.label }}
        </span>
      </th>
    </tr>
  </thead>
</template>

<style lang="scss" scoped>
._header-padding {
  @apply p-2.5
  	py-3.5;
}

th {
  @extend ._header-padding;
  @apply break-words
  	capitalize
  	font-semibold
  	text-center
  	tracking-wider
  	whitespace-normal;

  &.left-alignment {
    @apply text-left;
  }
}

.table-sortable-header {
  @apply p-0;

  .sortable-button {
    @extend ._header-padding;
    @apply border-transparent
    	border-x-[1rem]
    	cursor-pointer
    	duration-150
    	inline-flex
    	items-center
    	justify-center
    	outline-none
    	transition-transform
    	w-full;
  }

  .button-content {
    @apply inline-flex
    	items-center
    	justify-between
    	relative
    	w-fit;

    .sort-icon {
      @apply -right-5
      	absolute
      	duration-150
      	inline-block
      	text-base
      	text-transparent
      	transition-transform;

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
      @apply pr-5
      	text-left
      	w-full;

      .sort-icon {
        @apply right-0;
      }
    }
  }
}

.is-sticky > tr > th {
  @apply sticky
  	top-0
  	z-10;
}

/* default theming */
th {
  @apply bg-surface-elevated
  	border-b
  	border-b-info/50
  	shadow-md
  	text-typography-subtle;
}

.sortable-button {
  @apply text-info-light/70;

  .sort-icon.desc,
  .sort-icon.asc {
    @apply text-info-light/70;
  }

  &:hover,
  &:focus-visible {
    @apply bg-info/[8%]
    	text-info-light;

    .sort-icon {
      @apply text-info-light;
    }
  }
}

.vertical-separators > tr > th:not(:last-of-type) {
  @apply border-r
  	border-r-info-dark/10;
}
</style>
