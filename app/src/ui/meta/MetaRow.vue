<script setup lang="ts">
import type { MetaRowSeparator, MetaRowSize, MetaRowTone } from './meta.types';

const props = withDefaults(
  defineProps<{
    separator?: MetaRowSeparator;
    size?: MetaRowSize;
    tone?: MetaRowTone;
  }>(),
  {
    separator: 'none',
    size: 'small',
    tone: 'none',
  },
);
</script>

<template>
  <p
    class="meta-row"
    :class="[props.separator, props.size, props.tone === 'none' ? undefined : props.tone]"
  >
    <slot />
  </p>
</template>

<style lang="scss" scoped>
.meta-row {
  @apply flex
  	flex-wrap
  	gap-x-1.5
  	gap-y-1.5
  	items-center;

  &.meta-row.divider {
    @apply gap-x-2;
  }

  &.meta-row.base {
    @apply text-base;
  }

  &.meta-row.tiny {
    @apply text-xs;
  }

  &.meta-row.small {
    @apply text-sm;
  }

  &:not(.divider, .bullet) {
    @apply gap-x-2;
  }
}

/* bullet variant */
.meta-row.bullet :slotted(*:not(:first-child))::before {
  @apply align-middle
  	bg-primary-light
  	content-['']
  	h-1
  	inline-block
  	mr-1.5
  	rounded-full
  	w-1;
}

/* divider variant */
.meta-row.divider :slotted(*:not(:first-child)) {
  @apply border-l
  	border-primary-light
  	pl-2;
}

.meta-row.divider .meta-item + .meta-item {
  @apply border-l
  	border-primary-light
  	pl-2;
}

.meta-row.info.bullet :slotted(*:not(:first-child))::before {
  @apply bg-info;
}

.meta-row.info.divider :slotted(*:not(:first-child)) {
  @apply border-info;
}

.meta-row.info-lighter.bullet :slotted(*:not(:first-child))::before {
  @apply bg-info-lighter;
}

.meta-row.info-lighter.divider :slotted(*:not(:first-child)) {
  @apply border-info-lighter;
}

.meta-row.primary-lighter.bullet :slotted(*:not(:first-child))::before {
  @apply bg-primary-lighter;
}

.meta-row.primary-lighter.divider :slotted(*:not(:first-child)) {
  @apply border-primary-lighter;
}
</style>
