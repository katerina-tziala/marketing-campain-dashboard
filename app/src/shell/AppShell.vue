<script setup lang="ts">
import { provide, ref } from 'vue'
import { BaseButton, UploadIcon } from '../ui'
import { ToastContainer } from '../ui/toast'
import { useCampaignStore } from '../stores/campaignStore'
import UploadModal from '../features/csv-file/components/UploadModal.vue'

const store = useCampaignStore()
const uploadModal = ref<InstanceType<typeof UploadModal> | null>(null)

provide('openUploadModal', () => uploadModal.value?.open())
</script>

<template>
  <div class="app-shell">
    <header class="app-shell__header">
      <h1 class="app-shell__title">Marketing Campaign Dashboard</h1>
      <BaseButton v-if="store.campaigns.length > 0" variant="ghost" @click="uploadModal?.open()">
        <UploadIcon />
        Upload CSV
      </BaseButton>
    </header>
    <main class="app-shell__main">
      <slot />
    </main>
    <UploadModal ref="uploadModal" />
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
    display: flex;
    flex-direction: column;
    flex: 1;
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
  }
}
</style>
