<script setup lang="ts">
import { computed } from "vue";
import { formatTimestamp } from "@/shared/utils";
import { MetaRow, MetaItem } from "@/ui";
import type { AiAnalysisNotice } from '../../../types';

const props = defineProps<{
  timestamp: number | null;
  modelDisplayName?: string | null;
  notice?: AiAnalysisNotice | null;
}>();

const formattedTime = computed(() =>
  props.timestamp ? formatTimestamp(props.timestamp) : null,
);
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
