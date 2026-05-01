<template>
  <div class="scrollbar-stable scrollbar-on-surface modal-body">
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
  py-4
  px-4
  w-full
  max-w-full
  text-typography-soft
  text-sm
  leading-6
  overflow-auto;
}
</style>
