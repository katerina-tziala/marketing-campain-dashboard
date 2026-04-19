<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CsvCampaign, CsvDuplicateGroup } from '../../types'
import { DataTableHeader, CheckIcon } from '../../../../ui'
import type { DataTableColumn } from '../../../../ui'
import { formatCurrency, formatNumber } from '../../../../common/utils/formatters'

const props = defineProps<{
  duplicateGroups: CsvDuplicateGroup[]
}>()

const emit = defineEmits<{
  change: [selectedCampaigns: CsvCampaign[]]
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

const COLUMNS: DataTableColumn[] = [
  { key: 'select', label: '', ariaLabel: 'Select', class: 'w-9' },
  { key: 'rowNum', label: 'Row', sortable: true },
  { key: 'channel', label: 'Channel' },
  { key: 'budget', label: 'Budget' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'impressions', label: 'Impressions' },
  { key: 'conversions', label: 'Conversions', sortable: true },
  { key: 'revenue', label: 'Revenue', sortable: true },
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

function isSelected(campaignName: string, rowNum: number): boolean {
  return selections.value.get(campaignName) === rowNum
}

function isGroupSelected(campaignName: string): boolean {
  return selections.value.has(campaignName)
}

function selectRow(campaignName: string, rowNum: number): void {
  selections.value = new Map(selections.value).set(campaignName, rowNum)
  const selected: CsvCampaign[] = []
  for (const group of props.duplicateGroups) {
    const selectedRowNum = selections.value.get(group.campaignName)
    if (selectedRowNum !== undefined) {
      const entry = group.rows.find((r) => r.rowNum === selectedRowNum)
      if (entry) selected.push(entry)
    }
  }
  emit('change', selected)
}
</script>

<template>
  <div class="table-wrapper scrollbar-stable scrollbar-on-surface">
    <table class="data-table">
      <DataTableHeader
        :columns="COLUMNS"
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
                <CheckIcon class="group-check-icon" />
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
                />
              </span>
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
</template>

<style lang="scss" scoped>
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
