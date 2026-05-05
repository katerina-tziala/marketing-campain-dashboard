<script setup lang="ts">
import { computed } from 'vue';

import type { Campaign } from '@/shared/data';
import { Badge, Button, ModalBody, ModalFooter } from '@/ui';

import type { CampaignDataRowError } from '../../../types';
import { getRowErrorSummaryWords } from '../../../utils';
import { DataErrorSummary, DuplicateSummary } from '../shared';
import DataErrorsTable from './DataErrorsTable.vue';

const props = defineProps<{
  rowErrors: CampaignDataRowError[];
  validCampaigns: Campaign[];
  duplicateGroupCount: number;
}>();

const emit = defineEmits<{
  back: [];
  proceed: [];
  close: [];
}>();

const invalidRowCount = computed(() => new Set(props.rowErrors.map((e) => e.row)).size);
const totalRows = computed(() => invalidRowCount.value + props.validCampaigns.length);
const summaryWords = computed(() =>
  getRowErrorSummaryWords(invalidRowCount.value, props.validCampaigns.length),
);
const showProceed = computed(
  () => props.validCampaigns.length > 0 || props.duplicateGroupCount > 0,
);
</script>

<template>
  <ModalBody>
    <div class="body-content">
      <div class="flex flex-col gap-4">
        <DataErrorSummary v-if="validCampaigns.length === 0 && duplicateGroupCount === 0">
          <template #title>Campaign data could not be imported</template>
          <template #badge>
            <Badge variant="danger">Invalid data</Badge>
          </template>
          <template #summary>
            <p>None of the rows could be imported because they contain errors.</p>
            <p>Please fix the issues below and upload the file again.</p>
          </template>
        </DataErrorSummary>

        <DataErrorSummary v-else>
          <template #title>Some rows contain errors</template>
          <template #badge>
            <Badge variant="warning">Partial import</Badge>
          </template>
          <template #summary>
            <p>
              <strong
                >{{ invalidRowCount }} of {{ totalRows }} {{ summaryWords.totalRowWord }}</strong
              >
              {{ summaryWords.verb }} errors and {{ summaryWords.wasWord }} skipped
            </p>
            <p>
              You can import the
              <strong>{{ validCampaigns.length }} valid {{ summaryWords.validRowWord }}</strong
              >, or go back and fix the file
            </p>
          </template>
        </DataErrorSummary>

        <DuplicateSummary
          v-if="duplicateGroupCount > 0"
          :count="duplicateGroupCount"
        />
      </div>
      <DataErrorsTable :errors="rowErrors" />
    </div>
  </ModalBody>
  <ModalFooter>
    <Button
      variant="outline"
      class="min-w-24 sm:mr-auto"
      @click="emit('close')"
      >Cancel</Button
    >
    <Button
      v-if="showProceed"
      variant="outline"
      @click="emit('proceed')"
      >Import valid rows</Button
    >

    <Button
      variant="primary"
      class="min-w-24"
      @click="emit('back')"
      >Fix file</Button
    >
  </ModalFooter>
</template>

<style lang="scss" scoped>
.body-content {
  @apply w-full
    max-w-full
    grid
    grid-rows-[min-content_1fr]
    grid-cols-1
    gap-4;
}
</style>
