<script setup lang="ts">
defineProps<{
  selected?: boolean;
}>();

const emit = defineEmits<{
  select: [];
}>();
</script>

<template>
  <tr
    class="table-selectable-row"
    :class="{ selected }"
    @click="emit('select')"
  >
    <slot />
  </tr>
</template>

<style lang="scss" scoped>
.table-selectable-row {
  @apply cursor-pointer;

  &.selected {
    @apply bg-surface-active;
    @apply bg-info-darker/10;

    :deep(td) {
      @apply font-medium
      	text-typography-inverse;
    }
  }

  &:hover {
    @apply bg-info-lighter/10
    	text-typography;
  }
}
</style>
