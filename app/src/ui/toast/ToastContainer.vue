<script setup lang="ts">
import { useToastStore } from '../../stores/toastStore'
import ToastNotification from './ToastNotification.vue'

const toastStore = useToastStore()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-label="Notifications">
      <TransitionGroup name="toast" tag="div" class="toast-container__list">
        <ToastNotification
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :message="toast.message"
          @dismiss="toastStore.removeToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  bottom: theme('spacing.6');
  right: theme('spacing.6');
  z-index: 9999;
  pointer-events: none;

  &__list {
    display: flex;
    flex-direction: column;
    gap: theme('spacing.3');
    align-items: flex-end;
  }
}

// ── Transition ─────────────────────────────────────────────────────────────────

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
