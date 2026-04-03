<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import CloseIcon from './icons/CloseIcon.vue'

defineProps<{
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" aria-modal="true" role="dialog" :aria-label="title" @click.self="emit('close')">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title">{{ title }}</h2>
          <button class="modal__close" aria-label="Close" @click="emit('close')">
            <CloseIcon />
          </button>
        </div>
        <div class="modal__body">
          <slot name="body" />
        </div>
        <div v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: theme('spacing.4');
}

.modal {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: theme('borderRadius.lg');
  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - 2rem);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: theme('spacing.5') theme('spacing.6');
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    font-size: theme('fontSize.lg');
    font-weight: 600;
    color: var(--color-title);
    margin: 0;
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: theme('spacing.1');
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: color 150ms ease;
    border-radius: theme('borderRadius.sm');

    &:hover {
      color: var(--color-text);
    }

    &:focus-visible {
      outline: 2px solid #6366f1;
      outline-offset: 2px;
    }

    svg {
      width: 1rem;
      height: 1rem;
    }
  }

  &__body {
    padding: theme('spacing.6');
    display: flex;
    flex-direction: column;
    gap: theme('spacing.5');
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: theme('spacing.3');
    padding: theme('spacing.4') theme('spacing.6');
    border-top: 1px solid var(--color-border);
  }
}
</style>
