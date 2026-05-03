<script setup lang="ts">
import { Modal, ModalBody, ModalFooter, Button } from "@/ui";

const emit = defineEmits<{
  confirm: [];
  close: [];
}>();
</script>

<template>
  <Modal
    title="Replace campaign data?"
    size="small"
    initial-focus="footer-actions"
    @close="emit('close')"
  >
    <ModalBody>
      <p class="w-full">
        Uploading new data will replace your current dataset and reset any
        active analysis. This action cannot be undone.
      </p>
      <p class="text-sm font-semibold text-primary-lighter">
        Do you want to continue?
      </p>
    </ModalBody>
    <ModalFooter>
      <Button variant="outline" class="sm:mr-auto" @click="emit('close')">Cancel</Button>
      <Button variant="primary" @click="emit('confirm')">Replace data</Button>
    </ModalFooter>
  </Modal>
</template>
