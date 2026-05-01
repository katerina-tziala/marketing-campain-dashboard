import { ref } from 'vue'

export function useCooldown(ms: number) {
  const tick = ref(0)
  const timers: Set<ReturnType<typeof setTimeout>> = new Set()

  function schedule(): void {
    const timer = setTimeout(() => {
      timers.delete(timer)
      tick.value++
    }, ms)
    timers.add(timer)
  }

  function clearAll(): void {
    for (const timer of timers) clearTimeout(timer)
    timers.clear()
  }

  return { tick, schedule, clearAll }
}
