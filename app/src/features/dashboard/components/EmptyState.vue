<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { FileTextIcon } from '../../../ui'
import { FileActions } from '../../data-transfer'

onMounted(() => { document.body.style.overflow = 'hidden' })
onUnmounted(() => { document.body.style.overflow = '' })

const emit = defineEmits<{ upload: [] }>()
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
    <FileActions @upload="emit('upload')" />
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

}
</style>
