<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { CloseIcon, SparklesIcon } from '../../../ui/icons'
import AiToolsContent from './AiToolsContent.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

// Lock body scroll when modal is visible (small screens only)
watch(
  () => props.open,
  (val) => {
    const isLargeScreen = window.matchMedia('(min-width: 1024px)').matches
    if (!isLargeScreen) {
      document.body.style.overflow = val ? 'hidden' : ''
    }
  },
)
</script>

<template>
  <!-- Push panel — lg+ only; outer width transitions 0 → 400px -->
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

  <!-- Modal — <lg only; teleported to body, hidden on lg+ via CSS -->
  <Teleport to="body">
    <Transition name="ai-modal">
      <div
        v-if="open"
        class="ai-modal-wrap"
        role="dialog"
        aria-modal="true"
        aria-label="AI Tools"
      >
        <div class="ai-modal">
          <div class="ai-modal__header">
            <div class="ai-modal__header-start">
              <SparklesIcon class="ai-modal__icon" />
              <h2 class="ai-modal__title">AI Tools</h2>
            </div>
            <button class="ai-close-btn" aria-label="Close" @click="emit('close')">
              <CloseIcon />
            </button>
          </div>
          <AiToolsContent />
        </div>
      </div>
    </Transition>
  </Teleport>
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
  color: var(--color-text-secondary);
  transition: color 150ms ease, background-color 150ms ease;
  border-radius: theme('borderRadius.md');
  border: 2px solid transparent;

  &:hover {
    color: #a5b4fc;
    background-color: rgba(99, 102, 241, 0.2);
  }

  &:focus-visible {
    border-color: #6366f1;
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
}

// ── Push panel (lg+) ─────────────────────────────────────────────────────────

.ai-drawer {
  overflow: hidden;
  flex-shrink: 0;
  width: 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (min-width: 1024px) {
    &--open {
      width: 400px;
    }
  }

  &__panel {
    width: 400px;
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
    color: var(--color-title);
    margin: 0;
  }
}

// ── Modal (<lg) ──────────────────────────────────────────────────────────────

.ai-modal-wrap {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: theme('spacing.4');

  // Hidden on lg+ — panel takes over
  @media (min-width: 1024px) {
    display: none;
  }
}

.ai-modal {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: theme('borderRadius.lg');
  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - 2rem);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;

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
    color: var(--color-title);
    margin: 0;
  }
}

// ── Modal transition ─────────────────────────────────────────────────────────

.ai-modal-enter-active,
.ai-modal-leave-active {
  transition: opacity 0.2s ease;

  .ai-modal {
    transition: transform 0.2s ease;
  }
}

.ai-modal-enter-from,
.ai-modal-leave-to {
  opacity: 0;

  .ai-modal {
    transform: scale(0.95) translateY(8px);
  }
}
</style>
