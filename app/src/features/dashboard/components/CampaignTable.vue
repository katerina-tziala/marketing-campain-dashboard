<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Campaign } from '../../../common/types/campaign'

const props = defineProps<{ campaigns: Campaign[] }>()

type SortField = keyof Campaign | 'roi' | 'ctr' | 'cvr' | 'cac'
type SortDir = 'asc' | 'desc'

const sortField = ref<SortField>('revenue')
const sortDir = ref<SortDir>('desc')

function getFieldValue(c: Campaign, field: SortField): number | string {
  if (field === 'roi') return c.budget > 0 ? (c.revenue - c.budget) / c.budget : 0
  if (field === 'ctr') return c.impressions > 0 ? c.clicks / c.impressions : 0
  if (field === 'cvr') return c.clicks > 0 ? c.conversions / c.clicks : 0
  if (field === 'cac') return c.conversions > 0 ? c.budget / c.conversions : Infinity
  return c[field as keyof Campaign]
}

function sort(field: SortField) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
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
    : '—'
}

function roiClass(c: Campaign) {
  const r = roiValue(c)
  if (r <= 0) return 'campaign-table__td--roi-negative'
  if (r <= 50) return 'campaign-table__td--roi-warning'
  return 'campaign-table__td--roi-positive'
}

function ctr(c: Campaign) {
  return c.impressions > 0
    ? `${((c.clicks / c.impressions) * 100).toFixed(2)}%`
    : '—'
}

function cvr(c: Campaign) {
  return c.clicks > 0
    ? `${((c.conversions / c.clicks) * 100).toFixed(2)}%`
    : '—'
}

function cac(c: Campaign) {
  return c.conversions > 0
    ? eur(c.budget / c.conversions, 2)
    : '—'
}

function eur(val: number, decimals = 0) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val)
}

function compactNumber(val: number) {
  if (val >= 1000) {
    return new Intl.NumberFormat('en', {
      notation: 'compact',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(val)
  }
  return val.toLocaleString('en')
}

const columns: { key: SortField; label: string }[] = [
  { key: 'campaign', label: 'Campaign' },
  { key: 'channel', label: 'Channel' },
  { key: 'budget', label: 'Budget' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'ctr', label: 'CTR' },
  { key: 'conversions', label: 'Conv.' },
  { key: 'cvr', label: 'CVR' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'roi', label: 'ROI' },
  { key: 'cac', label: 'CAC' },
]
</script>

<template>
  <div class="campaign-table">
    <table class="data-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            class="data-table-header campaign-table__th"
            @click="sort(col.key)"
          >
            <span class="campaign-table__th-inner">
              {{ col.label }}
              <span
                class="campaign-table__sort-icon"
                :class="sortField === col.key ? 'campaign-table__sort-icon--active' : ''"
              >
                {{ sortField === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}
              </span>
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="c in sortedCampaigns"
          :key="c.campaign"
          class="data-table-row"
        >
          <td class="data-table-cell campaign-table__td--name">{{ c.campaign }}</td>
          <td class="data-table-cell">
            <span class="badge info whitespace-break-spaces">{{ c.channel }}</span>
          </td>
          <td class="data-table-cell">{{ eur(c.budget) }}</td>
          <td class="data-table-cell">{{ compactNumber(c.clicks) }}</td>
          <td class="data-table-cell">{{ ctr(c) }}</td>
          <td class="data-table-cell">{{ c.conversions.toLocaleString('en') }}</td>
          <td class="data-table-cell">{{ cvr(c) }}</td>
          <td class="data-table-cell campaign-table__td--roi" :class="roiClass(c)">{{ eur(c.revenue) }}</td>
          <td class="data-table-cell campaign-table__td--roi" :class="roiClass(c)">
            {{ roiFormatted(c) }}
          </td>
          <td class="data-table-cell">{{ cac(c) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.campaign-table {
  &__th {
    @apply cursor-pointer select-none whitespace-nowrap;

    &:hover {
      color: theme('colors.primary.400');
    }
  }

  &__th-inner {
    @apply flex items-center gap-1;
  }

  &__sort-icon {
    @apply text-xs;
    color: var(--color-border);

    &--active {
      color: theme('colors.primary.400');
    }
  }

  &__td {
    &--name {
      font-weight: 600;
    }

    &--strong {
      font-weight: 600;
      color: var(--color-text);
    }

    &--roi {
      @apply font-semibold;
    }

    &--roi-positive { color: #10b981; }
    &--roi-warning  { color: #f59e0b; }
    &--roi-negative { color: #f55671; }
  }
}

</style>
