<template>
  <div class="sheet-header">
    <div class="grow flex justify-start items-start gap-2">
      <div v-if="$slots.icon" class="sheet-header-icon">
        <slot name="icon" />
      </div>
      <div class="sheet-header-title">
        <slot name="header" />
      </div>
    </div>
    <div v-if="$slots.action" class="sheet-header-action">
      <slot name="action" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sheet-header {
  @apply flex items-start gap-2 py-4 px-4 border-b border-t border-t-transparent;
}

.sheet-header-icon {
  @apply text-primary-lighter shrink-0 p-0 text-lg leading-5;
}

.sheet-header-title {
  @apply grow;

  :slotted(*) {
    @apply m-0
      text-primary-lighter
      font-medium 
      text-lg
      w-fit;
  }
}

.sheet-header-action {
  @apply shrink-0;
}
</style>
