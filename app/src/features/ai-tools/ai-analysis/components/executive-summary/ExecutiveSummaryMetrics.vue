<script setup lang="ts">
import type { ExecutiveSummaryResponse } from '../../../types'
import { roiClass } from '../../../../../common/utils/roi'
import { formatEuro, formatRoi, formatNumber } from '../../../utils/panel-formatters'

defineProps<{
  metrics: ExecutiveSummaryResponse['key_metrics']
}>()

function classROI(value: number): string {
  return roiClass(Math.round(value * 100))
}
</script>

<template>
  <section class="ai-section">
    <h4 class="section-title">Key Metrics</h4>
    <div class="metrics-grid">
      <div class="card-secondary metric-card">
        <h5 class="card-title">Total Spend</h5>
        <span class="card-content">{{ formatEuro(metrics.total_spend) }}</span>
      </div>
      <div class="card-secondary metric-card">
        <h5 class="card-title">Total Revenue</h5>
        <p class="card-content roi-text" :class="classROI(metrics.overall_roi)">{{ formatEuro(metrics.total_revenue) }}</p>
      </div>
      <div class="card-secondary metric-card">
        <h5 class="card-title">Overall ROI</h5>
        <p class="card-content roi-text" :class="classROI(metrics.overall_roi)">{{ formatRoi(metrics.overall_roi) }}</p>
      </div>
      <div class="card-secondary metric-card">
        <h5 class="card-title">Conversions</h5>
        <p class="card-content">{{ formatNumber(metrics.total_conversions) }}</p>
      </div>
      <div class="card-secondary metric-card expandable">
        <h5 class="card-title badge-text success">Best Channel</h5>
        <p class="card-content">{{ metrics.best_channel }}</p>
      </div>
      <div class="card-secondary metric-card expandable">
        <h5 class="card-title badge-text danger">Worst Channel</h5>
        <p class="card-content">{{ metrics.worst_channel }}</p>
      </div>
      <div class="card-secondary metric-card col-span-2">
        <h5 class="card-title badge-text success">Best Campaign</h5>
        <p class="card-content">{{ metrics.best_campaign }}</p>
      </div>
      <div class="card-secondary metric-card col-span-2">
        <h5 class="card-title badge-text opportunity">Biggest Opportunity</h5>
        <p class="card-content">{{ metrics.biggest_opportunity }}</p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.metrics-grid {
  @apply grid grid-cols-2 auto-rows-auto gap-2;

  .metric-card {
    > .card-title {
      @apply shrink grow-0;
    }

    > .card-content {
      @apply grow shrink-0;
    }
  }

  @media (min-width: 1024px) {
    .expandable {
      @apply col-span-2;
    }
  }

  @media (max-width: 640px) {
    .expandable {
      @apply col-span-2;
    }
  }

  @media (max-width: 420px) {
    .metric-card {
      @apply col-span-2;
    }
  }
}
</style>
