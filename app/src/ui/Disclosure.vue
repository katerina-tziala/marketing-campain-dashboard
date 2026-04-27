<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const contentId = `disclosure-${Math.random().toString(36).slice(2, 9)}`

function toggle(): void {
  isOpen.value = !isOpen.value
}

function onEnter(el: Element, done: () => void): void {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = '0'
  htmlEl.style.overflow = 'hidden'
  htmlEl.offsetHeight // force reflow so browser registers starting height
  htmlEl.style.transition = 'height 300ms ease'
  htmlEl.style.height = `${htmlEl.scrollHeight}px`
  htmlEl.addEventListener('transitionend', () => {
    htmlEl.style.height = ''
    htmlEl.style.overflow = ''
    htmlEl.style.transition = ''
    done()
  }, { once: true })
}

function onLeave(el: Element, done: () => void): void {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = `${htmlEl.scrollHeight}px`
  htmlEl.style.overflow = 'hidden'
  htmlEl.offsetHeight // force reflow
  htmlEl.style.transition = 'height 300ms ease'
  htmlEl.style.height = '0'
  htmlEl.addEventListener('transitionend', () => {
    done()
  }, { once: true })
}
</script>

<template>
  <div class="flex flex-col">
    <slot name="trigger" :open="isOpen" :toggle="toggle" :content-id="contentId" />
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
      <div v-if="isOpen" :id="contentId">
        <slot />
      </div>
    </Transition>
  </div>
</template>