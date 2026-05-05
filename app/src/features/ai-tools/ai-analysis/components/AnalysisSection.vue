<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <section class="analysis-section">
    <h4 class="section-title">{{ title }}</h4>
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.analysis-section {
  @apply flex
    flex-col
    gap-3
    text-sm;
}

.section-title {
  @apply text-sm
    font-semibold
    tracking-wider
    m-0
    text-primary-lighter;
}
</style>
