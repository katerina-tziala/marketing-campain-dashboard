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
</style>
