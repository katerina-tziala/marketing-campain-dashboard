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
  	gap-4
  	text-sm;
}

.section-title {
  @apply font-semibold
  	m-0
  	text-primary-lighter
  	text-sm
  	tracking-wider;
}
</style>
