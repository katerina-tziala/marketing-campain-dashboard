<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CampaignPerformance } from '../../../common/types/campaign'
import { DataTableHeader } from '../../../ui'
import type { DataTableColumn, SortDir } from '../../../ui'
import { formatCompactNumber, formatCurrency, formatNumber, formatPercentage } from '../../../common/utils/formatters'
import { sortWithNullsLast } from '../../../common/utils/sorting'
import { percentageClass } from '../../../common/utils/campaign-performance'


const props = defineProps<{ campaigns: CampaignPerformance[] }>()

type SortField = keyof CampaignPerformance

const sortField = ref<SortField>('revenue')
const sortDir = ref<SortDir>('desc')

function toggleSort(field: string) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field as SortField
    sortDir.value = 'desc'
  }
}

function getFieldValue(c: CampaignPerformance, field: SortField): number | string | null {
  return c[field] as number | string | null
}

const sortedCampaigns = computed(() =>
  [...props.campaigns].sort((a, b) => {
    const aVal = getFieldValue(a, sortField.value)
    const bVal = getFieldValue(b, sortField.value);
    const dir = sortDir.value === 'asc' ? 1 : -1
    return sortWithNullsLast(aVal, bVal, dir)
  }),
)


const COLUMNS: DataTableColumn[] = [
  { key: 'campaign', label: 'Campaign', sortable: true },
  { key: 'channel', label: 'Channel', sortable: true, class: 'text-center' },
  { key: 'budget', label: 'Budget', sortable: true },
  { key: 'clicks', label: 'Clicks', sortable: true },
  { key: 'impressions', label: 'Impressions', sortable: true },
  { key: 'ctr', label: 'CTR', ariaLabel: 'Click-through rate', sortable: true },
  { key: 'conversions', label: 'Conversions', sortable: true },
  { key: 'cvr', label: 'CVR', ariaLabel: 'Conversion rate', sortable: true },
  { key: 'revenue', label: 'Revenue', sortable: true },
  { key: 'cac', label: 'CAC', ariaLabel: 'Customer acquisition cost', sortable: true },
  { key: 'roi', label: 'ROI', sortable: true },
]
</script>

<template>
  <div class="table-wrapper scrollbar-stable scrollbar-on-surface campaign-table">
    <table class="data-table stripped-even">
      <DataTableHeader
        :columns="COLUMNS"
        :sticky="true"
        :sort-key="sortField"
        :sort-dir="sortDir"
        @sort="toggleSort"
      />
      <tbody>
        <tr
          v-for="c in sortedCampaigns"
          :key="c.campaign"
          class="data-table-row"
        >
          <td class="data-table-cell campaign-table-td text-left">{{ c.campaign }}</td>
          <td class="data-table-cell campaign-table-td text-center">
            <span class="badge info whitespace-break-spaces">{{ c.channel }}</span>
          </td>
          <td class="data-table-cell campaign-table-td">{{ formatCurrency(c.budget) }}</td>
          <td class="data-table-cell campaign-table-td">{{ formatCompactNumber(c.clicks) }}</td>
          <td class="data-table-cell campaign-table-td">{{ formatCompactNumber(c.impressions) }}</td>
          <td class="data-table-cell campaign-table-td">{{ formatPercentage(c.ctr) }}</td>
          <td class="data-table-cell campaign-table-td">{{ formatNumber(c.conversions) }}</td>
          <td class="data-table-cell campaign-table-td">{{ formatPercentage(c.cvr) }}</td>
          <td class="data-table-cell campaign-table-td roi-text" :class="percentageClass(c.roi)">{{ formatCurrency(c.revenue) }}</td>
          <td class="data-table-cell campaign-table-td">{{ formatCurrency(c.cac, 2) }}</td>
          <td class="data-table-cell campaign-table-td roi-text" :class="percentageClass(c.roi)">
            {{ formatPercentage(c.roi) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.campaign-table {
  @apply w-full h-full overflow-auto;

  .data-table-cell.campaign-table-td {
    @apply py-3;
  }
}
</style>
