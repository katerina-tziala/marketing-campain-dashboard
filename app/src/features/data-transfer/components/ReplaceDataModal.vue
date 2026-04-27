<script setup lang="ts">
import { BaseModal, Button } from '@/ui'

const emit = defineEmits<{
  confirm: []
  close: []
}>()
</script>

<template>
  <BaseModal title="Replace campaign data?" @close="emit('close')">
    <div class="modal-body">
      <p class="text-sm text-on-primary leading-6 w-full">
        Uploading a new CSV will permanently replace all current campaign data and reset any active
        analysis. This CANNOT be undone.
      </p>
      <p class="text-sm font-semibold text-primary-lighter">Do you want to continue?</p>
    </div>
    <div class="modal-footer">
      <Button class="primary" @click="emit('confirm')">Replace data</Button>
      <Button class="outline" @click="emit('close')">Cancel</Button>
    </div>
  </BaseModal>
</template>