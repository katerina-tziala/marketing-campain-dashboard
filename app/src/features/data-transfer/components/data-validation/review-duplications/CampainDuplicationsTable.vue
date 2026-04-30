<script setup lang="ts">
import { ref, computed } from "vue";
import type { Campaign } from "@/shared/types/campaign";
import type { CampainDataDuplicateGroup } from "@/features/data-transfer/types";
import {
  Table,
  TableHeader,
  TableGroupHeaderRow,
  TableSelectableRow,
  Badge,
  RadioItem,
} from "@/ui";
import type { DataTableColumn } from "@/ui";
import { formatCurrency, formatNumber } from "@/shared/utils/formatters";
import { useSort } from "@/shared/composables/useSort";
import { sortByValue } from "@/shared/utils/sorting";
import DuplicationsHeader from "./DuplicationsHeader.vue";

const props = withDefaults(
  defineProps<{
    duplicateGroups: CampainDataDuplicateGroup[];
    requiredSelection?: boolean;
  }>(),
  { requiredSelection: true },
);

const emit = defineEmits<{
  change: [selectedCampaigns: Campaign[]];
}>();

type SortKey = "rowId" | "conversions" | "revenue";

const { sortKey, sortDir, toggleSort } = useSort<SortKey>("rowId");

function handleSort(key: string): void {
  toggleSort(key as SortKey);
}

const COLUMNS: DataTableColumn[] = [
  { key: "select", label: "", ariaLabel: "Select", class: "w-9" },
  { key: "rowId", label: "Row", sortable: true },
  { key: "channel", label: "Channel" },
  { key: "budget", label: "Budget" },
  { key: "clicks", label: "Clicks" },
  { key: "impressions", label: "Impressions" },
  { key: "conversions", label: "Conversions", sortable: true },
  { key: "revenue", label: "Revenue", sortable: true },
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

function isSelected(campaignName: string, rowId: number): boolean {
  return selections.value.get(campaignName) === rowId;
}

function isGroupSelected(campaignName: string): boolean {
  return selections.value.has(campaignName);
}

function emitSelections(map: Map<string, number>): void {
  const selected: Campaign[] = [];
  for (const group of props.duplicateGroups) {
    const selectedRowId = map.get(group.campaignName);
    if (selectedRowId !== undefined) {
      const entry = group.rows.find((r) => r.rowId === selectedRowId);
      if (entry) selected.push(entry);
    }
  }
  emit("change", selected);
}

function selectRow(campaignName: string, rowId: number): void {
  const next = new Map(selections.value).set(campaignName, rowId);
  selections.value = next;
  emitSelections(next);
}

function clearGroupSelection(campaignName: string): void {
  const next = new Map(selections.value);
  next.delete(campaignName);
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
      class="sticky-header"
      :sort-key="sortKey"
      :sort-dir="sortDir"
      @sort="handleSort"
    />
    <tbody>
      <template v-for="group in sortedGroups" :key="group.campaignName">
        <TableGroupHeaderRow>
          <td colspan="8">
            <DuplicationsHeader
              :campaign-name="group.campaignName"
              :row-count="group.rows.length"
              :is-selected="isGroupSelected(group.campaignName)"
              :needs-attention-mode="needsAttentionMode"
              @clear="clearGroupSelection(group.campaignName)"
            />
          </td>
        </TableGroupHeaderRow>
        <TableSelectableRow
          v-for="entry in group.rows"
          :key="entry.rowId"
          :selected="isSelected(group.campaignName, entry.rowId)"
          @select="selectRow(group.campaignName, entry.rowId)"
        >
          <td class="cell-select">
            <RadioItem
              :name="`group-${group.campaignName}`"
              :value="entry.rowId"
              class="info"
              :checked="isSelected(group.campaignName, entry.rowId)"
              :aria-label="`Select row ${entry.rowId}`"
              @change="selectRow(group.campaignName, entry.rowId)"
            />
          </td>
          <td>{{ entry.rowId }}</td>
          <td>
            <Badge class="info dimmed">{{ entry.channel }}</Badge>
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
  :deep(.radio-item.info > input[type="radio"]:not(:disabled) + .radio-indicator) {
    @apply bg-surface-active border-info;
  }

  :deep(.radio-item.info > input[type="radio"]:checked:not(:disabled) + .radio-indicator::before) {
    @apply bg-info;
  }
}
</style>
