<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import ModalHeader from "./ModalHeader.vue";

defineProps<{
  title: string;
  closeLabel?: string;
}>();

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
      <div class="modal">
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
    grid
    grid-cols-1
    auto-rows-auto
    max-h-[92vh] max-w-[92vw];
}
</style>
