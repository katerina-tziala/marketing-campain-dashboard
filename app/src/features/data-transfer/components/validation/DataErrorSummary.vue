 <template>
  <section class="flex flex-col gap-1">
    <div class="flex flex-row items-start justify-center gap-2">
      <h3 class="grow font-semibold text-primary-300">
        <slot name="title" />
      </h3>
      <slot name="badge" />
    </div>
    <div class="text-sm text-typography">
      <slot name="summary" />
    </div>
    </section>
</template>
 