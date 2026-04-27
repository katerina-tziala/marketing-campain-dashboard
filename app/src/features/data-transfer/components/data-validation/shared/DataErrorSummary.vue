<template>
  <section class="flex flex-col gap-0.5">
    <!-- header -->
    <h3 class="grow font-semibold text-primary-lighter">
      <span class="float-right ml-2 mb-1">
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
