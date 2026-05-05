<script setup lang="ts">
import type { NotificationVariant } from '../feedback';
import Notification from '../feedback/Notification.vue';
import CloseIcon from '../icons/CloseIcon.vue';
import Button from '../primitives/Button.vue';

defineProps<{
  title: string;
  message?: string;
  variant: NotificationVariant;
}>();

defineEmits<{
  dismiss: [];
}>();
</script>

<template>
  <Notification
    :variant="variant"
    surface="dense"
    class="shadow-lg pointer-events-auto"
  >
    <template #title>
      {{ title }}
    </template>
    <template #action>
      <Button
        variant="ghost"
        size="small"
        icon-only
        aria-label="Dismiss notification"
        @click="$emit('dismiss')"
      >
        <CloseIcon />
      </Button>
    </template>
    <template v-if="message">{{ message }}</template>
  </Notification>
</template>
