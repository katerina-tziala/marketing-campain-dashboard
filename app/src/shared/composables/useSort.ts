import { type Ref, ref } from 'vue';

import type { SortDir } from '@/ui';

export function useSort<T extends string>(
  defaultKey: T,
  defaultDir: SortDir = 'asc',
): {
  sortKey: Ref<T>;
  sortDir: Ref<SortDir>;
  toggleSort: (key: T) => void;
} {
  const sortKey = ref(defaultKey) as Ref<T>;
  const sortDir = ref<SortDir>(defaultDir);

  function toggleSort(key: T): void {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey.value = key;
      sortDir.value = defaultDir;
    }
  }

  return { sortKey, sortDir, toggleSort };
}
