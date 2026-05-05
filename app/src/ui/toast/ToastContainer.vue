<script setup lang="ts">
import { useToastStore } from '@/app/stores';

import ToastNotification from './ToastNotification.vue';

const toastStore = useToastStore();
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup
        name="toast"
        tag="div"
        class="toast-list"
      >
        <ToastNotification
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :title="toast.title"
          :message="toast.message"
          :variant="toast.type"
          @dismiss="toastStore.removeToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.toast-container {
  @apply fixed
    bottom-6
    left-6
    z-1100
    pointer-events-none;
}

.toast-list {
  @apply flex
    flex-col
    gap-3
    items-start;
}

.toast-enter-active,
.toast-leave-active {
  @apply transition-opacity
    transition-transform
    duration-300
    ease-in-out;
}

.toast-enter-from {
  @apply opacity-0
    translate-y-2;
}

.toast-leave-to {
  @apply opacity-0
    -translate-x-4;
}
</style>
