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
  @apply border-t
  	flex
  	flex-col
  	gap-4
  	items-stretch
  	justify-center
  	px-6
  	py-5
  	sm:flex-row
  	sm:items-center
  	sm:justify-stretch;
}
</style>
