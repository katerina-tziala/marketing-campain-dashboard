<template>
  <div class="modal-footer">
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
    xs:flex-row-reverse
    xs:items-center
    xs:justify-start;
}
</style>
