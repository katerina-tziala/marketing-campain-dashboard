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
    flex-1
    flex-row
    overflow-hidden;
}

.split-pane-main {
  @apply flex
    flex-col
    mx-auto
    overflow-x-hidden
    overflow-y-hidden
    w-full;
  @include cq-container('main');
}
</style>
