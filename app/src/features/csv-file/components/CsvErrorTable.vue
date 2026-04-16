<script setup lang="ts">
import { computed } from 'vue'
import type { CsvRowError } from '../types'
import type { Campaign } from '../../../common/types/campaign'

const props = defineProps<{
  rowErrors: CsvRowError[]
  validCampaigns: Campaign[]
}>()

const emit = defineEmits<{
  back: []
  proceed: []
  close: []
}>()

const invalidRowCount = computed(() => new Set(props.rowErrors.map((e) => e.row)).size)
const totalRows = computed(() => invalidRowCount.value + props.validCampaigns.length)
</script>

<template>
  <!-- Body -->
  <div class="error-body">
    <p v-if="validCampaigns.length === 0" class="error-summary">
      <strong>{{ invalidRowCount }} {{ invalidRowCount === 1 ? 'row' : 'rows' }}</strong>
      {{ invalidRowCount === 1 ? 'contains' : 'contain' }} errors and could not be imported.
      Please fix the issues below and upload the file again.
    </p>
    <p v-else class="error-summary">
      <strong>{{ invalidRowCount }} of {{ totalRows }} {{ totalRows === 1 ? 'row' : 'rows' }}</strong>
      {{ invalidRowCount === 1 ? 'contains' : 'contain' }} errors and
      {{ invalidRowCount === 1 ? 'was' : 'were' }} skipped.
      You can proceed with the
      <strong>{{ validCampaigns.length }} valid {{ validCampaigns.length === 1 ? 'row' : 'rows' }}</strong>,
      or go back and fix the file.
    </p>

    <div class="error-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th class="data-table__th error-table__th error-table__th--row">Row</th>
            <th class="data-table__th error-table__th error-table__th--col">Column</th>
            <th class="data-table__th error-table__th">Issue</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(err, i) in rowErrors" :key="i" class="data-table__tr">
            <td class="data-table__td error-table__td--row">{{ err.row }}</td>
            <td class="data-table__td error-table__td--col">{{ err.column }}</td>
            <td class="data-table__td">{{ err.issue }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Footer -->
  <div class="error-footer">
    <button
      v-if="validCampaigns.length > 0"
      class="btn-secondary-outline error-footer__proceed"
      @click="emit('proceed')"
    >
      Proceed with valid rows
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

// ── Table ──────────────────────────────────────────────────────────────────────

.error-table-wrapper {
  // border: 1px solid var(--color-border);
  // border-radius: theme('borderRadius.md');
  overflow: hidden;
  overflow-y: auto;
  max-height: 260px;
}

.error-table__th {
  position: sticky;
  top: 0;

  &--row { width: 56px; }
  &--col { width: 110px; }
}

.error-table__td {
  &--row {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  &--col {
    font-weight: 500;
    color: #f43f5e;
  }
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
