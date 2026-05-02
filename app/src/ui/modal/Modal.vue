<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import ModalHeader from "./ModalHeader.vue";
import { useModalAria } from "./composables";
import type { ModalInitialFocus, ModalSize } from "./modal.types";

const props = withDefaults(
  defineProps<{
    title: string;
    closeLabel?: string;
    size?: ModalSize;
    initialFocus?: ModalInitialFocus;
  }>(),
  {
    size: "default",
    initialFocus: "content",
  },
);

const emit = defineEmits<{
  close: [];
}>();

const modalRef = ref<HTMLElement | null>(null);
const previouslyFocusedElement = ref<HTMLElement | null>(null);
const { titleId, dialogAria } = useModalAria();

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(): HTMLElement[] {
  if (!modalRef.value) return [];

  return Array.from(
    modalRef.value.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((element) => element.offsetParent !== null);
}

function getFirstFocusableIn(containerSelector: string): HTMLElement | null {
  const container = modalRef.value?.querySelector<HTMLElement>(containerSelector);
  if (!container) return null;

  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelector),
  ).find((element) => element.offsetParent !== null) ?? null;
}

function getInitialFocusTarget(): HTMLElement | null {
  if (!modalRef.value) return null;

  if (props.initialFocus === "first-control") {
    return getFirstFocusableIn("[data-modal-body]");
  }

  if (props.initialFocus === "footer-actions") {
    return getFirstFocusableIn("[data-modal-footer]");
  }

  if (props.initialFocus === "close") {
    return modalRef.value.querySelector<HTMLElement>("[data-modal-close]");
  }

  return modalRef.value.querySelector<HTMLElement>("[data-modal-body]");
}

function focusInitialTarget(): void {
  const modal = modalRef.value;
  if (!modal) return;

  const target =
    getInitialFocusTarget() ??
    modal.querySelector<HTMLElement>("[data-modal-body]") ??
    getFocusableElements()[0] ??
    modal;

  target.focus();
}

async function scheduleInitialFocus(): Promise<void> {
  await nextTick();
  focusInitialTarget();
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    emit("close");
    return;
  }

  if (e.key !== "Tab") return;

  const focusableElements = getFocusableElements();
  if (focusableElements.length === 0) {
    e.preventDefault();
    focusInitialTarget();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (e.shiftKey && activeElement === firstElement) {
    e.preventDefault();
    lastElement.focus();
    return;
  }

  if (!e.shiftKey && activeElement === lastElement) {
    e.preventDefault();
    firstElement.focus();
  }
}

onMounted(() => {
  previouslyFocusedElement.value = document.activeElement as HTMLElement | null;
  document.addEventListener("keydown", onKeydown);
  document.body.style.overflow = "hidden";
  void scheduleInitialFocus();
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
  previouslyFocusedElement.value?.focus();
});

watch(
  () => props.initialFocus,
  () => {
    void scheduleInitialFocus();
  },
);
</script>

<template>
  <Teleport to="body">
    <div
      v-bind="dialogAria"
      class="overlay"
      @click.self="emit('close')"
    >
      <div ref="modalRef" class="modal" :class="props.size" tabindex="-1">
        <ModalHeader
          :title="title"
          :title-id="titleId"
          :close-label="closeLabel"
          @close="emit('close')"
        />
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal {
  @apply w-fit
    h-fit
    overflow-hidden
    rounded-md
    shadow-md
    bg-surface-elevated
    border
    border-faint
    outline-none
    flex
    flex-col 
    max-h-[98vh]
    max-w-[98vw];

  &.small {
    @apply w-full max-w-2xl;
  }

  &.medium {
    @apply w-full max-w-3xl;
  }

  &.large {
    @apply w-full max-w-5xl;
  }
}
</style>
