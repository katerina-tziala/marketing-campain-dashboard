<script setup lang="ts">
defineProps<{
  label: string
  value: string | null | undefined
  portfolioValue?: string | null
}>()
</script>

<template>
  <div
    class="card kpi-card"
    role="region"
    :aria-label="label"
  >
    <div class="kpi-header">
      <h5 class="card-title">{{ label }}</h5>
      <span v-if="portfolioValue != null" class="portfolio-value">{{ portfolioValue }}</span>
    </div>
    <div class="kpi-content">
      <p class="kpi-value">{{ value ?? 'N/A' }}</p>
      <p v-if="$slots.secondary" class="kpi-secondary">
        <slot name="secondary" />
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .kpi-card {
    @apply p-3 w-full gap-1;
    @include cq-container('kpi-card');
  }

  .kpi-header {
    @apply flex items-start justify-between gap-2 w-full;
  }

  .portfolio-value {
    @apply text-xs text-typography-muted shrink-0 font-normal leading-5 text-right;
  }

  .kpi-content {
    @apply w-full
    flex
    flex-nowrap
    items-center
    justify-start
    gap-0.5;

    .kpi-value {
      @apply shrink grow text-2xl font-medium text-on-primary;
    }

    @include cq-up(tiny, 'kpi-card') {
      .kpi-value {
        @apply text-3xl;
      }
    }
  }

  .kpi-secondary {
    @apply text-xs shrink flex flex-wrap items-center justify-end gap-x-1 gap-y-0;
  }

  .kpi-secondary :deep(span:first-of-type) {
    @apply w-full text-right text-typography-muted;
  }

  .kpi-secondary :deep(.sep) {
    @apply text-typography-muted;
  }
</style>
