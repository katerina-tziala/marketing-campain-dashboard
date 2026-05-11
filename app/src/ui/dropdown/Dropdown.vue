<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import { useFocusTrap } from '../accessibility';

const props = defineProps<{
  open: boolean;
  anchor: HTMLElement | null | undefined;
  minWidth?: number;
  maxHeight?: number;
  gap?: number;
  edgeMargin?: number;
  align?: 'left' | 'right';
}>();
const emit = defineEmits<{
  'update:open': [value: boolean];
}>();
const DROPDOWN_GAP = 6;
const DROPDOWN_MIN_WIDTH = 260;
const DROPDOWN_MAX_HEIGHT = 300;
const DROPDOWN_EDGE_MARGIN = 8;

const panelRef = ref<HTMLElement | null>(null);
const { focusFirst, trapTab, lockScroll, unlockScroll } = useFocusTrap(panelRef);

const close = (): void => emit('update:open', false);

const dropdownStyle = ref<Record<string, string | undefined>>({});

function calculatePosition(): Record<string, string | undefined> {
  if (!props.anchor) {
    return {};
  }
  const rect = props.anchor.getBoundingClientRect();

  const gap = props.gap ?? DROPDOWN_GAP;
  const minWidth = props.minWidth ?? DROPDOWN_MIN_WIDTH;
  const desiredMaxHeight = props.maxHeight ?? DROPDOWN_MAX_HEIGHT;
  const edgeMargin = props.edgeMargin ?? DROPDOWN_EDGE_MARGIN;

  const spaceBelow = window.innerHeight - rect.bottom - gap - edgeMargin;
  const spaceAbove = rect.top - gap - edgeMargin;

  let vertical: Record<string, string>;
  let effectiveMaxHeight: number;

  if (spaceBelow >= desiredMaxHeight) {
    vertical = { top: `${rect.bottom + gap}px` };
    effectiveMaxHeight = desiredMaxHeight;
  } else if (spaceAbove >= desiredMaxHeight) {
    vertical = { bottom: `${window.innerHeight - rect.top + gap}px` };
    effectiveMaxHeight = desiredMaxHeight;
  } else {
    const useBelow = spaceBelow >= spaceAbove;
    vertical = useBelow
      ? { top: `${rect.bottom + gap}px` }
      : { bottom: `${window.innerHeight - rect.top + gap}px` };
    effectiveMaxHeight = useBelow ? spaceBelow : spaceAbove;
  }

  const horizontal =
    props.align === 'right'
      ? { right: `${window.innerWidth - rect.right}px` }
      : { left: `${Math.min(rect.left, window.innerWidth - minWidth - edgeMargin)}px` };

  return { ...vertical, ...horizontal, 'max-height': `${effectiveMaxHeight}px` };
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    close();
    return;
  }
  trapTab(e);
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      dropdownStyle.value = calculatePosition();
      lockScroll();
      nextTick(focusFirst);
    } else {
      unlockScroll();
      props.anchor?.focus();
    }
  },
);

function onWindowResize(): void {
  if (props.open) {
    close();
  }
}

onMounted(() => {
  window.addEventListener('resize', onWindowResize);
});

onUnmounted(() => {
  unlockScroll();
  window.removeEventListener('resize', onWindowResize);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[49]"
      aria-hidden="true"
      @click="close"
    />
    <div
      v-if="open"
      ref="panelRef"
      class="fixed z-50 flex"
      :class="align === 'right' ? 'flex-row-reverse' : 'flex-row'"
      :style="dropdownStyle"
      tabindex="-1"
      @keydown="onKeydown"
    >
      <slot />
    </div>
  </Teleport>
</template>
