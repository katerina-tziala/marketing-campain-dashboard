<script setup lang="ts">
import { computed, ref } from "vue";
import type { CampaignPerformance } from "@/shared/types/campaign";
import { TableHeader, Badge, Table } from "@/ui";
import type { DataTableColumn, SortDir } from "@/ui";
import {
  formatCompactNumber,
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "@/shared/utils/formatters";
import { sortWithNullsLast } from "@/shared/utils/sorting";
import RoiIndicator from "./RoiIndicator.vue";

const props = defineProps<{ campaigns: CampaignPerformance[] }>();

type SortField = keyof CampaignPerformance;

const sortField = ref<SortField>("revenue");
const sortDir = ref<SortDir>("desc");

function toggleSort(field: string) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field as SortField;
    sortDir.value = "desc";
  }
}

function getFieldValue(
  c: CampaignPerformance,
  field: SortField,
): number | string | null {
  return c[field] as number | string | null;
}

const sortedCampaigns = computed(() =>
  [...props.campaigns].sort((a, b) => {
    const aVal = getFieldValue(a, sortField.value);
    const bVal = getFieldValue(b, sortField.value);
    const dir = sortDir.value === "asc" ? 1 : -1;
    return sortWithNullsLast(aVal, bVal, dir);
  }),
);

const COLUMNS: DataTableColumn[] = [
  {
    key: "campaign",
    label: "Campaign",
    sortable: true,
    class: "left-alignment",
  },
  { key: "channel", label: "Channel", sortable: true, class: "text-center" },
  { key: "budget", label: "Budget", sortable: true },
  { key: "clicks", label: "Clicks", sortable: true },
  { key: "impressions", label: "Impressions", sortable: true },
  { key: "ctr", label: "CTR", ariaLabel: "Click-through rate", sortable: true },
  { key: "conversions", label: "Conversions", sortable: true },
  { key: "cvr", label: "CVR", ariaLabel: "Conversion rate", sortable: true },
  { key: "revenue", label: "Revenue", sortable: true },
  {
    key: "cpa",
    label: "CPA",
    ariaLabel: "Cost per acquisition",
    sortable: true,
  },
  { key: "roi", label: "ROI", sortable: true },
];
</script>

<template>
  <Table class="campaign-table">
    <TableHeader
      :columns="COLUMNS"
      class="sticky-header"
      :sort-key="sortField"
      :sort-dir="sortDir"
      @sort="toggleSort"
    />
    <tbody>
      <tr v-for="c in sortedCampaigns" :key="c.campaign" class="data-table-row">
        <td class="left-alignment">{{ c.campaign }}</td>
        <td>
          <Badge class="info channel-badge">{{ c.channel }}</Badge>
        </td>
        <td class=" ">{{ formatCurrency(c.budget) }}</td>
        <td class=" ">{{ formatCompactNumber(c.clicks) }}</td>
        <td class=" ">
          {{ formatCompactNumber(c.impressions) }}
        </td>
        <td class=" ">{{ formatPercentage(c.ctr) }}</td>
        <td class=" ">{{ formatNumber(c.conversions) }}</td>
        <td class=" ">{{ formatPercentage(c.cvr) }}</td>
        <td class=" ">{{ formatCurrency(c.revenue) }}</td>
        <td class=" ">{{ formatCurrency(c.cpa, 2) }}</td>
        <td class=" ">
          <RoiIndicator :value="c.roi" />
        </td>
      </tr>
    </tbody>
  </Table>
</template>
