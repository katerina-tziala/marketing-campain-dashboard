<script setup lang="ts"></script>

<template>
  <tr class="table-group-header-row">
    <slot />
  </tr>
</template>

<style lang="scss" scoped>
.table-group-header-row {
  :deep(td) {
    @apply bg-background/30
      border-b
      border-b-info-dark/40
      font-medium
      px-4
      py-3
      text-sm
      text-typography-muted
      tracking-wide;
  }
}
</style>
