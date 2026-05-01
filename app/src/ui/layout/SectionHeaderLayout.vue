<template>
  <div class="flex flex-col gap-1.5 w-full">
    <div class=" w-full flex flex-nowrap items-stretch justify-start gap-2">
      <div class="flex items-center justify-center grow">
        <slot name="header" />
      </div>
        <slot name="action" />
    </div>
    <slot/>
  </div>
</template>