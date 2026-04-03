<script setup lang="ts">
import { BaseButton, DownloadIcon } from '../ui'
import { ToastContainer } from '../ui/toast'
import { useToastStore } from '../stores/toastStore'
import { downloadCsv } from '../features/csv-file/utils/downloadCsv'
import { MOCK_CAMPAINS } from '../common/data/MOCK_CAMPAIN_DATA'

const toastStore = useToastStore()

function handleDownloadTemplate(): void {
  try {
    downloadCsv(MOCK_CAMPAINS, 'marketing_campain_sample')
  } catch {
    toastStore.addToast('Failed to generate the CSV template. Please try again.')
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="app-shell__header">
      <h1 class="app-shell__title">Marketing Campaign Dashboard</h1>
      <BaseButton variant="ghost" @click="handleDownloadTemplate">
        <DownloadIcon />
        Download Template
      </BaseButton>
    </header>
    <main class="app-shell__main">
      <slot />
    </main>
    <ToastContainer />
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: theme('spacing.4');
    background-color: var(--color-header-bg);
    padding: theme('spacing.5') theme('spacing.6');
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    font-size: theme('fontSize.2xl');
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0;
    background: linear-gradient(135deg, #818cf8 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__main {
    flex: 1;
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    padding: theme('spacing.6') theme('spacing.6');

    @media (min-width: 1280px) {
      padding: theme('spacing.6') 0;
    }
  }
}
</style>
