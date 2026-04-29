<script setup lang="ts"></script>

<template>
  <div class="scrollbar-stable scrollbar-info-on-surface table-container">
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
      border-separate
      border-spacing-0
      relative
      table-auto;

    &:deep(td) {
      @apply p-2.5 text-center whitespace-normal break-words;

      &.left-alignment {
        @apply text-left;
      }
    }
  }
}

/* default theming */
.table-container > table {
  @apply text-sm text-typography-soft;

  &:deep(tr:not(:last-of-type) > td) {
    @apply border-b border-b-info-dark/20;
  }
}

.table-container.striped-odd > table :deep(tr:nth-child(odd)) {
  @apply bg-info-dark/[7%];
}

.table-container.striped-even > table :deep(tr:nth-child(even)) {
  @apply bg-info-dark/[7%];
}

.table-container.vertical-separators > table :deep(tr > td:not(:last-of-type)) {
  @apply border-r border-x-info-dark/10;
}
</style>
