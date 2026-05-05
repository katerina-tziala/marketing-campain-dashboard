<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import { FOCUSABLE_SELECTOR, useFocusTrap, useModalAria } from '../accessibility';
import type { ModalInitialFocus, ModalSize } from './modal.types';
import ModalHeader from './ModalHeader.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    closeLabel?: string;
    size?: ModalSize;
    initialFocus?: ModalInitialFocus;
    closeOnBackdrop?: boolean;
  }>(),
  {
    closeLabel: undefined,
    size: 'default',
    initialFocus: 'content',
    closeOnBackdrop: true,
  },
);

const emit = defineEmits<{
  close: [];
}>();

const modalRef = ref<HTMLElement | null>(null);
const { titleId, dialogAria } = useModalAria();
const { getFocusableElements, trapTab, saveFocus, restoreFocus, lockScroll, unlockScroll } =
  useFocusTrap(modalRef);

function getFirstFocusableIn(containerSelector: string): HTMLElement | null {
  const container = modalRef.value?.querySelector<HTMLElement>(containerSelector);
  if (!container) {
    return null;
  }

  return (
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).find(
      (el) => el.offsetParent !== null,
    ) ?? null
  );
}

function getInitialFocusTarget(): HTMLElement | null {
  if (!modalRef.value) {
    return null;
  }

  if (props.initialFocus === 'first-control') {
    return getFirstFocusableIn('[data-modal-body]');
  }

  if (props.initialFocus === 'footer-actions') {
    return getFirstFocusableIn('[data-modal-footer]');
  }

  if (props.initialFocus === 'close') {
    return modalRef.value.querySelector<HTMLElement>('[data-modal-close]');
  }

  return modalRef.value.querySelector<HTMLElement>('[data-modal-body]');
}

function focusInitialTarget(): void {
  const modal = modalRef.value;
  if (!modal) {
    return;
  }

  const target =
    getInitialFocusTarget() ??
    modal.querySelector<HTMLElement>('[data-modal-body]') ??
    getFocusableElements()[0] ??
    modal;

  target.focus();
}

async function scheduleInitialFocus(): Promise<void> {
  await nextTick();
  focusInitialTarget();
}

function handleBackdropClick(): void {
  if (!props.closeOnBackdrop) {
    return;
  }
  emit('close');
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    emit('close');
    return;
  }
  trapTab(e);
}

onMounted(() => {
  saveFocus();
  lockScroll();
  document.addEventListener('keydown', onKeydown);
  void scheduleInitialFocus();
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  unlockScroll();
  restoreFocus();
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
      @click.self="handleBackdropClick"
    >
      <div
        ref="modalRef"
        class="modal"
        :class="props.size"
        tabindex="-1"
      >
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
    @apply w-full
      max-w-2xl;
  }

  &.medium {
    @apply w-full
      max-w-3xl;
  }

  &.large {
    @apply w-full
      max-w-5xl;
  }
}
</style>
