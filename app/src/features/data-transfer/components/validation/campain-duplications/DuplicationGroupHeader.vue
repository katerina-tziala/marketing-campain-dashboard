<script setup lang="ts">
import { Badge, Button, AlertTriangleIcon, CheckIcon, CircleCheckIcon } from "@/ui";

const props = defineProps<{
  campaignName: string;
  rowCount: number;
  isSelected: boolean;
  needsAttentionMode: boolean;
}>();

const emit = defineEmits<{ clear: [] }>();
</script>

<template>
  <span class="group-title-row">
    <span class="group-title-text">{{ props.campaignName }} ({{ props.rowCount }})</span>
    <!-- Badge based on state -->
    <Badge v-if="props.isSelected" class="success dimmed">
      <CheckIcon />Resolved
    </Badge>
    <Badge v-else-if="props.needsAttentionMode" class="danger">
      <AlertTriangleIcon />Requires selection
    </Badge>
    <Badge v-else class="warning">
      <CircleCheckIcon />Select one
    </Badge>
    <!-- Clear button -->
    <Button
      v-if="props.isSelected"
      class="destructive small"
      @click.stop="emit('clear')"
    >
      Clear selection
    </Button>
  </span>
</template>

<style lang="scss" scoped>
.group-title-row {
  @apply flex flex-wrap items-center gap-2;
}

.group-title-text {
  @apply min-w-0 break-words;
}
</style>
