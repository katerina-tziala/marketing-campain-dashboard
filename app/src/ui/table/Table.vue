<script setup lang="ts"></script>

<template>
  <div class="scrollbar-stable scrollbar-on-surface table-container">
    <table>
      <slot />
    </table>
  </div>
</template>

<style lang="scss" scoped>
.table-container {
  @apply w-full max-w-full h-full overflow-auto;

  > table {
    @apply w-full
      text-sm
      border-separate
      border-spacing-0
      text-typography-soft
      relative;

    &:deep(td) {
      @apply p-2.5 text-center;

      &.left-alignment {
        @apply text-left;
      }
    }
  }
}

.table-container > table {
  &:deep(th) {
    @apply border-b;
  }
  &:deep(td) {
    @apply border-b border-b-subtle;
  }
}

.table-container > table :deep(tr:last-of-type > th) {
  @apply border-none;
}

  // .table-wrapper {
  //   @apply overflow-auto;
  // }
 
  // .data-table {
  //  @apply w-full text-sm border-separate border-spacing-0 bg-primary-ink;
  // }
 
  // .data-table-row {
  //   &:last-child {
  //     @apply border-b-0;
  //   } 
  // }


  // .data-table-sticky-header {
  //   .data-table-header,
  //   .data-table-sortable-header {
  //     @apply sticky top-0 z-10 bg-primary-ink;
  //   }
  // }

  // .data-table.stripped-odd {
  //  tr:nth-child(odd) { 
  //     @apply bg-primary-deep/5;
  //   }
  // }
 
  // .data-table.stripped-even  {
  //  tr:nth-child(even) {
  //     @apply bg-primary-deep/5;
  //   }
  // }
</style>
