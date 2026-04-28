<script setup lang="ts">
defineProps<{
  ariaLabel?: string
}>()
</script>

<template>
  <div
    class="bg-surface-raised border rounded-md shadow-lg overflow-hidden pb-2"
    role="dialog"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>
