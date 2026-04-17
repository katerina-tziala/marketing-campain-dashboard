<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CsvRowError } from '../../types'
import { getRowErrorMessage } from '../../utils/error-messages'
import { ArrowUpIcon } from '../../../../ui/icons'

const props = defineProps<{
  errors: CsvRowError[]
}>()

type SortDir = 'asc' | 'desc'

const sortDir = ref<SortDir>('asc')

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const sortedErrors = computed(() =>
  [...props.errors].sort((a, b) =>
    sortDir.value === 'asc' ? a.row - b.row : b.row - a.row,
  ),
)
</script>

<template>
  <div class="table-wrapper scrollbar-stable scrollbar-on-surface">
    <table class="data-table">
      <thead class="data-table-sticky-header">
        <tr>
          <th class="data-table-sortable-header col-row">
            <button
              class="sort-btn"
              type="button"
              :aria-label="`Sort by row index ${sortDir === 'asc' ? 'descending' : 'ascending'}`"
              @click="toggleSort"
            >
              Row
              <ArrowUpIcon
                class="sort-icon"
                :class="{ 'desc': sortDir === 'desc', 'asc': sortDir === 'asc'  }"
              />
            </button>
          </th>
          <th class="data-table-header col-campain">Column</th>
          <th class="data-table-header">Issue</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(err, i) in sortedErrors"
          :key="`${err.row}-${err.column}-${i}`"
          class="data-table-row"
        >
          <td class="data-table-cell col-row cell-row">{{ err.row }}</td>
          <td class="data-table-cell col-campain cell-col">{{ err.column }}</td>
          <td class="data-table-cell">{{ getRowErrorMessage(err) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
  @apply overflow-auto;
}
 
.col-row {
  @apply text-center w-6;
}

.col-campain {
  @apply text-center;
}

.cell-row {
  @apply font-semibold tabular-nums;
}

.cell-col {
  @apply font-medium text-danger;
}
</style>