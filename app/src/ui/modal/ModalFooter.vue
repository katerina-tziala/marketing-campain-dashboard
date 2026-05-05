<template>
  <div
    class="modal-footer mt-4"
    data-modal-footer
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.modal-footer {
  @apply flex
    flex-col
    items-stretch
    justify-center
    gap-4
    border-t
    py-5
    px-6
    sm:flex-row
    sm:items-center
    sm:justify-stretch;
}
</style>
