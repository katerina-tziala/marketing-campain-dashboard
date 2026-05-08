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
  @apply border-b
  	flex
  	gap-2
  	items-start
  	px-4
  	py-3.5;
}

.modal-header-content {
  @apply flex
  	gap-2
  	grow
  	items-start
  	pt-1.5;
}

.modal-header-icon {
  @apply leading-5
  	p-0
  	shrink-0
  	text-lg
  	text-primary-lighter;
}

.modal-header-content > h2 {
  @apply font-medium
  	grow
  	m-0
  	text-lg
  	text-primary-lighter
  	tracking-wider;
}

.modal-header-actions {
  @apply flex
  	gap-2
  	items-center
  	justify-end
  	shrink-0;
}
</style>
