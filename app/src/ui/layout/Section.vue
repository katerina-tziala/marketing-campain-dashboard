<template>
  <section class="flex flex-col gap-1.5 w-full">
    <div class="w-full flex flex-wrap items-start justify-start gap-2">
      <div class="flex items-center justify-center grow">
        <slot name="header" />
      </div>
      <slot name="action" />
    </div>
    <slot />
  </section>
</template>
