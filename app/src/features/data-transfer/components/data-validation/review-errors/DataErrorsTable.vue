<script setup lang="ts">
import { computed } from "vue";
import { useSort } from "@/shared/composables/useSort";
import type { CampainDataRowError } from "@/features/data-transfer/types";
import { getRowErrorMessage } from "@/features/data-transfer/utils/error-messages";
import { Table, TableHeader, Badge } from "@/ui";
import type { DataTableColumn } from "@/ui";
import { sortByValue } from "@/shared/utils/sorting";

const props = defineProps<{
  errors: CampainDataRowError[];
}>();

const { sortDir, toggleSort } = useSort<string>("row");

const COLUMNS: DataTableColumn[] = [
  {
    key: "row",
    label: "Row",
    sortable: true,
    ariaLabel: "row index",
    class: "max-w-14",
  },
  { key: "column", label: "Column", },
  { key: "issue", label: "Issue", class: "left-alignment" },
];

const sortedErrors = computed(() =>
  sortByValue(props.errors, (error) => error.row, sortDir.value),
);
</script>

<template>
  <Table class="striped-even vertical-separators">
    <TableHeader
      :columns="COLUMNS"
      class="sticky-header vertical-separators"
      sort-key="row"
      :sort-dir="sortDir"
      @sort="toggleSort"
    />
    <tbody>
      <tr
        v-for="(err, i) in sortedErrors"
        :key="`${err.row}-${err.column}-${i}`"
      >
        <td class="font-semibold tabular-nums">{{ err.row }}</td>
        <td>
          <Badge class="danger dimmed">{{ err.column }}</Badge>
        </td>
        <td class="left-alignment">{{ getRowErrorMessage(err) }}</td>
      </tr>
    </tbody>
  </Table>
</template>
