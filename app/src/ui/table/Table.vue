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

    :deep(th),
    :deep(td) {
      @apply whitespace-normal break-words;
    }
  }
}

.table-container > table {
  &:deep(th) {
    @apply border-b border-b-info-darker/50;
  }
  &:deep(td) {
    @apply border-b border-b-info-dark/15;
  }
}

.table-container > table {
  &:deep(tr:last-of-type > td) {
    @apply border-none;
  }
}

.table-container.stripped-odd > table :deep(tr:nth-child(odd)) {
  @apply bg-info-dark/5;
}

.table-container.stripped-even > table :deep(tr:nth-child(even)) {
  @apply bg-info-dark/5;
}

.table-container > table {
  &:deep(tr > th) {
    @apply bg-surface-elevated shadow-md;
  }
}
</style>
