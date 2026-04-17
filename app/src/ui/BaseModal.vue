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
          <button class="btn-icon-secondary" aria-label="Close" @click="emit('close')">
            <CloseIcon /> 
          </button>
        </div>
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
    z-1000
    inset-0
    bg-black/[0.7];
}

.modal {
  @apply w-fit
    h-fit
    overflow-hidden
    rounded-md
    shadow-md
    bg-surface
    border
    border-surface-border
    grid 
    grid-cols-1
    auto-rows-auto;

  &__header {
    @apply flex
      items-start
      justify-between
      border
      border-surface-border
      gap-2
      py-3
      px-4;
  }

  &__title {
    @apply text-primary-400 text-lg font-semibold m-0 pt-1;
  }
}
</style>
