<script setup lang="ts">
import { computed } from "vue";
import type {
  PriorityAction,
  ActionUrgency,
} from "@/features/ai-tools/ai-analysis/types";
import type { BadgeVariant } from "@/ui/types/badge-variant";
import { Badge, Card, CardHeader } from "@/ui";
import AnalysisSection from "@/features/ai-tools/ai-analysis/components/shared/AnalysisSection.vue";

const props = defineProps<{
  actions: PriorityAction[];
}>();

const URGENCY_ORDER: Record<ActionUrgency, number> = {
  Immediate: 0,
  ThisQuarter: 1,
  NextQuarter: 2,
};

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

const sortedActions = computed(() =>
  [...props.actions].sort(
    (a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency],
  ),
);

function urgencyVariant(urgency: ActionUrgency): BadgeVariant {
  return URGENCY_VARIANT_MAP[urgency] ?? "info";
}
</script>

<template>
  <AnalysisSection title="Priority Actions">
    <Card v-for="(action, i) in sortedActions" :key="i" class="card-secondary">
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
  </AnalysisSection>
</template>
