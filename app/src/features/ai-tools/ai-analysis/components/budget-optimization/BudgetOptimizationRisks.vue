<script setup lang="ts">
import type { BudgetOptimizerResponse } from '../../../types'

defineProps<{
  risks: BudgetOptimizerResponse['risks']
}>()
</script>

<template>
  <section v-if="risks.length" class="ai-section">
    <h4 class="section-title">Risks & Mitigations</h4>
    <div
      v-for="(risk, i) in risks"
      :key="i"
      class="card-secondary"
    >
      <h5 class="card-title text-warning">{{ risk.risk }}</h5>
      <p class="card-content">
        <strong>Mitigation:</strong> {{ risk.mitigation }}
      </p>
    </div>
  </section>
</template>
