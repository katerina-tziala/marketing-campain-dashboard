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
    gap-6
    items-center
    justify-center
    m-auto
    p-8
    text-center
    w-full;
}

.empty-state-title {
  @apply font-semibold
    leading-6
    text-primary-light
    text-xl
    tracking-wide;
}

.empty-state-description {
  @apply leading-6
    text-sm
    text-typography-muted
    tracking-wide;
}

.file-actions {
  @apply flex
    flex-col
    gap-6
    items-center
    max-w-md
    mt-2
    w-full
    xs:flex-row;
}
</style>
