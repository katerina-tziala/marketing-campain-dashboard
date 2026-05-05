import { computed, type ComputedRef } from 'vue';

export function useModalAria(): {
  titleId: string;
  dialogAria: ComputedRef<{
    role: string;
    'aria-modal': boolean;
    'aria-labelledby': string;
  }>;
} {
  const titleId = `modal-title-${crypto.randomUUID()}`;

  const dialogAria = computed(() => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': titleId,
  }));

  return {
    titleId,
    dialogAria,
  };
}
