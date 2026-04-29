<script setup lang="ts">
import { Card, MetaRow } from "@/ui";

defineProps<{
  label: string;
  value: string | null | undefined;
}>();
</script>

<template>
  <Card class="kpi-card">
    <h3 class="kpi-label">{{ label }}</h3>
    <p class="kpi-value">{{ value ?? "N/A" }}</p>
    <MetaRow v-if="$slots.default" class="kpi-meta divider primary-lighter">
      <slot />
    </MetaRow>
  </Card>
</template>

<style lang="scss" scoped>
.kpi-card {
  @apply p-3 w-full gap-1;
  // @include cq-container("kpi-card");
}

.kpi-label {
  @apply text-xs font-medium text-primary-lighter;
}

.kpi-value {
  @apply text-3xl font-semibold text-on-primary;

  // @include cq-up(tiny, "kpi-card") {
  //   @apply text-3xl;
  // }
}

.kpi-meta {
  @apply text-xs text-typography-soft;
}
</style>
