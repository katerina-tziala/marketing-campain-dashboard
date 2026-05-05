import { nextTick, ref } from 'vue';

import type { Ref } from 'vue';

export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  "[tabindex]:not([tabindex='-1'])",
].join(',');

export function useFocusTrap(containerRef: Ref<HTMLElement | null>): {
  getFocusableElements: () => HTMLElement[];
  focusFirst: () => void;
  scheduleFocusFirst: () => Promise<void>;
  trapTab: (e: KeyboardEvent) => void;
  saveFocus: () => void;
  restoreFocus: () => void;
  lockScroll: () => void;
  unlockScroll: () => void;
} {
  const previouslyFocusedElement = ref<HTMLElement | null>(null);

  function getFocusableElements(): HTMLElement[] {
    if (!containerRef.value) {
      return [];
    }
    return Array.from(containerRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null,
    );
  }

  function focusFirst(): void {
    const container = containerRef.value;
    if (!container) {
      return;
    }

    const target =
      container.querySelector<HTMLElement>('[data-modal-body]') ??
      getFocusableElements()[0] ??
      container;

    target.focus();
  }

  async function scheduleFocusFirst(): Promise<void> {
    await nextTick();
    focusFirst();
  }

  function trapTab(e: KeyboardEvent): void {
    if (e.key !== 'Tab') {
      return;
    }

    const focusable = getFocusableElements();
    if (focusable.length === 0) {
      e.preventDefault();
      focusFirst();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function saveFocus(): void {
    previouslyFocusedElement.value = document.activeElement as HTMLElement | null;
  }

  function restoreFocus(): void {
    previouslyFocusedElement.value?.focus();
    previouslyFocusedElement.value = null;
  }

  function lockScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll(): void {
    document.body.style.overflow = '';
  }

  return {
    getFocusableElements,
    focusFirst,
    scheduleFocusFirst,
    trapTab,
    saveFocus,
    restoreFocus,
    lockScroll,
    unlockScroll,
  };
}
