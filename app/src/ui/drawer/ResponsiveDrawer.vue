<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { useFocusTrap, useModalAria } from '../accessibility';
import ModalHeader from '../modal/ModalHeader.vue';

type DrawerSide = 'left' | 'right';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    side?: DrawerSide;
    closeLabel?: string;
  }>(),
  {
    side: 'right',
    closeLabel: 'Close drawer',
  },
);

const emit = defineEmits<{
  close: [];
}>();

const isDesktop = ref(false);
const drawerModalRef = ref<HTMLElement | null>(null);
const { titleId, dialogAria } = useModalAria();
const { scheduleFocusFirst, trapTab, saveFocus, restoreFocus, lockScroll, unlockScroll } =
  useFocusTrap(drawerModalRef);
let desktopMediaQuery: MediaQueryList | null = null;

const drawerClass = computed(() => ({
  open: props.open,
  left: props.side === 'left',
  right: props.side === 'right',
}));
const modalOpen = computed(() => props.open && !isDesktop.value);

function syncViewport(e: MediaQueryList | MediaQueryListEvent): void {
  isDesktop.value = e.matches;
}

function onKeydown(e: KeyboardEvent): void {
  if (!props.open) {
    return;
  }

  if (e.key === 'Escape') {
    emit('close');
    return;
  }

  if (!modalOpen.value) {
    return;
  }
  trapTab(e);
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown);

  desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
  syncViewport(desktopMediaQuery);
  desktopMediaQuery.addEventListener('change', syncViewport);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  desktopMediaQuery?.removeEventListener('change', syncViewport);
});

watch(modalOpen, (open) => {
  if (open) {
    saveFocus();
    lockScroll();
    void scheduleFocusFirst();
    return;
  }

  unlockScroll();
  restoreFocus();
});
</script>

<template>
  <div
    class="responsive-drawer"
    :class="drawerClass"
    :aria-hidden="!open"
  >
    <aside
      v-if="isDesktop"
      class="responsive-drawer-panel"
      :aria-label="title"
    >
      <ModalHeader
        :title="title"
        :title-id="titleId"
        :close-label="closeLabel"
        @close="emit('close')"
      >
        <template
          v-if="$slots.icon"
          #icon
        >
          <slot name="icon" />
        </template>
        <template #header-actions>
          <slot name="header-actions" />
        </template>
      </ModalHeader>
      <div class="responsive-drawer-content">
        <slot />
      </div>
    </aside>
  </div>

  <Transition name="drawer-overlay">
    <div
      v-if="open && !isDesktop"
      class="overlay lg:hidden"
      @click.self="emit('close')"
    >
      <section
        ref="drawerModalRef"
        v-bind="dialogAria"
        class="responsive-drawer-modal"
        tabindex="-1"
      >
        <ModalHeader
          :title="title"
          :title-id="titleId"
          :close-label="closeLabel"
          @close="emit('close')"
        >
          <template
            v-if="$slots.icon"
            #icon
          >
            <slot name="icon" />
          </template>
          <template #header-actions>
            <slot name="header-actions" />
          </template>
        </ModalHeader>
        <div
          class="responsive-drawer-content"
          data-modal-body
          tabindex="-1"
        >
          <slot />
        </div>
      </section>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.responsive-drawer {
  @apply hidden
    lg:block
    lg:relative
    lg:overflow-hidden
    lg:shrink-0
    w-0
    lg:ease-in-out
    lg:duration-300
    lg:transition-[width];

  &.open {
    @apply lg:w-[30rem];
  }

  &.left .responsive-drawer-panel {
    @apply lg:left-0
      lg:-translate-x-full;
  }

  &.right .responsive-drawer-panel {
    @apply lg:right-0
      lg:translate-x-full;
  }

  &.open .responsive-drawer-panel {
    @apply lg:opacity-100
      lg:translate-x-0;
  }
}

.responsive-drawer-panel,
.responsive-drawer-modal {
  @apply grid
    grid-cols-1
    grid-rows-[min-content_1fr]
    w-full
    overflow-hidden
    shadow-md
    bg-surface-elevated
    border
    border-faint
    text-typography-soft;
}

.responsive-drawer-panel {
  @apply h-full
    sticky
    top-0
    lg:absolute
    lg:inset-y-0
    lg:w-[30rem]
    lg:opacity-0
    lg:ease-in-out
    lg:duration-300
    lg:transition-[opacity,transform];
}

.responsive-drawer-modal {
  @apply rounded-md
    max-h-[92vh]
    max-w-[92vw];
}

.responsive-drawer-content {
  @apply min-h-0
    overflow-hidden
    pb-4;
}
</style>
