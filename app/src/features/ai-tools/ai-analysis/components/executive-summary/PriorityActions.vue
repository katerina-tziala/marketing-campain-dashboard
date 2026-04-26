<script setup lang="ts">
import type {
  PriorityAction,
  ActionUrgency,
} from "@/features/ai-tools/ai-analysis/types";
import type { BadgeVariant } from "@/ui/types/badge-variant";
import { Badge, Card, CardHeader } from "@/ui";

defineProps<{
  actions: PriorityAction[];
}>();

const URGENCY_VARIANT_MAP: Record<ActionUrgency, BadgeVariant> = {
  Immediate: "danger",
  ThisQuarter: "warning",
  NextQuarter: "info",
};

const URGENCY_LABEL_MAP: Record<ActionUrgency, string> = {
  Immediate: "Immediate",
  ThisQuarter: "This Quarter",
  NextQuarter: "Next Quarter",
};

function urgencyVariant(urgency: ActionUrgency): BadgeVariant {
  return URGENCY_VARIANT_MAP[urgency] ?? "info";
}
</script>

<template>
  <section class="ai-section">
    <h4 class="section-title">Priority Actions</h4>
    <Card v-for="(action, i) in actions" :key="i" class="card-secondary">
      <CardHeader>
        <span class="font-extrabold text-sm min-w-5 text-primary-soft"
          >#{{ action.priority }}</span
        >
        <h5 class="card-title">
          <Badge
            class="float-right ml-2 mb-1"
            :class="urgencyVariant(action.urgency)"
            >{{ URGENCY_LABEL_MAP[action.urgency] }}</Badge
          >
          {{ action.action }}
        </h5>
      </CardHeader>

      <p class="px-2">{{ action.expectedOutcome }}</p>
      <p class="w-full bg-primary/10 border-primary/25 py-1 px-2">
        <strong>Success metric:</strong> {{ action.successMetric }}
      </p>
    </Card>
  </section>
</template>
