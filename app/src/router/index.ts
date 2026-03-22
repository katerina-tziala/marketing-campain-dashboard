import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../features/dashboard/DashboardView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
  ],
})
