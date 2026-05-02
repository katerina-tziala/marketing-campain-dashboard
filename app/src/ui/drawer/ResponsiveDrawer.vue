<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import ModalHeader from "../modal/ModalHeader.vue";
import { useModalAria } from "../modal/composables";

type DrawerSide = "left" | "right";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    side?: DrawerSide;
    closeLabel?: string;
  }>(),
  {
    side: "right",
    closeLabel: "Close drawer",
  },
);

const emit = defineEmits<{
  close: [];
}>();

const isDesktop = ref(false);
const drawerModalRef = ref<HTMLElement | null>(null);
const previouslyFocusedElement = ref<HTMLElement | null>(null);
const { titleId, dialogAria } = useModalAria();
let desktopMediaQuery: MediaQueryList | null = null;

const drawerClass = computed(() => ({
  open: props.open,
  left: props.side === "left",
  right: props.side === "right",
}));
const modalOpen = computed(() => props.open && !isDesktop.value);

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function syncViewport(e: MediaQueryList | MediaQueryListEvent): void {
  isDesktop.value = e.matches;
}

function getFocusableElements(): HTMLElement[] {
  if (!drawerModalRef.value) return [];

  return Array.from(
    drawerModalRef.value.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((element) => element.offsetParent !== null);
}

function focusInitialTarget(): void {
  const drawerModal = drawerModalRef.value;
  if (!drawerModal) return;

  const target =
    drawerModal.querySelector<HTMLElement>("[data-modal-body]") ??
    getFocusableElements()[0] ??
    drawerModal;

  target.focus();
}

async function scheduleInitialFocus(): Promise<void> {
  await nextTick();
  focusInitialTarget();
}

function onKeydown(e: KeyboardEvent): void {
  if (!props.open) return;

  if (e.key === "Escape") {
    emit("close");
    return;
  }

  if (!modalOpen.value || e.key !== "Tab") return;

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
  document.addEventListener("keydown", onKeydown);

  desktopMediaQuery = window.matchMedia("(min-width: 1024px)");
  syncViewport(desktopMediaQuery);
  desktopMediaQuery.addEventListener("change", syncViewport);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  desktopMediaQuery?.removeEventListener("change", syncViewport);
});

watch(
  modalOpen,
  (open) => {
    if (open) {
      previouslyFocusedElement.value =
        document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      void scheduleInitialFocus();
      return;
    }

    document.body.style.overflow = "";
    previouslyFocusedElement.value?.focus();
    previouslyFocusedElement.value = null;
  },
);
</script>

<template>
  <div class="responsive-drawer" :class="drawerClass" :aria-hidden="!open">
    <aside v-if="isDesktop" class="responsive-drawer-panel" :aria-label="title">
      <ModalHeader
        :title="title"
        :title-id="titleId"
        :close-label="closeLabel"
        @close="emit('close')"
      >
        <template v-if="$slots.icon" #icon>
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
          <template v-if="$slots.icon" #icon>
            <slot name="icon" />
          </template>
          <template #header-actions>
            <slot name="header-actions" />
          </template>
        </ModalHeader>
        <div class="responsive-drawer-content" data-modal-body tabindex="-1">
          <slot />
        </div>
      </section>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.responsive-drawer {
  @apply hidden
  lg:block lg:relative lg:overflow-hidden lg:shrink-0 w-0 lg:ease-in-out lg:duration-300 lg:transition-[width];

  &.open {
    @apply lg:w-[30rem];
  }

  &.left .responsive-drawer-panel {
    @apply lg:left-0 lg:-translate-x-full;
  }

  &.right .responsive-drawer-panel {
    @apply lg:right-0 lg:translate-x-full;
  }

  &.open .responsive-drawer-panel {
    @apply lg:opacity-100 lg:translate-x-0;
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
  @apply rounded-md max-h-[92vh] max-w-[92vw];
}

.responsive-drawer-content {
  @apply min-h-0 overflow-hidden pb-4;
}
</style>
