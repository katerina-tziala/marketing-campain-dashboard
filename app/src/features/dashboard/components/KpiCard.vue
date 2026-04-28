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
    <h3 class="kpi-label">{{ label }}</h3>
    <p class="kpi-value">{{ value ?? 'N/A' }}</p>
    <p v-if="$slots.secondary" class="kpi-secondary">
      <slot name="secondary" />
    </p>
  </div>
</template>

<style lang="scss" scoped>
  .kpi-card {
    @apply p-3 w-full flex flex-col gap-0.5;
    @include cq-container('kpi-card');
  }

  .kpi-label {
    @apply text-xs font-medium text-typography-muted;
  }

  .kpi-value {
    @apply text-2xl font-semibold text-on-primary;

    @include cq-up(tiny, 'kpi-card') {
      @apply text-3xl;
    }
  }

  .kpi-secondary {
    @apply text-xs text-typography-soft flex flex-wrap items-baseline gap-x-1.5;
  }
</style>
