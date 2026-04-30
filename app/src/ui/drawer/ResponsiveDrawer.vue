<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import CloseIcon from "../icons/CloseIcon.vue";
import SheetHeader from "../layout/SheetHeader.vue";
import Button from "../primitives/Button.vue";

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

const drawerClass = computed(() => ({
  open: props.open,
  left: props.side === "left",
  right: props.side === "right",
}));

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape" && props.open) emit("close");
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="responsive-drawer" :class="drawerClass" :aria-hidden="!open">
    <section class="responsive-drawer-panel" role="dialog" :aria-label="title">
      <SheetHeader>
        <template v-if="$slots.icon" #icon>
          <slot name="icon" />
        </template>
        <template #header>
          <h2>{{ title }}</h2>
        </template>
        <template #action>
          <div class="responsive-drawer-actions">
            <slot name="header-actions" />
            <Button
              class="icon-only text-only"
              :aria-label="closeLabel"
              @click="emit('close')"
            >
              <CloseIcon />
            </Button>
          </div>
        </template>
      </SheetHeader>
      <div class="responsive-drawer-content">
        <slot />
      </div>
    </section>
  </div>

  <Transition name="drawer-overlay">
    <div
      v-if="open"
      class="responsive-drawer-overlay"
      @click.self="emit('close')"
    >
      <section
        class="responsive-drawer-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <SheetHeader>
          <template v-if="$slots.icon" #icon>
            <slot name="icon" />
          </template>
          <template #header>
            <h2>{{ title }}</h2>
          </template>
          <template #action>
            <div class="responsive-drawer-actions">
              <slot name="header-actions" />
              <Button
                class="icon-only text-only"
                :aria-label="closeLabel"
                @click="emit('close')"
              >
                <CloseIcon />
              </Button>
            </div>
          </template>
        </SheetHeader>
        <div class="responsive-drawer-content">
          <slot />
        </div>
      </section>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.responsive-drawer {
  @apply hidden;

  @media (min-width: 1024px) {
    @apply block overflow-hidden shrink-0 w-0 ease-in-out duration-300;
    transition-property: width;

    &.open {
      @apply w-[30rem];
    }
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

.responsive-drawer-actions {
  @apply flex items-center justify-end gap-2;
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
    bg-surface-backdrop/75
    py-[5vh]
    px-[5vw]
    lg:hidden;
}
</style>
