<script setup lang="ts">
import { Badge, Card } from '@/ui';

import { AnalysisSection } from '../components';
import type { GrowthOutlook, GrowthOutlookLabel } from '../types';

import type { BadgeVariant } from '@/ui';

defineProps<{
  outlook: GrowthOutlook;
}>();

const GROWTH_OUTLOOK_VARIANT_MAP: Record<GrowthOutlookLabel, BadgeVariant> = {
  High: 'success',
  Moderate: 'opportunity',
  Limited: 'warning',
};

function growthOutlookVariant(label: GrowthOutlookLabel): BadgeVariant {
  return GROWTH_OUTLOOK_VARIANT_MAP[label] ?? 'info';
}
</script>

<template>
  <AnalysisSection
    v-if="outlook"
    title="Growth Outlook"
  >
    <Card
      variant="raised"
      class="growth-outlook-card"
    >
      <h5 class="pt-0.5">
        <Badge
          class="inline-action-float -mt-1"
          :variant="growthOutlookVariant(outlook.label)"
          tone="dimmed"
        >
          {{ outlook.label }}
        </Badge>
        {{ outlook.label }} growth potential
      </h5>
      <p>
        {{ outlook.reasoning }}
      </p>
    </Card>
  </AnalysisSection>
</template>

<style lang="scss" scoped>
.growth-outlook-card {
  @apply gap-2;
}
</style>
