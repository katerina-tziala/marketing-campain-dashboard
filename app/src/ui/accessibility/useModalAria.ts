import { computed } from "vue";

export function useModalAria() {
  const titleId = `modal-title-${crypto.randomUUID()}`;

  const dialogAria = computed(() => ({
    role: "dialog",
    "aria-modal": true,
    "aria-labelledby": titleId,
  }));

  return {
    titleId,
    dialogAria,
  };
}
