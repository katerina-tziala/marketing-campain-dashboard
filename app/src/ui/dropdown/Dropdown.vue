<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const DROPDOWN_GAP = 6
const DROPDOWN_MIN_WIDTH = 260
const DROPDOWN_MAX_HEIGHT = 300
const DROPDOWN_EDGE_MARGIN = 8

const props = defineProps<{
  open: boolean
  anchor: HTMLElement | null | undefined
  minWidth?: number
  maxHeight?: number
  gap?: number
  edgeMargin?: number
  align?: 'left' | 'right'
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const panelRef = ref<HTMLElement>()

const close = () => emit('update:open', false)

const dropdownStyle = computed(() => {
  if (!props.anchor) return {}
  const rect = props.anchor.getBoundingClientRect()

  const gap = props.gap ?? DROPDOWN_GAP
  const minWidth = props.minWidth ?? DROPDOWN_MIN_WIDTH
  const maxHeight = props.maxHeight ?? DROPDOWN_MAX_HEIGHT
  const edgeMargin = props.edgeMargin ?? DROPDOWN_EDGE_MARGIN

  const fitsBelow = rect.bottom + gap + maxHeight <= window.innerHeight
  const vertical = fitsBelow
    ? { top: `${rect.bottom + gap}px` }
    : { bottom: `${window.innerHeight - rect.top + gap}px` }

  const horizontal = props.align === 'right'
    ? { right: `${window.innerWidth - rect.right}px` }
    : { left: `${Math.min(rect.left, window.innerWidth - minWidth - edgeMargin)}px` }

  return { ...vertical, ...horizontal }
})

function focusFirstInPanel(): void {
  const focusable = panelRef.value?.querySelector<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  focusable?.focus()
}

watch(() => props.open, open => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    nextTick(focusFirstInPanel)
  } else {
    props.anchor?.focus()
  }
})

function onWindowResize(): void {
  if (props.open) close()
}

onMounted(() => {
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('resize', onWindowResize)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[49]" aria-hidden="true" @click="close" />
  </Teleport>

  <Teleport to="body">
    <div
      v-if="open"
      ref="panelRef"
      class="fixed z-50"
      :style="dropdownStyle"
      @keydown.escape="close"
    >
      <slot />
    </div>
  </Teleport>
</template>
