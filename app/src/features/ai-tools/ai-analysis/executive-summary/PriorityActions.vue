<script setup lang="ts">
import { Card, CardHeader } from "@/ui";
import type { KeyPriority } from '../types';
import { AnalysisSection } from "../ui";

defineProps<{
  priorities: KeyPriority[];
}>();
</script>

<template>
  <AnalysisSection title="Key Priorities">
    <Card
      v-for="(priority, i) in priorities"
      :key="i"
      variant="secondary"
    >
      <CardHeader>
        <span class="font-extrabold text-sm min-w-5 text-primary-soft">#{{ priority.priority }}</span>
        <h5 class="card-title">{{ priority.title }}</h5>
      </CardHeader>
      <p class="px-2 text-typography-soft text-sm">{{ priority.rationale }}</p>
      <p class="w-full py-1 px-2">{{ priority.expectedOutcome }}</p>
    </Card>
  </AnalysisSection>
</template>
