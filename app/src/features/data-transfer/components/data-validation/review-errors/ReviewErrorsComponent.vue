<script setup lang="ts">
import { computed } from "vue";
import type { Campaign } from "@/shared/types/campaign";
import type { CampainDataRowError } from "@/features/data-transfer/types";
import { getRowErrorSummaryWords } from "@/features/data-transfer/utils/error-messages";
import {
  DataErrorSummary,
  DuplicateSummary,
} from "@/features/data-transfer/components/data-validation/shared";
import DataErrorsTable from "./DataErrorsTable.vue";
import { Badge, Button, ModalFooter, ModalBody } from "@/ui";

const props = defineProps<{
  rowErrors: CampainDataRowError[];
  validCampaigns: Campaign[];
  duplicateGroupCount: number;
}>();

const emit = defineEmits<{
  back: [];
  proceed: [];
  close: [];
}>();

const invalidRowCount = computed(
  () => new Set(props.rowErrors.map((e) => e.row)).size,
);
const totalRows = computed(
  () => invalidRowCount.value + props.validCampaigns.length,
);
const summaryWords = computed(() =>
  getRowErrorSummaryWords(invalidRowCount.value, props.validCampaigns.length),
);
const showProceed = computed(
  () => props.validCampaigns.length > 0 || props.duplicateGroupCount > 0,
);
const proceedLabel = computed(() =>
  props.validCampaigns.length > 0
    ? "Proceed with valid rows"
    : "Review duplicate campaigns",
);
</script>

<template>
  <!-- Body -->
  <ModalBody class="error-body">
    <div class="flex flex-col gap-4">
      <DataErrorSummary
        v-if="validCampaigns.length === 0 && duplicateGroupCount === 0"
      >
        <template #title>Campaign data could not be imported</template>
        <template #badge>
          <Badge class="danger">Invalid data</Badge>
        </template>
        <template #summary>
          <p>None of the rows could be imported because they contain errors.</p>
          <p>Please fix the issues below and upload the file again.</p>
        </template>
      </DataErrorSummary>

      <DataErrorSummary v-else>
        <template #title>Some rows contain errors</template>
        <template #badge>
          <Badge class="warning">Partial import</Badge>
        </template>
        <template #summary>
          <p>
            <strong
              >{{ invalidRowCount }} of {{ totalRows }}
              {{ summaryWords.totalRowWord }}</strong
            >
            {{ summaryWords.verb }} errors and
            {{ summaryWords.wasWord }} skipped.
          </p>
          <p>
            You can proceed with the
            <strong
              >{{ validCampaigns.length }} valid
              {{ summaryWords.validRowWord }}</strong
            >, or go back and fix the file.
          </p>
        </template>
      </DataErrorSummary>

      <DuplicateSummary
        v-if="duplicateGroupCount > 0"
        :count="duplicateGroupCount"
      />
    </div>
    <DataErrorsTable :errors="rowErrors" />
  </ModalBody>
  <ModalFooter>
    <Button class="primary min-w-24 xs:order-1" @click="emit('back')"
      >Back</Button
    >
    <Button
      v-if="showProceed"
      class="outline xs:order-3 xs:mr-auto"
      @click="emit('proceed')"
      >{{ proceedLabel }}</Button
    >
    <Button class="outline min-w-24 xs:order-2" @click="emit('close')"
      >Cancel</Button
    >
  </ModalFooter>
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
