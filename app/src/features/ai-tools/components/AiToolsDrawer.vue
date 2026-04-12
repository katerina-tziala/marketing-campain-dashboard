<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { CloseIcon, SparklesIcon } from '../../../ui/icons'
import AiToolsContent from './AiToolsContent.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <!-- lg+: push drawer — width transitions 0 → 400px, compresses dashboard -->
  <div class="ai-drawer" :class="{ 'ai-drawer--open': open }" aria-hidden="true">
    <div class="ai-drawer__panel">
      <div class="ai-drawer__header">
        <div class="ai-drawer__header-start">
          <SparklesIcon class="ai-drawer__icon" />
          <h2 class="ai-drawer__title">AI Tools</h2>
        </div>
        <button class="ai-close-btn" aria-label="Close AI panel" @click="emit('close')">
          <CloseIcon />
        </button>
      </div>
      <AiToolsContent />
    </div>
  </div>

  <!-- <lg: fixed overlay — panel on top of dashboard -->
  <Transition name="ai-overlay">
    <div
      v-if="open"
      class="ai-overlay"
      @click.self="emit('close')"
    >
      <div class="ai-overlay__panel">
        <div class="ai-overlay__header">
          <div class="ai-overlay__header-start">
            <SparklesIcon class="ai-overlay__icon" />
            <h2 class="ai-overlay__title">AI Tools</h2>
          </div>
          <button class="ai-close-btn" aria-label="Close AI panel" @click="emit('close')">
            <CloseIcon />
          </button>
        </div>
        <AiToolsContent />
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
// ── Shared close button ──────────────────────────────────────────────────────

.ai-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  padding: theme('spacing.2');
  cursor: pointer;
  color: var(--color-text);
  transition: color 150ms ease, background-color 150ms ease;
  border-radius: theme('borderRadius.md');
  border: 2px solid transparent;

  &:hover {
    color: theme('colors.primary.300');
    background-color: color-mix(in srgb, theme('colors.primary.500') 20%, transparent);
  }

  &:focus-visible {
    border-color: theme('colors.primary.500');
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
}

// ── Push drawer (lg+) ───────────────────────────────────────────────────────

.ai-drawer {
  display: none;

  @media (min-width: 1024px) {
    display: block;
    overflow: hidden;
    flex-shrink: 0;
    width: 0;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &--open {
      width: 480px;
    }
  }

  &__panel {
    width: 480px;
    height: 100vh;
    position: sticky;
    top: 0;
    background-color: var(--color-surface);
    border-left: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: theme('spacing.5') theme('spacing.6');
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  &__header-start {
    display: flex;
    align-items: center;
    gap: theme('spacing.2');
  }

  &__icon {
    width: 1.25rem;
    height: 1.25rem;
    color: #818cf8;
    flex-shrink: 0;
  }

  &__title {
    font-size: theme('fontSize.lg');
    font-weight: 600;
    color: theme('colors.slate.300');
    margin: 0;
  }
}

// ── Overlay (<lg) ───────────────────────────────────────────────────────────

.ai-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 5vh 5vw;

  // Hidden on lg+ — drawer takes over
  @media (min-width: 1024px) {
    display: none;
  }

  &__panel {
    width: 100%;
    max-width: 90vw;
    max-height: 90vh;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: theme('borderRadius.lg');
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: theme('spacing.5') theme('spacing.6');
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  &__header-start {
    display: flex;
    align-items: center;
    gap: theme('spacing.2');
  }

  &__icon {
    width: 1.25rem;
    height: 1.25rem;
    color: #818cf8;
    flex-shrink: 0;
  }

  &__title {
    font-size: theme('fontSize.lg');
    font-weight: 600;
    color: theme('colors.slate.300');
    margin: 0;
  }
}

// ── Overlay transition ──────────────────────────────────────────────────────

.ai-overlay-enter-active,
.ai-overlay-leave-active {
  transition: opacity 0.2s ease;

  .ai-overlay__panel {
    transition: transform 0.2s ease;
  }
}

.ai-overlay-enter-from,
.ai-overlay-leave-to {
  opacity: 0;

  .ai-overlay__panel {
    transform: translateX(24px);
  }
}
</style>
