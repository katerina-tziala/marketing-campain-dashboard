<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { BaseButton, DownloadIcon, FileTextIcon, UploadIcon } from '../../../ui'
import { useDownloadTemplate } from '../../csv-file/composables/useDownloadTemplate'

const { downloadTemplate } = useDownloadTemplate()

onMounted(() => { document.body.style.overflow = 'hidden' })
onUnmounted(() => { document.body.style.overflow = '' })

const emit = defineEmits<{
  upload: []
}>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <FileTextIcon />
    </div>
    <h2 class="empty-state__title">No campaign data yet</h2>
    <p class="empty-state__description">
      Upload a CSV file to generate your campaign performance dashboard.<br />
      Need a starting point? Download our sample template.
    </p>
    <div class="empty-state__actions">
      <BaseButton variant="ghost" @click="downloadTemplate">
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
