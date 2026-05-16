<script setup lang="ts">
defineProps<{
  activeTab: string;
}>();
</script>

<template>
  <div
    role="tabpanel"
    :aria-labelledby="`tab-${activeTab}`"
  >
    <slot :name="activeTab" />
  </div>
</template>
