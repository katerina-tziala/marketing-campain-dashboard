<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CsvCampaign, CsvDuplicateGroup } from '../types'
import DataErrorSummary from './validation/DataErrorSummary.vue';

const props = defineProps<{
  duplicateGroups: CsvDuplicateGroup[]
  validCampaigns: CsvCampaign[]
}>()

const emit = defineEmits<{
  back: []
  proceed: [selectedCampaigns: CsvCampaign[]]
  close: []
}>()

const selections = ref<Map<string, number>>(new Map())

const groupWord = computed(() =>
  props.duplicateGroups.length === 1 ? 'campaign name' : 'campaign names',
)
const verbWord = computed(() =>
  props.duplicateGroups.length === 1 ? 'appears' : 'appear',
)

const canProceed = computed(
  () => props.validCampaigns.length > 0 || selections.value.size > 0,
)

function isSelected(campaignName: string, rowNum: number): boolean {
  return selections.value.get(campaignName) === rowNum
}

function selectRow(campaignName: string, rowNum: number): void {
  selections.value = new Map(selections.value).set(campaignName, rowNum)
}

function formatCurrency(value: number): string {
  return `€${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

function handleProceed(): void {
  const selected: CsvCampaign[] = []
  for (const group of props.duplicateGroups) {
    const selectedRowNum = selections.value.get(group.campaignName)
    if (selectedRowNum !== undefined) {
      const entry = group.rows.find((r) => r.rowNum === selectedRowNum)
      if (entry) selected.push(entry)
    }
  }
  emit('proceed', selected)
}
</script>

<template>
  <div class="duplicate-body">
      <DataErrorSummary>
        <template #title>Duplicate campaign names detected</template>
        <template #badge>
          <span  v-if="validCampaigns.length === 0" class="badge danger">Resolve duplicates</span>
          <span v-else class="badge warning">Duplicate data</span>
        </template>
        <template #summary>
          <p><strong>{{ duplicateGroups.length }} {{ groupWord }}</strong>
      {{ verbWord }} more than once in the file.</p>
          <p>Select one row per group to include in the import. Groups without a selection will be skipped.</p>
          <p  v-if="validCampaigns.length === 0">Select at least one row to proceed.</p>
        </template>
      </DataErrorSummary> 
 
    <div class="duplicate-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th class="data-table-header duplicate-table__th--select" aria-label="Select"></th>
            <th class="data-table-header duplicate-table__th--row">Row</th>
            <th class="data-table-header duplicate-table__th--channel">Channel</th>
            <th class="data-table-header duplicate-table__th--num">Budget</th>
            <th class="data-table-header duplicate-table__th--num">Clicks</th>
            <th class="data-table-header duplicate-table__th--num">Impressions</th>
            <th class="data-table-header duplicate-table__th--num">Conversions</th>
            <th class="data-table-header duplicate-table__th--num">Revenue</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in duplicateGroups" :key="group.campaignName">
            <tr class="duplicate-table__group-header">
              <td colspan="8">{{ group.campaignName }}</td>
            </tr>
            <tr
              v-for="entry in group.rows"
              :key="entry.rowNum"
              class="data-table-row duplicate-table__row"
              :class="{ 'duplicate-table__row--selected': isSelected(group.campaignName, entry.rowNum) }"
              @click="selectRow(group.campaignName, entry.rowNum)"
            >
              <td class="data-table-cell duplicate-table__td--select">
                <input
                  type="radio"
                  :name="`group-${group.campaignName}`"
                  :value="entry.rowNum"
                  :checked="isSelected(group.campaignName, entry.rowNum)"
                  :aria-label="`Select row ${entry.rowNum}`"
                  @change="selectRow(group.campaignName, entry.rowNum)"
                />
              </td>
              <td class="data-table-cell duplicate-table__td--row">{{ entry.rowNum }}</td>
              <td class="data-table-cell">
                <span class="badge opportunity">{{ entry.channel }}</span>
              </td>
              <td class="data-table-cell duplicate-table__td--num">{{ formatCurrency(entry.budget) }}</td>
              <td class="data-table-cell duplicate-table__td--num">{{ formatNumber(entry.clicks) }}</td>
              <td class="data-table-cell duplicate-table__td--num">{{ formatNumber(entry.impressions) }}</td>
              <td class="data-table-cell duplicate-table__td--num">{{ formatNumber(entry.conversions) }}</td>
              <td class="data-table-cell duplicate-table__td--num">{{ formatCurrency(entry.revenue) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Footer -->
  <div class="modal-footer">
    <button class="btn-primary min-w-24 xs:order-1" @click="emit('back')">Back</button>
    <button  class="btn-secondary-outline xs:order-3 xs:mr-auto" :disabled="!canProceed" @click="handleProceed">Proceed with selection</button>
    <button class="btn-secondary-outline min-w-24 xs:order-2" @click="emit('close')">Cancel</button>
  </div>
</template>

<style lang="scss" scoped>
// ── Body ───────────────────────────────────────────────────────────────────────
.duplicate-body {
  @apply w-[90vw]
    max-w-4xl
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

// ── Summary ────────────────────────────────────────────────────────────────────

.duplicate-summary {
  font-size: theme('fontSize.sm');
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
}

.duplicate-notice {
  font-size: theme('fontSize.sm');
  color: var(--color-warning);
  line-height: 1.5;
  margin: 0;
}

// ── Table ──────────────────────────────────────────────────────────────────────

.duplicate-table-wrapper {
  overflow: auto;
  max-height: 320px;
}

.duplicate-table__group-header td {
  padding: theme('spacing.2') theme('spacing.3');
  font-size: theme('fontSize.xs');
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  background-color: var(--color-surface-secondary);
  border-top: 1px solid var(--color-border-secondary);
  border-bottom: 1px solid var(--color-border-secondary);
}

.duplicate-table__row {
  cursor: pointer;

  &--selected {
    background-color: color-mix(in srgb, theme('colors.indigo.500') 8%, transparent);

    td {
      border-top-color: color-mix(in srgb, theme('colors.indigo.500') 20%, transparent);
      border-bottom-color: color-mix(in srgb, theme('colors.indigo.500') 20%, transparent);
    }
  }

  &:hover:not(&--selected) {
    background-color: var(--color-surface-secondary);
  }
}

.duplicate-table__th {
  &--select  { width: 36px; }
  &--row     { width: 56px; }
  &--channel { width: 120px; }
  &--num     { width: 90px; text-align: right; }
}

.duplicate-table__td {
  &--select {
    text-align: center;

    input[type='radio'] {
      accent-color: theme('colors.indigo.500');
      cursor: pointer;
      width: 15px;
      height: 15px;
    }
  }

  &--row {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  &--num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
}
</style>
