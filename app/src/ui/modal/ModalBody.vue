<template>
  <div class="modal-body">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.modal-body {
  @apply flex flex-col gap-3 p-6 w-fit max-w-2xl text-typography-soft text-sm leading-6;
}
</style>
