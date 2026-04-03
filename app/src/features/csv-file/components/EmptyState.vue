<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { BaseButton, DownloadIcon, UploadIcon } from '../../../ui'
import { useToastStore } from '../../../stores/toastStore'
import { downloadCsv } from '../utils/downloadCsv'
import { MOCK_CAMPAINS } from '../../../common/data/MOCK_CAMPAIN_DATA'

const toastStore = useToastStore()

onMounted(() => { document.body.style.overflow = 'hidden' })
onUnmounted(() => { document.body.style.overflow = '' })

const emit = defineEmits<{
  upload: []
}>()

function handleDownloadTemplate(): void {
  try {
    downloadCsv(MOCK_CAMPAINS, 'marketing_campain_sample')
  } catch {
    toastStore.addToast('Failed to generate the CSV template. Please try again.')
  }
}
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    </div>
    <h2 class="empty-state__title">No campaign data yet</h2>
    <p class="empty-state__description">
      Upload a CSV file to generate your campaign performance dashboard.<br />
      Need a starting point? Download our sample template.
    </p>
    <div class="empty-state__actions">
      <BaseButton variant="ghost" @click="handleDownloadTemplate">
        <DownloadIcon />
        Download Template
      </BaseButton>
      <BaseButton variant="primary" @click="emit('upload')">
        <UploadIcon />
        Upload CSV
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
  padding: theme('spacing.8');
  gap: theme('spacing.4');

  &__icon {
    color: var(--color-border);

    svg {
      width: 4rem;
      height: 4rem;
    }
  }

  &__title {
    font-size: theme('fontSize.xl');
    font-weight: 600;
    color: var(--color-title);
    margin: 0;
  }

  &__description {
    font-size: theme('fontSize.sm');
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: theme('spacing.6');
    margin-top: theme('spacing.2');
    width: 100%;
    max-width: 380px;

    :deep(.base-btn) {
      flex: 1;
    }

    @media (max-width: 479px) {
      flex-direction: column;

      :deep(.base-btn) {
        width: 100%;
      }
    }
  }
}
</style>
