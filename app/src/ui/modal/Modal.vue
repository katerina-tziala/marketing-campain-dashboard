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
      class="modal-backdrop"
      aria-modal="true"
      role="dialog"
      :aria-label="title"
      @click.self="emit('close')"
    >
      <div class="modal">
        <ModalHeader :title="title" :close-label="closeLabel" @close="emit('close')" />
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-backdrop {
  @apply fixed
    flex
    items-center
    justify-center
    p-4
    box-border
    overflow-hidden
    inset-0
    z-1000
    bg-surface-backdrop/70;
}

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
    auto-rows-auto;
}
</style>
