<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CampainDataRowError } from '@/features/data-transfer/types'
import { getRowErrorMessage } from '@/features/data-transfer/utils/error-messages'
import { DataTableHeader } from '@/ui'
import type { DataTableColumn } from '@/ui'

const props = defineProps<{
  errors: CampainDataRowError[]
}>()

const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const COLUMNS: DataTableColumn[] = [
  { key: 'row', label: 'Row', sortable: true, ariaLabel: 'row index', class: 'text-center w-6' },
  { key: 'column', label: 'Column', class: 'text-center' },
  { key: 'issue', label: 'Issue', class: 'text-left' },
]

const sortedErrors = computed(() =>
  [...props.errors].sort((a, b) =>
    sortDir.value === 'asc' ? a.row - b.row : b.row - a.row,
  ),
)
</script>

<template>
  <div class="table-wrapper scrollbar-stable scrollbar-on-surface">
    <table class="data-table stripped-odd">
      <DataTableHeader
        :columns="COLUMNS"
        :sticky="true"
        sort-key="row"
        :sort-dir="sortDir"
        @sort="toggleSort"
      />
      <tbody>
        <tr
          v-for="(err, i) in sortedErrors"
          :key="`${err.row}-${err.column}-${i}`"
          class="data-table-row"
        >
          <td class="data-table-cell col-row cell-row">{{ err.row }}</td>
          <td class="data-table-cell col-campain">
             <span class="badge danger">{{ err.column }}</span>
          </td>
          <td class="data-table-cell text-left">{{ getRowErrorMessage(err) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped> 
.col-row {
  @apply text-center w-6;
}

.col-campain {
  @apply text-center;
}

.cell-row {
  @apply font-semibold tabular-nums;
}
 
</style>