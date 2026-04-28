<script setup lang="ts">
import { computed } from "vue";
import type { AiAnalysisNotice } from "@/features/ai-tools/types";
import { APP_LOCALE } from "@/shared/utils/formatters";
import { MetaRow, MetaItem } from "@/ui";

const props = defineProps<{
  timestamp: number | null;
  modelDisplayName?: string | null;
  notice?: AiAnalysisNotice | null;
}>();

const formattedTime = computed(() => {
  if (!props.timestamp) return null;
  return new Date(props.timestamp).toLocaleString(APP_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
});
</script>

<template>
  <MetaRow class="divider tiny info italic text-typography-muted py-3">
    <MetaItem v-if="formattedTime">
      Generated at {{ formattedTime
      }}<template v-if="modelDisplayName"> with {{ modelDisplayName }}</template>
    </MetaItem>
    <MetaItem>AI can make mistakes</MetaItem>
    <MetaItem v-if="notice">Latest request failed (Previous result)</MetaItem>
  </MetaRow>
</template>
