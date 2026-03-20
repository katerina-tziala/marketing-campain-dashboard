<script setup lang="ts">
// AppShell — top-level layout wrapper
// Contains the app header and main content area.
// All page content is rendered via the default slot.
</script>

<template>
  <div class="app-shell">
    <header class="app-shell__header">
      <div class="app-shell__header-inner">
        <span class="app-shell__title">Marketing Campaign Dashboard</span>
      </div>
    </header>

    <main class="app-shell__main">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__header {
    background-color: theme('colors.primary.700');
    color: #fff;
    padding: theme('spacing.4') theme('spacing.6');
  }

  &__header-inner {
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
  }

  &__title {
    font-size: theme('fontSize.lg');
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  &__main {
    flex: 1;
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    padding: theme('spacing.8') theme('spacing.6');
  }
}
</style>
