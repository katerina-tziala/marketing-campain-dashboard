<script setup lang="ts">
import { useToastStore } from '../../stores/toastStore'
import ToastNotification from './ToastNotification.vue'

const toastStore = useToastStore()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-label="Notifications">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <ToastNotification
          v-for="toast in toastStore.toasts"
          :key="toast.id"
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
  @apply fixed bottom-6 right-6 z-full pointer-events-none;
}

.toast-list {
  @apply flex flex-col gap-3 items-end;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 250ms ease, transform 250ms ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
