<script setup lang="ts">
import { computed } from 'vue';

import { formatTimestamp } from '@/shared/utils';
import { MetaItem, MetaRow } from '@/ui';

import type { AiAnalysisNotice } from '../types';

const props = defineProps<{
  timestamp: number | null;
  modelDisplayName?: string | null;
  notice?: AiAnalysisNotice | null;
}>();

const formattedTime = computed(() => (props.timestamp ? formatTimestamp(props.timestamp) : null));
</script>

<template>
  <MetaRow
    separator="bullet"
    size="tiny"
    tone="info"
    class="mt-auto italic text-typography-muted"
  >
    <MetaItem v-if="formattedTime">
      Generated at {{ formattedTime
      }}<template v-if="modelDisplayName"> with {{ modelDisplayName }}</template>
    </MetaItem>
    <MetaItem>AI can make mistakes</MetaItem>
    <MetaItem v-if="notice">Latest request failed (Previous result)</MetaItem>
  </MetaRow>
</template>
