<script setup lang="ts">
import type { TableCellPadding, TableStriped } from './table.types';

const props = withDefaults(
  defineProps<{
    striped?: TableStriped;
    verticalSeparators?: boolean;
    cellPadding?: TableCellPadding;
  }>(),
  {
    striped: 'none',
    verticalSeparators: false,
    cellPadding: 'default',
  },
);
</script>

<template>
  <div
    class="scrollbar-info-on-surface table-container"
    :class="[
      `striped-${props.striped}`,
      `cell-padding-${props.cellPadding}`,
      { 'vertical-separators': props.verticalSeparators },
    ]"
  >
    <table>
      <slot />
    </table>
  </div>
</template>

<style lang="scss" scoped>
.table-container {
  @apply h-full
    max-w-full
    overflow-auto
    w-full;

  > table {
    @apply border-separate
      border-spacing-0
      relative
      table-auto
      w-full;

    &:deep(td) {
      @apply break-words
        p-2.5
        text-center
        whitespace-normal;

      &.left-alignment {
        @apply text-left;
      }
    }
  }
}

/* default theming */
.table-container > table {
  @apply text-sm
    text-typography-muted;

  &:deep(tr:not(:last-of-type) > td) {
    @apply border-b
      border-b-info-dark/20;
  }
}

.table-container.striped-odd > table :deep(tr:nth-child(odd)) {
  @apply bg-info-dark/[7%];
}

.table-container.striped-even > table :deep(tr:nth-child(even)) {
  @apply bg-info-dark/[7%];
}

.table-container.vertical-separators > table :deep(tr > td:not(:last-of-type)) {
  @apply border-r
    border-x-info-dark/10;
}

.table-container.cell-padding-none > table :deep(td) {
  padding: 0;
}
</style>
