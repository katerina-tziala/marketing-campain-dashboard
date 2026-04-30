<template>
  <p class="meta-row">
    <slot />
  </p>
</template>

<style lang="scss" scoped>
.meta-row {
  @apply flex flex-wrap items-center text-sm gap-x-1.5 gap-y-1.5;

  &.meta-row.divider {
    @apply gap-x-2;
  }

  &.meta-row.tiny {
    font-size: 0.75rem;
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
  content: "";
  @apply inline-block
    w-1
    h-1
    rounded-full
    bg-primary-light
    align-middle
    mr-1.5;
}

/* divider variant */
.meta-row.divider :slotted(*:not(:first-child)) {
  @apply border-l
    border-primary-light 
    pl-2;
}

.meta-row.divider .meta-item + .meta-item {
  @apply border-l border-primary-light pl-2;
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
