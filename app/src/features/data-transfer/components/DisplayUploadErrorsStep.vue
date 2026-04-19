<script setup lang="ts">
import { computed } from 'vue'
import type { Campaign } from '../../../common/types/campaign'
import type { CampainDataRowError } from '../types'
import { getRowErrorSummaryWords } from '../utils/error-messages'
import DataErrorsTable from './validation/DataErrorsTable.vue'
import DataErrorSummary from './validation/DataErrorSummary.vue'
import DuplicateSummary from './validation/DuplicateSummary.vue'

const props = defineProps<{
  rowErrors: CampainDataRowError[]
  validCampaigns: Campaign[]
  duplicateGroupCount: number
}>()

const emit = defineEmits<{
  back: []
  proceed: []
  close: []
}>()

const invalidRowCount = computed(() => new Set(props.rowErrors.map((e) => e.row)).size)
const totalRows = computed(() => invalidRowCount.value + props.validCampaigns.length)
const summaryWords = computed(() => getRowErrorSummaryWords(invalidRowCount.value, props.validCampaigns.length))
const showProceed = computed(() => props.validCampaigns.length > 0 || props.duplicateGroupCount > 0)
const proceedLabel = computed(() =>
  props.validCampaigns.length > 0 ? 'Proceed with valid rows' : 'Review duplicate campaigns',
)
</script>

<template>
  <!-- Body -->
  <div class="error-body">
    <div class="flex flex-col gap-4">
      <DataErrorSummary v-if="validCampaigns.length === 0 && duplicateGroupCount === 0">
        <template #title>Campaign data could not be imported</template>
        <template #badge>
          <span class="badge danger">Invalid data</span>
        </template>
        <template #summary>
          <p>None of the rows could be imported because they contain errors.</p>
          <p>Please fix the issues below and upload the file again.</p>
        </template>
      </DataErrorSummary>

      <DataErrorSummary v-else>
        <template #title>Some rows contain errors</template>
        <template #badge>
          <span class="badge warning">Partial import</span>
        </template>
        <template #summary>
          <p><strong>{{ invalidRowCount }} of {{ totalRows }} {{ summaryWords.totalRowWord }}</strong>
        {{ summaryWords.verb }} errors and
        {{ summaryWords.wasWord }} skipped.</p>
          <p>You can proceed with the <strong>{{ validCampaigns.length }} valid {{ summaryWords.validRowWord }}</strong>, or go back and fix the file.</p>
        </template>
      </DataErrorSummary>

      <DuplicateSummary v-if="duplicateGroupCount > 0" :count="duplicateGroupCount" />
    </div>
    <DataErrorsTable :errors="rowErrors" />
  </div>
  <div class="modal-footer">
    <button class="btn-primary min-w-24 xs:order-1" @click="emit('back')">Back</button>
    <button v-if="showProceed" class="btn-secondary-outline xs:order-3 xs:mr-auto" @click="emit('proceed')">{{ proceedLabel }}</button>
    <button class="btn-secondary-outline min-w-24 xs:order-2" @click="emit('close')">Cancel</button>
  </div>
</template>

<style lang="scss" scoped>
.error-body {
  @apply w-[90vw]
    max-w-3xl
    h-fit
    max-h-screen
    grid
    grid-cols-1
    grid-rows-[min-content_1fr]
    gap-6
    p-6
    max-h-[75vh]
    xs:max-h-[50vh];
}
</style>
