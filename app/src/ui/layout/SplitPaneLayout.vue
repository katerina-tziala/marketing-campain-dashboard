<template>
  <div class="split-pane-layout">
    <main class="split-pane-main">
      <slot />
    </main>
    <slot name="aside" />
  </div>
</template>

<style lang="scss" scoped>
.split-pane-layout {
  @apply flex
    flex-row
    flex-1
    overflow-hidden;
}

.split-pane-main {
  @apply flex
    flex-col
    w-full
    mx-auto
    overflow-x-hidden
    overflow-y-hidden;
  @include cq-container('main');
}
</style>
