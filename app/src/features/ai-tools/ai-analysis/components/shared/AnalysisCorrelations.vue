<script setup lang="ts">
import type { Correlation } from '../../../types'

defineProps<{
  correlations: Correlation[]
}>()
</script>

<template>
  <section v-if="correlations.length" class="ai-section">
    <h4 class="section-title">Correlations</h4>
    <div
      v-for="(corr, i) in correlations"
      :key="i"
      class="card-secondary"
    >
      <h5 class="card-title">{{ corr.finding }}</h5>
      <p class="card-content">{{ corr.implication }}</p>
    </div>
  </section>
</template>
