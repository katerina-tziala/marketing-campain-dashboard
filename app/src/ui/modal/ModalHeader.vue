<script setup lang="ts">
import CloseIcon from '../icons/CloseIcon.vue';
import Button from '../primitives/Button.vue';

const props = defineProps<{
  title: string;
  titleId?: string;
  closeLabel?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const finalCloseLabel = props.closeLabel ?? 'Close';
</script>

<template>
  <div class="modal-header">
    <div class="modal-header-content">
      <div
        v-if="$slots.icon"
        class="modal-header-icon"
      >
        <slot name="icon" />
      </div>
      <h2 :id="titleId">{{ title }}</h2>
    </div>
    <div class="modal-header-actions">
      <slot name="header-actions" />
      <Button
        variant="text-only"
        size="small"
        icon-only
        data-modal-close
        :aria-label="finalCloseLabel"
        @click="emit('close')"
      >
        <CloseIcon />
      </Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-header {
  @apply flex
    items-start
    gap-2
    border-b
    py-3.5
    px-4;
}

.modal-header-content {
  @apply grow
    flex
    items-start
    gap-2
    pt-1.5;
}

.modal-header-icon {
  @apply text-primary-lighter
    shrink-0
    p-0
    text-lg
    leading-5;
}

.modal-header-content > h2 {
  @apply m-0
    tracking-wider
    text-primary-lighter
    font-medium
    text-lg
    grow;
}

.modal-header-actions {
  @apply flex
    items-center
    justify-end
    gap-2
    shrink-0;
}
</style>
