<template>
  <p class="meta-row">
    <slot />
  </p>
</template>

<style lang="scss" scoped>
.meta-row {
  @apply flex flex-wrap items-center text-sm gap-x-1.5 gap-y-1;

  &.meta-row--divider {
    @apply gap-x-2;
  }
}
 
/* bullet variant */
.meta-row--bullet :slotted(*:not(:first-child))::before {
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
.meta-row--divider :slotted(*:not(:first-child))  {
  @apply border-l
    border-primary-light 
    pl-2;
}
 .meta-row--divider .meta-item + .meta-item {
  @apply border-l border-primary-light pl-2;
}
</style>
