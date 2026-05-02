<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/ui'
import DataErrorSummary from './DataErrorSummary.vue'

const props = defineProps<{
  count: number
  variant?: 'notice' | 'resolve'
  hasValidCampaigns?: boolean
}>()

const words = computed(() => {
  const singular = props.count === 1
  return {
    group: singular ? 'campaign name' : 'campaign names',
    verb: singular ? 'appears' : 'appear',
    nameHas: singular ? 'name has' : 'names have',
  }
})
</script>

<template>
  <DataErrorSummary>
    <template #title>
       Duplicate campaign names detected
    </template>
    <template #badge>
      <Badge v-if="variant === 'resolve' && !hasValidCampaigns" variant="danger">Resolve duplicates</Badge>
      <Badge v-else variant="warning">Duplicate data</Badge>
    </template>
    <template #summary>
      <template v-if="variant === 'resolve'">
        <p><strong>{{ count }} {{ words.group }}</strong> {{ words.verb }} more than once in the file.</p>
        <p>Select one row from each group to include in the import. Groups without a selection will not be imported.</p>
        <p v-if="!hasValidCampaigns">Select at least one row to proceed.</p>
      </template>
      <template v-else>
        <p><strong>{{ count }} campaign {{ words.nameHas }}</strong> duplicate rows that will need to be resolved</p>
        <p>You will be asked to resolve these duplicates in the next step</p>
      </template>
    </template>
  </DataErrorSummary>
</template> 