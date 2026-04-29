<script setup lang="ts"></script>

<template>
  <tr class="table-group-header-row">
    <slot />
  </tr>
</template>

<style lang="scss" scoped>
.table-group-header-row {
  :deep(td) {
    @apply py-3
      px-4
      text-sm
      font-medium
      tracking-wide
      text-typography-muted
      bg-background/30
      border-b
      !border-b-info-dark/40;
  }
}
</style>
