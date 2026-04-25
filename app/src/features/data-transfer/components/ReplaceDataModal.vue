<script setup lang="ts">
import { BaseModal } from '@/ui'

const emit = defineEmits<{
  confirm: []
  close: []
}>()
</script>

<template>
  <BaseModal title="Replace campaign data?" @close="emit('close')">
    <div class="modal-body">
      <p class="text-sm text-typography-intense leading-6 w-full">
        Uploading a new CSV will permanently replace all current campaign data and reset any active
        analysis. This CANNOT be undone.
      </p>
      <p class="text-sm font-semibold text-primary-300">Do you want to continue?</p>
    </div>
    <div class="modal-footer">
      <button class="btn-primary" @click="emit('confirm')">Replace data</button>
      <button class="btn-secondary-outline" @click="emit('close')">Cancel</button>
    </div>
  </BaseModal>
</template>