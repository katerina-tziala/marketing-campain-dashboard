<script setup lang="ts">
import { Card } from "@/ui";

defineProps<{
  instructions: { title: string; steps: string[]; note?: string };
}>();
</script>

<template>
  <Card class="secondary bg-surface-secondary/50 mt-2">
    <h5 class="card-title text-primary-lighter">{{ instructions.title }}</h5>
    <ol class="help-steps">
      <li v-for="step in instructions.steps" :key="step">{{ step }}</li>
    </ol>
    <p v-if="instructions.note" class="help-note">{{ instructions.note }}</p>
    <p class="text-sm">Keep your API key private and never share it publicly</p>
  </Card>
</template>

<style lang="scss" scoped>
.help-steps {
  @apply text-sm text-typography list-inside list-decimal leading-5 px-1;

  > li {
    @apply py-1;
  }
}
</style>
