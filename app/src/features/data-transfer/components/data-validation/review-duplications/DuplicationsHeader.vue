<script setup lang="ts">
import { AlertTriangleIcon, Badge, Button, CheckIcon, CircleCheckIcon } from '@/ui';

const props = defineProps<{
  campaignName: string;
  rowCount: number;
  isSelected: boolean;
  needsAttentionMode: boolean;
  resolvedCount?: number;
  clearable?: boolean;
  clearLabel?: string;
}>();

const emit = defineEmits<{ clear: [] }>();
</script>

<template>
  <span class="group-title-row">
    <span class="group-title-text"
      >{{ props.campaignName }} ({{
        props.resolvedCount !== undefined
          ? `${props.resolvedCount}/${props.rowCount}`
          : props.rowCount
      }})</span
    >
    <!-- Badge based on state -->
    <Badge
      v-if="props.isSelected"
      variant="success"
      tone="dimmed"
    >
      <CheckIcon />Resolved
    </Badge>
    <Badge
      v-else-if="props.needsAttentionMode"
      variant="danger"
    >
      <AlertTriangleIcon />Requires selection
    </Badge>
    <Badge
      v-else
      variant="warning"
    >
      <CircleCheckIcon />Choose one
    </Badge>
    <!-- Clear button -->
    <Button
      v-if="props.isSelected || props.clearable"
      variant="destructive"
      size="smaller"
      @click.stop="emit('clear')"
    >
      {{ props.clearLabel ?? 'Clear selection' }}
    </Button>
  </span>
</template>

<style lang="scss" scoped>
.group-title-row {
  @apply flex
    flex-wrap
    gap-2
    items-center
    min-h-9
    px-0.5;
}

.group-title-text {
  @apply break-words
    min-w-0;
}
</style>
