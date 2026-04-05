<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton, DownloadIcon } from '../../../ui'
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
 downloadTemplate: []
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
      <table class="error-table">
        <thead>
          <tr>
            <th class="error-table__th error-table__th--row">Row</th>
            <th class="error-table__th error-table__th--col">Column</th>
            <th class="error-table__th">Issue</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(err, i) in rowErrors" :key="i" class="error-table__row">
            <td class="error-table__td error-table__td--row">{{ err.row }}</td>
            <td class="error-table__td error-table__td--col">{{ err.column }}</td>
            <td class="error-table__td">{{ err.issue }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Footer -->
  <div class="error-footer">
    <BaseButton variant="ghost" @click="emit('downloadTemplate')">
      <DownloadIcon />
      Download Template
    </BaseButton>

    <div class="error-footer__actions">
      <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
      <BaseButton variant="primary" @click="emit('back')">Back</BaseButton>
      <BaseButton
        v-if="validCampaigns.length > 0"
        variant="primary"
        @click="emit('proceed')"
      >
        Proceed with {{ validCampaigns.length }} valid
        {{ validCampaigns.length === 1 ? 'row' : 'rows' }}
      </BaseButton>
    </div>
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
  max-width: 800px;
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
  border: 1px solid var(--color-border);
  border-radius: theme('borderRadius.md');
  overflow: hidden;
  overflow-y: auto;
  max-height: 260px;
}

.error-table {
  width: 100%;
  border-collapse: collapse;
  font-size: theme('fontSize.sm');

  &__th {
    text-align: left;
    padding: theme('spacing.2') theme('spacing.3');
    font-size: theme('fontSize.xs');
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-secondary);
    background-color: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;

    &--row { width: 56px; }
    &--col { width: 110px; }
  }

  &__row {
    &:not(:last-child) td {
      border-bottom: 1px solid var(--color-border);
    }
  }

  &__td {
    padding: theme('spacing.2') theme('spacing.3');
    color: var(--color-text);
    vertical-align: top;

    &--row {
      color: var(--color-text-secondary);
      font-variant-numeric: tabular-nums;
    }

    &--col {
      font-weight: 500;
      color: #f43f5e;
    }
  }
}

// ── Footer ─────────────────────────────────────────────────────────────────────

.error-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: theme('spacing.3');
  padding: theme('spacing.4') theme('spacing.6');
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;

  &__actions {
    display: flex;
    align-items: center;
    gap: theme('spacing.6');
  }
}
</style>
