<script setup lang="ts">
import { Modal, ModalBody, ModalFooter, Button } from "@/ui";

const emit = defineEmits<{
  confirm: [];
  close: [];
}>();
</script>

<template>
  <Modal title="Replace campaign data?" size="small" @close="emit('close')">
    <ModalBody>
      <p class="w-full">
        Uploading a new CSV will permanently replace all current campaign data
        and reset any active analysis. This CANNOT be undone.
      </p>
      <p class="text-sm font-semibold text-primary-lighter">
        Do you want to continue?
      </p>
    </ModalBody>
    <ModalFooter>
      <Button variant="primary" @click="emit('confirm')">Replace data</Button>
      <Button variant="outline" @click="emit('close')">Cancel</Button>
    </ModalFooter>
  </Modal>
</template>
