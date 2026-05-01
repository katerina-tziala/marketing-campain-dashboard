<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import ModalHeader from "../modal/ModalHeader.vue";

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
let desktopMediaQuery: MediaQueryList | null = null;

const drawerClass = computed(() => ({
  open: props.open,
  left: props.side === "left",
  right: props.side === "right",
}));

function syncViewport(e: MediaQueryList | MediaQueryListEvent): void {
  isDesktop.value = e.matches;
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape" && props.open) emit("close");
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
</script>

<template>
  <div class="responsive-drawer" :class="drawerClass" :aria-hidden="!open">
    <section
      v-if="isDesktop"
      class="responsive-drawer-panel"
      role="dialog"
      :aria-label="title"
    >
      <ModalHeader :title="title" :close-label="closeLabel" @close="emit('close')">
        <template v-if="$slots.icon" #icon>
          <slot name="icon" />
        </template>
        <template #header-actions>
          <slot name="header-actions" />
        </template>
      </ModalHeader>
      <slot />
    </section>
  </div>

  <Transition name="drawer-overlay">
    <div
      v-if="open && !isDesktop"
      class="responsive-drawer-overlay"
      @click.self="emit('close')"
    >
      <section
        class="responsive-drawer-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <ModalHeader :title="title" :close-label="closeLabel" @close="emit('close')">
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
      </section>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.responsive-drawer {
  @apply hidden
  lg:block lg:overflow-hidden lg:shrink-0 w-0 lg:ease-in-out lg:duration-300 lg:transition-[width];

  &.open {
    @apply lg:w-[30rem];
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
    border-faint;
}

.responsive-drawer-panel {
  @apply h-full sticky top-0;
}

.responsive-drawer-modal {
  @apply rounded-md min-h-[50vh] max-h-[92vh] max-w-[92vw];
}

.responsive-drawer-content {
  @apply min-h-0 overflow-hidden;
}

.responsive-drawer-overlay {
  @apply fixed
    flex
    items-center
    justify-center
    box-border
    overflow-hidden
    z-1000
    inset-0
    bg-surface-backdrop/70
    py-[5vh]
    px-[5vw]
    lg:hidden;
}
</style>
