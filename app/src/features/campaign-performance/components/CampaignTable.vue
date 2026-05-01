<script setup lang="ts">
import { computed } from "vue";
import type { CampaignPerformance } from "@/shared/data";
import { TableHeader, Badge, Table } from "@/ui";
import type { DataTableColumn } from "@/ui";
import { useSort } from "@/shared/composables/useSort";
import {
  formatCompactNumber,
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "@/shared/utils";
import { sortByValue } from "@/shared/utils";
import { PerformanceIndicator } from "@/features/campaign-performance/ui";

const props = defineProps<{ campaigns: CampaignPerformance[] }>();

type SortField = keyof CampaignPerformance;

const {
  sortKey: sortField,
  sortDir,
  toggleSort,
} = useSort<SortField>("revenue", "desc");

function handleSort(key: string): void {
  toggleSort(key as SortField);
}

function getFieldValue(
  c: CampaignPerformance,
  field: SortField,
): number | string | null {
  return c[field] as number | string | null;
}

const sortedCampaigns = computed(() =>
  sortByValue(
    props.campaigns,
    (campaign) => getFieldValue(campaign, sortField.value),
    sortDir.value,
  ),
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
      @sort="handleSort"
    />
    <tbody>
      <tr v-for="c in sortedCampaigns" :key="c.campaign" class="data-table-row">
        <td class="left-alignment">{{ c.campaign }}</td>
        <td>
          <Badge class="info dimmed">{{ c.channel }}</Badge>
        </td>
        <td>{{ formatCurrency(c.budget) }}</td>
        <td>{{ formatCompactNumber(c.clicks) }}</td>
        <td>{{ formatCompactNumber(c.impressions) }}</td>
        <td>{{ formatPercentage(c.ctr) }}</td>
        <td>{{ formatNumber(c.conversions) }}</td>
        <td><PerformanceIndicator :value="c.cvr" class="dimmed" /></td>
        <td>
          <PerformanceIndicator :value="c.roi">{{
            formatCurrency(c.revenue)
          }}</PerformanceIndicator>
        </td>
        <td>{{ formatCurrency(c.cpa, 2) }}</td>
        <td><PerformanceIndicator :value="c.roi" /></td>
      </tr>
    </tbody>
  </Table>
</template>
