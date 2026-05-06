<template>
  <div
    class="scrollbar-stable-both scrollbar-on-surface modal-body"
    data-modal-body
    tabindex="-1"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.modal-body {
  @apply flex
    flex-col
    gap-3
    grow
    justify-stretch
    leading-6
    max-w-full
    outline-none
    overflow-auto
    p-4
    text-sm
    text-typography-soft
    w-full;
}
</style>
