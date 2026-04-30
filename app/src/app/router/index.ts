import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '@/app/pages/DashboardPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardPage,
    },
  ],
})
