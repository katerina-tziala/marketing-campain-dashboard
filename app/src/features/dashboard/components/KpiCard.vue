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
    <h5 class="card-title">{{ label }}</h5> 
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
    @apply text-xs shrink; 
  }

  .kpi-secondary :deep(span:first-of-type) {
    @apply block shrink grow w-full text-right;
  }

  .kpi-secondary :deep(span) { 
    @apply block w-fit shrink-0 text-right;
  }
</style>
