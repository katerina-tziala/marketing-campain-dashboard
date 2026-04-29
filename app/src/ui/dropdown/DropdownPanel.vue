<script setup lang="ts">
defineProps<{
  ariaLabel?: string
}>()
</script>

<template>
  <div
    class="bg-surface-raised border rounded-md shadow-lg overflow-hidden"
    role="dialog"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>
