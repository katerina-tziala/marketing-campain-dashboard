<script setup lang="ts">
defineProps<{
  label: string
  value: string | null | undefined
}>()
</script>

<template>
  <div
    class="card kpi-card"
    role="region"
    :aria-label="label"
  >
    <p class="card-head">{{ label }}</p> 
    <p class="kpi-value">{{ value ?? 'N/A' }}</p>
    <p v-if="$slots.secondary" class="kpi-secondary">
      <slot name="secondary" />
    </p>
  </div>
</template>

<style lang="scss" scoped>
.kpi-card {
  @apply w-full gap-1;
}

.kpi-value {
  @apply grow text-xl font-bold text-typography-intense; 
}

.kpi-secondary {
  @apply text-xs text-typography shrink-0;
}
</style>
