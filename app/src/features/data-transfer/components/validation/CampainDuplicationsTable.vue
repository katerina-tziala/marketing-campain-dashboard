<script setup lang="ts">
import { ref, computed } from "vue";
import type { Campaign } from "@/shared/types/campaign";
import type { CampainDataDuplicateGroup } from "@/features/data-transfer/types";
import {
  Table,
  TableHeader,
  AlertTriangleIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  Badge,
  Button,
  RadioItem,
} from "@/ui";
import type { DataTableColumn } from "@/ui";
import { formatCurrency, formatNumber } from "@/shared/utils/formatters";

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

const sortKey = ref<SortKey>("rowId");
const sortDir = ref<"asc" | "desc">("asc");

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

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
    rows: [...group.rows].sort((a, b) => {
      const dir = sortDir.value === "asc" ? 1 : -1;
      return (a[sortKey.value] - b[sortKey.value]) * dir;
    }),
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
        <tr class="group-header">
          <td colspan="8">
            <span class="group-title-row">
              <span class="group-title-text"
                >{{ group.campaignName }} ({{ group.rows.length }})</span
              >

              <Badge
                v-if="isGroupSelected(group.campaignName)"
                class="success dimmed"
              >
                <CheckIcon />
                Resolved
              </Badge>
              <Badge v-else-if="needsAttentionMode" class="danger">
                <AlertTriangleIcon />
                Needs Attention
              </Badge>
              <Badge v-else class="warning">
                <ClockIcon />
                Pending
              </Badge>
              <Button
                v-if="isGroupSelected(group.campaignName)"
                class="destructive small"
                @click.stop="clearGroupSelection(group.campaignName)"
              >
                <!-- <CloseIcon /> -->
                Clear selection
              </Button>
            </span>
          </td>
        </tr>
        <tr
          v-for="entry in group.rows"
          :key="entry.rowId"
          class="row-selectable"
          :class="{
            'row-selected': isSelected(group.campaignName, entry.rowId),
          }"
          @click="selectRow(group.campaignName, entry.rowId)"
        >
          <td class="cell-select">
            <RadioItem
              :name="`group-${group.campaignName}`"
              :value="entry.rowId"
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
        </tr>
      </template>
    </tbody>
  </Table>
</template>

<style lang="scss" scoped>
.group-header td {
  @apply py-3
    px-4
    text-sm
    font-medium
    tracking-wide
    text-typography/85
     bg-background/30
    border-b;
}

.group-title-row {
  @apply flex flex-wrap items-center gap-2;
}

.group-title-text {
  @apply min-w-0 break-words;
}

.cell-select {
  @apply text-center;
}

.row-selectable {
  @apply cursor-pointer;

  &:hover {
    @apply bg-primary-light/10;
  }

  &.row-selected {
    @apply bg-surface-raised;

    td {
      @apply text-typography-inverse;
    }
  }
}
</style>
