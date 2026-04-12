<script setup lang="ts">
import { BaseButton, BaseModal } from '../../../ui'

const emit = defineEmits<{
  confirm: []
  close: []
}>()
</script>

<template>
  <BaseModal title="Replace campaign data?" @close="emit('close')">
    <div class="replace-modal__body">
      <p class="replace-modal__message">
        Uploading a new CSV will permanently replace all current campaign data and reset any active
        analysis. This cannot be undone.
      </p>
      <p class="replace-modal__prompt">Do you want to continue?</p>
    </div>
    <div class="replace-modal__footer">
      <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
      <BaseButton @click="emit('confirm')">Replace data</BaseButton>
    </div>
  </BaseModal>
</template>

<style lang="scss" scoped>
.replace-modal {
  &__body {
    padding: theme('spacing.6');
    display: flex;
    flex-direction: column;
    gap: theme('spacing.3');
    max-width: 22rem;
  }

  &__message {
    font-size: theme('fontSize.sm');
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.6;
  }

  &__prompt {
    font-size: theme('fontSize.sm');
    font-weight: 500;
    color: var(--color-title);
    margin: 0;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: theme('spacing.3');
    padding: theme('spacing.4') theme('spacing.6');
    border-top: 1px solid var(--color-border);
  }
}
</style>
