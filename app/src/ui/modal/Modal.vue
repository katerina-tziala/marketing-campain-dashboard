<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import ModalHeader from "./ModalHeader.vue";

type ModalSize = "default" | "small" | "medium" | "large";

const props = withDefaults(
  defineProps<{
    title: string;
    closeLabel?: string;
    size?: ModalSize;
  }>(),
  {
    size: "default",
  },
);

const emit = defineEmits<{
  close: [];
}>();

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") emit("close");
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  document.body.style.overflow = "hidden";
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <div
      class="overlay"
      aria-modal="true"
      role="dialog"
      :aria-label="title"
      @click.self="emit('close')"
    >
      <div class="modal" :class="props.size">
        <ModalHeader
          :title="title"
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
