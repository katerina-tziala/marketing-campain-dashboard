<script setup lang="ts">
import { computed, ref } from 'vue';

import { useSort } from '@/shared/composables';
import type { Campaign } from '@/shared/data';
import { formatCurrency, formatNumber, sortByValue } from '@/shared/utils';
import {
  Badge,
  type DataTableColumn,
  RadioItem,
  Table,
  TableGroupHeaderRow,
  TableHeader,
  TableSelectableRow,
} from '@/ui';

import type { CampaignDataDuplicateGroup } from '../../../types';
import DuplicationsHeader from './DuplicationsHeader.vue';

const props = withDefaults(
  defineProps<{
    duplicateGroups: CampaignDataDuplicateGroup[];
    requiredSelection?: boolean;
  }>(),
  { requiredSelection: true },
);

const emit = defineEmits<{
  change: [selectedCampaigns: Campaign[]];
}>();

type SortKey = 'rowId' | 'conversions' | 'revenue';

const { sortKey, sortDir, toggleSort } = useSort<SortKey>('rowId');

function handleSort(key: string): void {
  toggleSort(key as SortKey);
}

const COLUMNS: DataTableColumn[] = [
  { key: 'select', label: '', ariaLabel: 'Select', class: 'w-9' },
  { key: 'rowId', label: 'Row', sortable: true },
  { key: 'channel', label: 'Channel' },
  { key: 'budget', label: 'Budget' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'impressions', label: 'Impressions' },
  { key: 'conversions', label: 'Conversions', sortable: true },
  { key: 'revenue', label: 'Revenue', sortable: true },
];

const sortedGroups = computed(() =>
  props.duplicateGroups.map((group) => ({
    ...group,
    rows: sortByValue(group.rows, (row) => row[sortKey.value], sortDir.value),
  })),
);

const selections = ref<Map<string, number>>(new Map());

const needsAttentionMode = computed(
  () => props.requiredSelection === true && selections.value.size === 0,
);

function isSelected(groupKey: string, rowId: number): boolean {
  return selections.value.get(groupKey) === rowId;
}

function isGroupSelected(groupKey: string): boolean {
  return selections.value.has(groupKey);
}

function emitSelections(map: Map<string, number>): void {
  const selected: Campaign[] = [];
  for (const group of props.duplicateGroups) {
    const selectedRowId = map.get(group.key);
    if (selectedRowId !== undefined) {
      const entry = group.rows.find((r) => r.rowId === selectedRowId);
      if (entry) {
        selected.push(entry);
      }
    }
  }
  emit('change', selected);
}

function selectRow(groupKey: string, rowId: number): void {
  const next = new Map(selections.value).set(groupKey, rowId);
  selections.value = next;
  emitSelections(next);
}

function clearGroupSelection(groupKey: string): void {
  const next = new Map(selections.value);
  next.delete(groupKey);
  selections.value = next;
  emitSelections(next);
}

function reset(): void {
  selections.value = new Map();
  emitSelections(selections.value);
}

defineExpose({ reset });
</script>

<template>
  <Table>
    <TableHeader
      :columns="COLUMNS"
      position="sticky"
      :sort-key="sortKey"
      :sort-dir="sortDir"
      @sort="handleSort"
    />
    <tbody>
      <template
        v-for="group in sortedGroups"
        :key="group.key"
      >
        <TableGroupHeaderRow>
          <td colspan="8">
            <DuplicationsHeader
              :campaign-name="group.campaignName"
              :row-count="group.rows.length"
              :is-selected="isGroupSelected(group.key)"
              :needs-attention-mode="needsAttentionMode"
              @clear="clearGroupSelection(group.key)"
            />
          </td>
        </TableGroupHeaderRow>
        <TableSelectableRow
          v-for="entry in group.rows"
          :key="entry.rowId"
          :selected="isSelected(group.key, entry.rowId)"
          @select="selectRow(group.key, entry.rowId)"
        >
          <td class="cell-select">
            <RadioItem
              :name="`group-${group.key}`"
              :value="entry.rowId"
              variant="info"
              :checked="isSelected(group.key, entry.rowId)"
              :aria-label="`Select row ${entry.rowId}`"
              @change="selectRow(group.key, entry.rowId)"
            />
          </td>
          <td>{{ entry.rowId }}</td>
          <td>
            <Badge
              variant="info"
              tone="dimmed"
              >{{ entry.channel }}</Badge
            >
          </td>
          <td>{{ formatCurrency(entry.budget) }}</td>
          <td>{{ formatNumber(entry.clicks) }}</td>
          <td>{{ formatNumber(entry.impressions) }}</td>
          <td>{{ formatNumber(entry.conversions) }}</td>
          <td>{{ formatCurrency(entry.revenue) }}</td>
        </TableSelectableRow>
      </template>
    </tbody>
  </Table>
</template>

<style lang="scss" scoped>
.table-selectable-row:hover {
  :deep(.radio-item.info > input[type='radio']:not(:disabled) + .radio-indicator) {
    @apply bg-surface-active
    	border-info;
  }

  :deep(.radio-item.info > input[type='radio']:checked:not(:disabled) + .radio-indicator::before) {
    @apply bg-info;
  }
}
</style>
