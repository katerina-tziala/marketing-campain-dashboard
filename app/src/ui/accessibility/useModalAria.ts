export function useModalAria(): {
  titleId: string;
  dialogAria: {
    role: string;
    'aria-modal': boolean;
    'aria-labelledby': string;
  };
} {
  const titleId = `modal-title-${crypto.randomUUID()}`;

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
