<template>
  <article class="card">
    <slot />
  </article>
</template>

<style lang="scss">
.card {
  @apply rounded
    flex
    flex-col
    items-start
    justify-stretch
    gap-4
    p-4
    shadow-md
    text-sm
    text-typography-soft
    bg-surface-elevated
    border
    border-subtle;
}

.card.secondary {
  @apply rounded-md
    shadow-sm
    border
    p-3
    flex
    flex-col
    items-start
    justify-stretch
    gap-3
    text-sm
    text-typography-muted
    bg-surface;

    :slotted(h5) {
      @apply font-medium text-typography-primary-light leading-5; 
    }
}
 
</style>
