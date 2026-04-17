<script setup lang="ts">
import { computed } from 'vue'
import type { CsvCampaign, CsvRowError } from '../types'
import { getRowErrorSummaryWords } from '../utils/error-messages'
import DataErrorsTable from './validation/DataErrorsTable.vue'

const props = defineProps<{
  rowErrors: CsvRowError[]
  validCampaigns: CsvCampaign[]
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
const duplicateNote = computed(() => {
  if (props.duplicateGroupCount === 0) return ''
  const word = props.duplicateGroupCount === 1 ? 'name has' : 'names have'
  return `${props.duplicateGroupCount} campaign ${word} duplicate rows that will need to be resolved in the next step.`
})
</script>

<template>
  <!-- Body -->
  <div class="error-body">
    <p v-if="validCampaigns.length === 0 && duplicateGroupCount === 0" class="error-summary">
      <strong>{{ invalidRowCount }} {{ summaryWords.rowWord }}</strong>
      {{ summaryWords.verb }} errors and could not be imported.
      Please fix the issues below and upload the file again.
    </p>
    <p v-else class="error-summary">
      <strong>{{ invalidRowCount }} of {{ totalRows }} {{ summaryWords.totalRowWord }}</strong>
      {{ summaryWords.verb }} errors and
      {{ summaryWords.wasWord }} skipped.
      <template v-if="validCampaigns.length > 0">
        You can proceed with the
        <strong>{{ validCampaigns.length }} valid {{ summaryWords.validRowWord }}</strong>,
        or go back and fix the file.
      </template>
    </p>

    <p v-if="duplicateNote" class="error-duplicate-note">
      {{ duplicateNote }}
    </p>

    <DataErrorsTable :errors="rowErrors" />
  </div>

  <!-- Footer -->
  <div class="error-footer">
    <button
      v-if="showProceed"
      class="btn-secondary-outline error-footer__proceed"
      @click="emit('proceed')"
    >
      {{ proceedLabel }}
    </button>

    <button class="btn-secondary-outline error-footer__cancel" @click="emit('close')">Cancel</button>
    <button class="btn-primary error-footer__back" @click="emit('back')">Back</button>
  </div>
</template>

<style lang="scss" scoped>
// ── Body ───────────────────────────────────────────────────────────────────────

.error-body {
  padding: theme('spacing.6');
  display: flex;
  flex-direction: column;
  gap: theme('spacing.5');
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  width: 90vw;
  max-width: 640px;
}

// ── Summary ────────────────────────────────────────────────────────────────────

.error-summary {
  font-size: theme('fontSize.sm');
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
}

.error-duplicate-note {
  font-size: theme('fontSize.sm');
  color: var(--color-warning);
  line-height: 1.5;
  margin: 0;
}

// ── Footer ─────────────────────────────────────────────────────────────────────

.error-footer {
  display: flex;
  align-items: center;
  gap: theme('spacing.3');
  padding: theme('spacing.4') theme('spacing.6');
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;

  &__cancel {
    margin-left: auto;
  }

  @media (max-width: 479px) {
    flex-direction: column;
    padding: theme('spacing.4');

    .error-footer__back    { order: 1; }
    .error-footer__proceed { order: 2; }
    .error-footer__cancel  { order: 3; }

    .error-footer__back,
    .error-footer__proceed,
    .error-footer__cancel {
      width: 100%;
      margin-left: 0;
    }
  }
}
</style>
