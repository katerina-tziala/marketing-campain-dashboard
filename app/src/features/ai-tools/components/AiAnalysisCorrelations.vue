<script setup lang="ts">
import type { Correlation } from '../types'

defineProps<{
  correlations: Correlation[]
}>()
</script>

<template>
  <section v-if="correlations.length" class="ai-section">
    <h4 class="ai-section__title">Correlations</h4>
    <div
      v-for="(corr, i) in correlations"
      :key="i"
      class="card-secondary"
    >
      <h5 class="card-secondary__title">{{ corr.finding }}</h5>
      <p class="card-secondary__content">{{ corr.implication }}</p>
    </div>
  </section>
</template>
