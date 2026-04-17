<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CsvCampaign, CsvDuplicateGroup } from '../types'
import DataErrorSummary from './validation/DataErrorSummary.vue'
import { DataTableHeader, CheckIcon } from '../../../ui'
import type { DataTableColumn } from '../../../ui'

const props = defineProps<{
  duplicateGroups: CsvDuplicateGroup[]
  validCampaigns: CsvCampaign[]
}>()

const emit = defineEmits<{
  back: []
  proceed: [selectedCampaigns: CsvCampaign[]]
  close: []
}>()

type SortKey = 'rowNum' | 'conversions' | 'revenue'

const sortKey = ref<SortKey>('rowNum')
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function handleSort(key: string): void {
  toggleSort(key as SortKey)
}

const columns: DataTableColumn[] = [
  { key: 'select', label: '', ariaLabel: 'Select', class: 'w-9' },
  { key: 'rowNum', label: 'Row', sortable: true },
  { key: 'channel', label: 'Channel', },
  { key: 'budget', label: 'Budget',  },
  { key: 'clicks', label: 'Clicks',  },
  { key: 'impressions', label: 'Impressions', },
  { key: 'conversions', label: 'Conversions', sortable: true,  },
  { key: 'revenue', label: 'Revenue', sortable: true,  },
]

const sortedGroups = computed(() =>
  props.duplicateGroups.map((group) => ({
    ...group,
    rows: [...group.rows].sort((a, b) => {
      const dir = sortDir.value === 'asc' ? 1 : -1
      return (a[sortKey.value] - b[sortKey.value]) * dir
    }),
  })),
)

const selections = ref<Map<string, number>>(new Map())

const groupWord = computed(() =>
  props.duplicateGroups.length === 1 ? 'campaign name' : 'campaign names',
)
const verbWord = computed(() =>
  props.duplicateGroups.length === 1 ? 'appears' : 'appear',
)

const resolvedCount = computed(() => selections.value.size)
const allResolved = computed(() => resolvedCount.value === props.duplicateGroups.length)

const canProceed = computed(
  () => props.validCampaigns.length > 0 || selections.value.size > 0,
)

function isSelected(campaignName: string, rowNum: number): boolean {
  return selections.value.get(campaignName) === rowNum
}

function isGroupSelected(campaignName: string): boolean {
  return selections.value.has(campaignName)
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
          <p>Select one row from each group to include in the import. Groups without a selection will be skipped.</p>
          <p  v-if="validCampaigns.length === 0">Select at least one row to proceed.</p>
        </template>
      </DataErrorSummary>
      <p class="resolve-indicator" :class="{ resolved: resolvedCount > 0 }">
        <span>Resolve duplicates ({{ resolvedCount }}/{{ duplicateGroups.length }})</span>
      </p>
      <div class="table-wrapper scrollbar-stable scrollbar-on-surface">
       <table class="data-table">
        <DataTableHeader
          :columns="columns"
          :sticky="true"
          :sort-key="sortKey"
          :sort-dir="sortDir"
          @sort="handleSort"
        />
        <tbody>
          <template v-for="group in sortedGroups" :key="group.campaignName">
            <tr class="group-header">
              <td colspan="8" :class="{ selected: isGroupSelected(group.campaignName) }">
               <span class="w-full flex items-center justify-start gap-2">
                 <CheckIcon class="group-check-icon"  />
                  <span>{{ group.campaignName }} ({{ group.rows.length }})</span>
               </span>
              </td>
            </tr>
            <tr
              v-for="entry in group.rows"
              :key="entry.rowNum"
              class="data-table-row row-selectable"
              :class="{ 'row-selected': isSelected(group.campaignName, entry.rowNum) }"
              @click="selectRow(group.campaignName, entry.rowNum)"
            >
              <td class="data-table-cell cell-select">
                  <span class="flex items-center justify-center">
                <input
                  type="radio"
                  :name="`group-${group.campaignName}`"
                  :value="entry.rowNum"
                  :checked="isSelected(group.campaignName, entry.rowNum)"
                  :aria-label="`Select row ${entry.rowNum}`"
                  @change="selectRow(group.campaignName, entry.rowNum)"
                /></span>
              </td>
              <td class="data-table-cell">{{ entry.rowNum }}</td>
              <td class="data-table-cell">
                <span class="badge info">{{ entry.channel }}</span>
              </td>
              <td class="data-table-cell">{{ formatCurrency(entry.budget) }}</td>
              <td class="data-table-cell">{{ formatNumber(entry.clicks) }}</td>
              <td class="data-table-cell">{{ formatNumber(entry.impressions) }}</td>
              <td class="data-table-cell">{{ formatNumber(entry.conversions) }}</td>
              <td class="data-table-cell">{{ formatCurrency(entry.revenue) }}</td>
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
    max-h-screen
    grid
    grid-cols-1
    grid-rows-[min-content_min-content_1fr]
    gap-6
    p-6
    h-fit
    max-h-[75vh]
    xs:max-h-[50vh];
}

.resolve-indicator {
  @apply flex items-center gap-2 text-sm font-semibold text-typography-subtle -mb-3;

  .resolve-indicator-icon {
    @apply text-base shrink-0;
  }

  &.resolved {
    @apply text-primary-400;
  }
}

.group-header td {
  @apply py-3
    px-4
    text-sm
    font-semibold
    tracking-wide
    text-typography-subtle
    bg-surface-secondary
    border-t
    border-b
    border-surface-border-secondary
    items-center
    gap-2;

  .group-check-icon {
    @apply text-base text-typography-subtle shrink-0;
  }

  &.selected {
    @apply text-primary-400;

    .group-check-icon {
      @apply text-primary-400;
    }
  }
}


.group-selection-count {
  @apply text-xs font-normal text-typography-subtle;

  &.selected {
    @apply text-indigo-400 font-medium;
  }
}

.cell-select {
  @apply text-center;

  input[type='radio'] {
    @apply inline-block cursor-pointer accent-indigo-500 w-5 h-5 m-0;
  }
}

.row-selectable {
  &.row-selected {
    @apply bg-primary-950;
    td {
      @apply font-semibold;
    }
  }
}

 .data-table-row {
    &:hover {
      @apply bg-primary-800/35;
    }
  }

</style>
