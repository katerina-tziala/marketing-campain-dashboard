import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NotificationVariant } from '../ui/types/notification-variant'

interface Toast {
  id: number
  message: string
  type: NotificationVariant
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  function addToast(message: string, type: NotificationVariant = 'error'): void {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), 4000)
  }

  function removeToast(id: number): void {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function showSuccessToast(message: string): void {
    addToast(message, 'success')
  }

  function showErrorToast(message: string): void {
    addToast(message, 'error')
  }

  function showWarningToast(message: string): void {
    addToast(message, 'warning')
  }

  function showInfoToast(message: string): void {
    addToast(message, 'info')
  }

  return { toasts, addToast, removeToast, showSuccessToast, showErrorToast, showWarningToast, showInfoToast }
})
