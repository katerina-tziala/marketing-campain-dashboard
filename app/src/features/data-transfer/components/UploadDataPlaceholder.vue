<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

import { Button, DownloadIcon, FileTextIcon, UploadIcon } from '@/ui';

import { useDownloadTemplate } from '../composables';

const emit = defineEmits<{ upload: [] }>();
onMounted(() => {
  document.body.style.overflow = 'hidden';
});
onUnmounted(() => {
  document.body.style.overflow = '';
});

const { downloadTemplate } = useDownloadTemplate();
</script>

<template>
  <div class="empty-state">
    <FileTextIcon class="text-4xl inline-block text-primary-light/60" />
    <h2 class="empty-state-title">No campaign data yet</h2>
    <p class="empty-state-description">
      Upload a CSV file to generate your campaign performance dashboard.<br />
      Need a starting point? Download our sample template.
    </p>

    <div class="file-actions">
      <Button
        variant="outline"
        class="grow w-full"
        @click="downloadTemplate"
      >
        <DownloadIcon />
        Download Template
      </Button>
      <Button
        variant="primary"
        class="grow w-full"
        @click="emit('upload')"
      >
        <UploadIcon />
        Upload data
      </Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  @apply flex
    flex-col
    items-center
    justify-center
    text-center
    p-8
    gap-6
    m-auto
    w-full;
}

.empty-state-title {
  @apply text-primary-light
    text-xl
    font-semibold
    leading-6
    tracking-wide;
}

.empty-state-description {
  @apply text-typography-muted
    text-sm
    leading-6
    tracking-wide;
}

.file-actions {
  @apply flex
    items-center
    gap-6
    mt-2
    w-full
    flex-col
    max-w-md
    xs:flex-row;
}
</style>
