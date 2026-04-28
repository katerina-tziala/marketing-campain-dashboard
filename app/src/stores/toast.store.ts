import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NotificationVariant } from '@/ui/types/notification-variant'

interface Toast {
  id: number
  title: string
  message?: string
  type: NotificationVariant
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  function addToast(title: string, type: NotificationVariant = 'error', message?: string): void {
    const id = nextId++
    toasts.value.push({ id, title, message, type })
    setTimeout(() => removeToast(id), 5000)
  }

  function removeToast(id: number): void {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function showSuccessToast(title: string, message?: string): void {
    addToast(title, 'success', message)
  }

  function showErrorToast(title: string, message?: string): void {
    addToast(title, 'error', message)
  }

  function showWarningToast(title: string, message?: string): void {
    addToast(title, 'warning', message)
  }

  function showInfoToast(title: string, message?: string): void {
    addToast(title, 'info', message)
  }

  return {
    toasts,
    // actions
    addToast,
    removeToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast
  }
})
