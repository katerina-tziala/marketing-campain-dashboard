<script setup lang="ts">
import { computed } from 'vue'
import DataErrorSummary from './DataErrorSummary.vue'
import { Badge } from '@/ui'

const props = defineProps<{
  count: number
  variant?: 'notice' | 'resolve'
  hasValidCampaigns?: boolean
}>()

const groupWord = computed(() => (props.count === 1 ? 'campaign name' : 'campaign names'))
const verbWord = computed(() => (props.count === 1 ? 'appears' : 'appear'))
const nameHasWord = computed(() => (props.count === 1 ? 'name has' : 'names have'))
</script>

<template>
  <DataErrorSummary>
    <template #title>
       Duplicate campaign names detected 
    </template>
    <template #badge>
      <Badge v-if="variant === 'resolve' && !hasValidCampaigns" class="danger">Resolve duplicates</Badge>
      <Badge v-else class="warning">Duplicate data</Badge>
    </template>
    <template #summary>
      <template v-if="variant === 'resolve'">
        <p><strong>{{ count }} {{ groupWord }}</strong> {{ verbWord }} more than once in the file.</p>
        <p>Select one row from each group to include in the import. Groups without a selection will be skipped.</p>
        <p v-if="!hasValidCampaigns">Select at least one row to proceed.</p>
      </template>
      <template v-else>
        <p><strong>{{ count }} campaign {{ nameHasWord }}</strong> duplicate rows that will need to be resolved.</p>
        <p>You will be asked to resolve these duplicates in the next step.</p>
      </template>
    </template>
  </DataErrorSummary>
</template>
