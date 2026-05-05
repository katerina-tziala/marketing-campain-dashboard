<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useSort } from '@/shared/composables';
import type { CampaignPerformance, CampaignRawMetrics, PerformanceMetrics } from '@/shared/data';
import { aggregateCampaignMetrics, computePerformanceMetrics } from '@/shared/portfolio';
import {
  formatCompactNumber,
  formatCurrency,
  formatNumber,
  formatPercentage,
  sortByValue,
} from '@/shared/utils';
import { Button, ChevronIcon, Table, TableGroupHeaderRow, TableHeader } from '@/ui';

import { PerformanceIndicator } from '../ui';

import type { DataTableColumn } from '@/ui';

const props = defineProps<{ campaigns: CampaignPerformance[] }>();

type SortField =
  | 'campaign'
  | 'budget'
  | 'clicks'
  | 'impressions'
  | 'ctr'
  | 'conversions'
  | 'cvr'
  | 'revenue'
  | 'cpa'
  | 'roi';

type GroupTotals = CampaignRawMetrics & PerformanceMetrics;

type CampaignGroup = {
  id: string;
  channel: string;
  campaigns: CampaignPerformance[];
  totals: GroupTotals;
};

const { sortKey: sortField, sortDir, toggleSort } = useSort<SortField>('revenue', 'desc');

const expandedGroupIds = ref<Set<string>>(new Set());

const COLUMNS: DataTableColumn[] = [
  {
    key: 'campaign',
    label: 'Campaign',
    sortable: true,
    class: 'left-alignment',
  },
  { key: 'budget', label: 'Budget', sortable: true },
  { key: 'clicks', label: 'Clicks', sortable: true },
  { key: 'impressions', label: 'Impressions', sortable: true },
  {
    key: 'ctr',
    label: 'CTR',
    title: 'Click-through Rate',
    ariaLabel: 'Click-through rate',
    sortable: true,
  },
  { key: 'conversions', label: 'Conversions', sortable: true },
  {
    key: 'cvr',
    label: 'CVR',
    title: 'Conversion Rate',
    ariaLabel: 'Conversion rate',
    sortable: true,
  },
  { key: 'revenue', label: 'Revenue', sortable: true },
  {
    key: 'cpa',
    label: 'CPA',
    title: 'Cost per Acquisition',
    ariaLabel: 'Cost per acquisition',
    sortable: true,
  },
  {
    key: 'roi',
    label: 'ROI',
    title: 'Return on Investment',
    ariaLabel: 'Return on investment',
    sortable: true,
  },
];

function toChannelId(channel: string): string {
  return channel.trim().toLowerCase().replace(/\s+/g, '-');
}

function handleSort(key: string): void {
  toggleSort(key as SortField);
}

function isExpanded(groupId: string): boolean {
  return expandedGroupIds.value.has(groupId);
}

function toggleGroup(groupId: string): void {
  const next = new Set(expandedGroupIds.value);

  if (next.has(groupId)) {
    next.delete(groupId);
  } else {
    next.add(groupId);
  }

  expandedGroupIds.value = next;
}

function getCampaignFieldValue(
  campaign: CampaignPerformance,
  field: SortField,
): number | string | null {
  return campaign[field] as number | string | null;
}

function getGroupFieldValue(group: CampaignGroup, field: SortField): number | string | null {
  if (field === 'campaign') {
    return group.channel;
  }
  return group.totals[field];
}

const campaignGroups = computed<CampaignGroup[]>(() => {
  const grouped = new Map<string, CampaignPerformance[]>();

  for (const campaign of props.campaigns) {
    const id = toChannelId(campaign.channel);
    const existing = grouped.get(id) ?? [];
    grouped.set(id, [...existing, campaign]);
  }

  return [...grouped.entries()].map(([id, campaigns]) => {
    const metrics = aggregateCampaignMetrics(campaigns);

    return {
      id,
      channel: campaigns[0]?.channel ?? id,
      campaigns,
      totals: {
        ...metrics,
        ...computePerformanceMetrics(metrics),
      },
    };
  });
});

const sortedGroups = computed(() =>
  sortByValue(
    campaignGroups.value.map((group) => ({
      ...group,
      campaigns: sortByValue(
        group.campaigns,
        (campaign) => getCampaignFieldValue(campaign, sortField.value),
        sortDir.value,
      ),
    })),
    (group) => getGroupFieldValue(group, sortField.value),
    sortDir.value,
  ),
);

const hasExpandedGroups = computed(() => expandedGroupIds.value.size > 0);

function toggleAllGroups(): void {
  expandedGroupIds.value = hasExpandedGroups.value
    ? new Set()
    : new Set(campaignGroups.value.map((group) => group.id));
}

function getCollapseCells(row: Element): HTMLElement[] {
  return Array.from(row.querySelectorAll<HTMLElement>('.collapse-cell'));
}

function transitionCollapseCells(cells: HTMLElement[], expanded: boolean, done: () => void): void {
  let remaining = cells.length;

  if (remaining === 0) {
    done();
    return;
  }

  function onTransitionEnd(cell: HTMLElement): void {
    cell.style.gridTemplateRows = '';
    cell.style.opacity = '';
    cell.style.transition = '';
    remaining -= 1;

    if (remaining === 0) {
      done();
    }
  }

  for (const cell of cells) {
    cell.style.gridTemplateRows = expanded ? '0fr' : '1fr';
    cell.style.opacity = expanded ? '0' : '1';
    cell.style.transition = 'none';
  }

  void cells[0].offsetHeight;

  for (const cell of cells) {
    cell.style.transition = 'grid-template-rows 300ms ease, opacity 300ms ease';
    cell.style.gridTemplateRows = expanded ? '1fr' : '0fr';
    cell.style.opacity = expanded ? '1' : '0';
    cell.addEventListener('transitionend', () => onTransitionEnd(cell), {
      once: true,
    });
  }
}

function onCampaignRowEnter(el: Element, done: () => void): void {
  transitionCollapseCells(getCollapseCells(el), true, done);
}

function onCampaignRowLeave(el: Element, done: () => void): void {
  transitionCollapseCells(getCollapseCells(el), false, done);
}

watch(
  () => campaignGroups.value.map((group) => group.id),
  (groupIds) => {
    const next = new Set(
      [...expandedGroupIds.value].filter((groupId) => groupIds.includes(groupId)),
    );

    for (const groupId of groupIds) {
      next.add(groupId);
    }

    expandedGroupIds.value = next;
  },
  { immediate: true },
);
</script>

<template>
  <div class="grouped-campaign-table">
    <div class="table-actions">
      <Button
        variant="text-only"
        size="smaller"
        :disabled="campaignGroups.length === 0"
        @click="toggleAllGroups"
      >
        {{ hasExpandedGroups ? 'Collapse all' : 'Expand all' }}
      </Button>
    </div>
    <Table cell-padding="none">
      <TableHeader
        :columns="COLUMNS"
        position="sticky"
        :sort-key="sortField"
        :sort-dir="sortDir"
        @sort="handleSort"
      />
      <tbody>
        <template
          v-for="group in sortedGroups"
          :key="group.id"
        >
          <TableGroupHeaderRow>
            <td class="left-alignment">
              <div class="table-cell-content group-cell-content">
                <Button
                  variant="text-only"
                  size="smaller"
                  class="group-toggle"
                  :aria-expanded="isExpanded(group.id)"
                  :aria-controls="`${group.id}-campaigns`"
                  @click="toggleGroup(group.id)"
                >
                  <ChevronIcon
                    class="group-toggle-icon"
                    :class="{ expanded: isExpanded(group.id) }"
                  />
                  <span>{{ group.channel }}</span>
                  <span class="campaign-count"> {{ group.campaigns.length }} campaigns </span>
                </Button>
              </div>
            </td>
            <td>
              <div class="table-cell-content">
                {{ formatCurrency(group.totals.budget) }}
              </div>
            </td>
            <td>
              <div class="table-cell-content">
                {{ formatCompactNumber(group.totals.clicks) }}
              </div>
            </td>
            <td>
              <div class="table-cell-content">
                {{ formatCompactNumber(group.totals.impressions) }}
              </div>
            </td>
            <td>
              <div class="table-cell-content">
                {{ formatPercentage(group.totals.ctr) }}
              </div>
            </td>
            <td>
              <div class="table-cell-content">
                {{ formatNumber(group.totals.conversions) }}
              </div>
            </td>
            <td>
              <div class="table-cell-content">
                <PerformanceIndicator
                  :value="group.totals.cvr"
                  class="dimmed"
                />
              </div>
            </td>
            <td>
              <div class="table-cell-content">
                <PerformanceIndicator :value="group.totals.roi">
                  {{ formatCurrency(group.totals.revenue) }}
                </PerformanceIndicator>
              </div>
            </td>
            <td>
              <div class="table-cell-content">
                {{ formatCurrency(group.totals.cpa, 2) }}
              </div>
            </td>
            <td>
              <div class="table-cell-content">
                <PerformanceIndicator :value="group.totals.roi" />
              </div>
            </td>
          </TableGroupHeaderRow>

          <template
            v-for="campaign in group.campaigns"
            :key="`${campaign.channel}-${campaign.rowId}`"
          >
            <Transition
              :css="false"
              @enter="onCampaignRowEnter"
              @leave="onCampaignRowLeave"
            >
              <tr
                v-if="isExpanded(group.id)"
                :id="`${group.id}-campaigns`"
                class="data-table-row campaign-row"
              >
                <td class="left-alignment campaign-name">
                  <div class="collapse-cell">
                    <div class="collapse-cell-inner">
                      <div class="table-cell-content collapse-cell-content">
                        {{ campaign.campaign }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="collapse-cell">
                    <div class="collapse-cell-inner">
                      <div class="table-cell-content collapse-cell-content">
                        {{ formatCurrency(campaign.budget) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="collapse-cell">
                    <div class="collapse-cell-inner">
                      <div class="table-cell-content collapse-cell-content">
                        {{ formatCompactNumber(campaign.clicks) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="collapse-cell">
                    <div class="collapse-cell-inner">
                      <div class="table-cell-content collapse-cell-content">
                        {{ formatCompactNumber(campaign.impressions) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="collapse-cell">
                    <div class="collapse-cell-inner">
                      <div class="table-cell-content collapse-cell-content">
                        {{ formatPercentage(campaign.ctr) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="collapse-cell">
                    <div class="collapse-cell-inner">
                      <div class="table-cell-content collapse-cell-content">
                        {{ formatNumber(campaign.conversions) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="collapse-cell">
                    <div class="collapse-cell-inner">
                      <div class="table-cell-content collapse-cell-content">
                        <PerformanceIndicator
                          :value="campaign.cvr"
                          class="dimmed"
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="collapse-cell">
                    <div class="collapse-cell-inner">
                      <div class="table-cell-content collapse-cell-content">
                        <PerformanceIndicator :value="campaign.roi">
                          {{ formatCurrency(campaign.revenue) }}
                        </PerformanceIndicator>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="collapse-cell">
                    <div class="collapse-cell-inner">
                      <div class="table-cell-content collapse-cell-content">
                        {{ formatCurrency(campaign.cpa, 2) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="collapse-cell">
                    <div class="collapse-cell-inner">
                      <div class="table-cell-content collapse-cell-content">
                        <PerformanceIndicator :value="campaign.roi" />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </Transition>
          </template>
        </template>
      </tbody>
    </Table>
  </div>
</template>

<style lang="scss" scoped>
.grouped-campaign-table {
  @apply flex flex-col gap-2 min-h-0;
}

.table-actions {
  @apply flex justify-start;
}

.table-cell-content {
  @apply p-2.5 text-center;
}

.left-alignment .table-cell-content {
  @apply text-left;
}

.group-cell-content {
  @apply py-3 px-4;
}

.group-toggle {
  @apply gap-2 text-left w-full;
  justify-content: flex-start;
  padding-inline: 0;
}

.group-toggle-icon {
  @apply shrink-0 transition-transform duration-150;

  &.expanded {
    @apply rotate-180;
  }
}

.campaign-count {
  @apply text-xs text-typography-subtle font-normal;
}

.campaign-name .collapse-cell-content {
  @apply pl-8;
}

.campaign-row > td {
  @apply transition-colors duration-300 ease-out;
}

.collapse-cell {
  @apply grid opacity-100;
  grid-template-rows: 1fr;
}

.collapse-cell-content {
  @apply min-h-0;
}

.collapse-cell-inner {
  @apply overflow-hidden min-h-0;
}
</style>
