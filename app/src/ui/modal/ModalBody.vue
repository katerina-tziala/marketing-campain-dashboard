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
  @apply grow
  flex
  flex-col
  justify-stretch
  gap-3 
  p-4
  w-full
  max-w-full
  text-typography-soft
  text-sm
  leading-6
  outline-none
  overflow-auto;
}
</style>
