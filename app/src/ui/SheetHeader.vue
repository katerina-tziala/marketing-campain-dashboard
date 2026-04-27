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
  @apply flex items-start  gap-2 py-3 px-4 border-b;
}

.sheet-header-icon {
  @apply text-primary-lighter shrink-0 p-0;
}

.sheet-header-title {
  @apply grow;

  :slotted(h1),
  :slotted(h2),
  :slotted(h3),
  :slotted(h4),
  :slotted(h5),
  :slotted(h6) {
    @apply m-0
      bg-gradient-to-r
      from-accent-light from-5%
      via-info-lighter via-info-light via-primary-light via-primary-lighter
      to-secondary-light
      bg-clip-text
      text-transparent
      w-fit;
  }
}

.sheet-header-action {
  @apply shrink-0;
}
</style>
