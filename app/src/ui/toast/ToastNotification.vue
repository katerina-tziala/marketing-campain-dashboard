<script setup lang="ts">
import type { NotificationVariant } from "@/ui/feedback";
import { CloseIcon } from "@/ui/icons";
import Button from "../primitives/Button.vue";
import Notification from "../feedback/Notification.vue";

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
  <Notification :variant="variant" class="dense-bg shadow-lg pointer-events-auto">
    <template #title>
      <span>{{ title }}</span>
    </template>
    <template #action>
      <Button
        class="icon-only ghost"
        aria-label="Dismiss notification"
        @click="$emit('dismiss')"
      >
        <CloseIcon />
      </Button>
    </template>
    <template v-if="message">{{ message }}</template>
  </Notification>
</template>
