<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Campaign } from '../../../common/types/campaign'
import { DataTableHeader } from '../../../ui'
import type { DataTableColumn, SortDir } from '../../../ui'
import { roiClass } from '../../../common/utils/roi';
import { formatCompactNumber, formatCurrency } from '../../../common/utils/formatters';

const props = defineProps<{ campaigns: Campaign[] }>()

type SortField = keyof Campaign | 'roi' | 'ctr' | 'cvr' | 'cac'
 
const sortField = ref<SortField>('revenue')
const sortDir = ref<SortDir>('desc')

function getFieldValue(c: Campaign, field: SortField): number | string {
  if (field === 'roi') return c.budget > 0 ? (c.revenue - c.budget) / c.budget : 0
  if (field === 'ctr') return c.impressions > 0 ? c.clicks / c.impressions : 0
  if (field === 'cvr') return c.clicks > 0 ? c.conversions / c.clicks : 0
  if (field === 'cac') return c.conversions > 0 ? c.budget / c.conversions : Infinity
  return c[field as keyof Campaign]
}
 
function toggleSort(field: string) { 
   if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field as SortField
    sortDir.value = 'desc'
  }
}

const sortedCampaigns = computed(() =>
  [...props.campaigns].sort((a, b) => {
    const aVal = getFieldValue(a, sortField.value)
    const bVal = getFieldValue(b, sortField.value)
    const dir = sortDir.value === 'asc' ? 1 : -1
    if (aVal < bVal) return -dir
    if (aVal > bVal) return dir
    return 0
  }),
)

function roiValue(c: Campaign) { 
  return c.budget > 0 ? ((c.revenue - c.budget) / c.budget) * 100 : 0
}

function roiFormatted(c: Campaign) {
  return c.budget > 0
    ? `${roiValue(c).toFixed(0)}%`
    : 'N/A'
}

function getRoiClass(c: Campaign) {
  const r = roiValue(c) 
  return roiClass(r)
}

function ctr(c: Campaign) {
  return c.impressions > 0
    ? `${((c.clicks / c.impressions) * 100).toFixed(2)}%`
    : 'N/A'
}

function cvr(c: Campaign) {
  return c.clicks > 0
    ? `${((c.conversions / c.clicks) * 100).toFixed(2)}%`
    : 'N/A'
}

function cac(c: Campaign) {
  return c.conversions > 0
    ? formatCurrency(c.budget / c.conversions, 2)
    : 'N/A'
}

const COLUMNS: DataTableColumn[] = [
  { key: 'campaign', label: 'Campaign',  sortable: true,  },
  { key: 'channel', label: 'Channel',  sortable: true, class:'text-center'},
  { key: 'budget', label: 'Budget',  sortable: true, },
  { key: 'clicks', label: 'Clicks',  sortable: true, },
  { key: 'impressions', label: 'Impressions' ,  sortable: true,},
  { key: 'ctr', label: 'CTR', ariaLabel:'Click-through rate',  sortable: true, },
  { key: 'conversions', label: 'Conversions',  sortable: true, },
  { key: 'cvr', label: 'CVR', ariaLabel:'Conversion rate',  sortable: true, },
  { key: 'revenue', label: 'Revenue',  sortable: true, },
  { key: 'cac', label: 'CAC', ariaLabel:'Customer acquisition cost', sortable: true, },
  { key: 'roi', label: 'ROI',  sortable: true, },
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
          <td class="data-table-cell campaign-table-td">{{ ctr(c) }}</td>
          <td class="data-table-cell campaign-table-td">{{ c.conversions.toLocaleString('en') }}</td>
          <!-- roi-text :class="getRoiClass(c)" -->
          <td class="data-table-cell campaign-table-td" >{{ cvr(c) }}</td>
          <td class="data-table-cell campaign-table-td roi-text" :class="getRoiClass(c)">{{ formatCurrency(c.revenue) }}</td>   
          <td class="data-table-cell campaign-table-td" >{{ cac(c) }}</td>
          <td class="data-table-cell campaign-table-td roi-text" :class="getRoiClass(c)">
            {{ roiFormatted(c) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.campaign-table {
    @apply w-full h-fit max-h-[45rem] overflow-auto; 

  .data-table-cell.campaign-table-td {
    @apply py-3;
  }
}
</style>
