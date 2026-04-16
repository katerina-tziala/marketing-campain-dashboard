<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
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
      <AiToolsContent @close="emit('close')"/>
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
        <AiToolsContent @close="emit('close')"/>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
 
// ── Push drawer (lg+) ───────────────────────────────────────────────────────
.ai-drawer {
  @apply hidden;

  @media (min-width: 1024px) {
    @apply block
      overflow-hidden
      shrink-0
      w-0
      ease-in-out
      duration-300;

    transition-property: width;

    &--open { 
      @apply w-[30rem];
    }
  }

  &__panel {
    @apply
      grid
      grid-cols-1
      grid-rows-[min-content_1fr]
      h-screen
      bg-surface
      border
      border-surface-border
      overflow-hidden
      sticky
      top-0
      w-full;
  }
}

// ── Overlay (<lg) ───────────────────────────────────────────────────────────
.ai-overlay {
    @apply fixed
    flex
    items-center
    justify-center 
    box-border
    overflow-hidden
    z-1000
    inset-0
    bg-black/[0.7]
    py-[5vh]
    px-[5vw]; 

  // Hidden on lg+ — drawer takes over
  @media (min-width: 1024px) {
    @apply hidden;
  }

  &__panel {
    @apply
      grid
      grid-cols-1
      grid-rows-[min-content_1fr]
      w-full
      bg-surface
      border
      border-surface-border
      overflow-hidden
      rounded-md
      min-h-[50vh]
      max-h-[92vh]
      max-w-[92vh]
      shadow-md;
  }
}
</style>
