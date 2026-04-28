<template>
  <section class="flex flex-col gap-0.5">
    <!-- header -->
    <h3 class="grow font-semibold text-primary-lighter">
      <span class="inline-action-float">
        <slot name="badge" />
      </span>
      <slot name="title" />
    </h3>
    <!-- content -->
    <div>
      <slot name="summary" />
    </div>
  </section>
</template>
