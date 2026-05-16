import { generateId } from '@/shared/utils';

export function useModalAria(): {
  titleId: string;
  dialogAria: {
    role: string;
    'aria-modal': boolean;
    'aria-labelledby': string;
  };
} {
  const titleId = generateId('modal-title');

  const dialogAria = {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': titleId,
  };

  return {
    titleId,
    dialogAria,
  };
}
