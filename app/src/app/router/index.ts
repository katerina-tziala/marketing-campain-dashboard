import { createRouter, createWebHistory } from 'vue-router';

import DashboardPage from '@/app/pages/DashboardPage.vue';

import { applyPageMeta } from './page-meta';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardPage,
      meta: {
        page: {
          title: 'Marketing Intelligence Dashboard | Campaign Performance',
          description:
            'Marketing intelligence dashboard for performance analysis, budget optimization, and AI-powered insights including recommendations and executive summaries',
        },
      },
    },
  ],
});

router.afterEach((to) => {
  applyPageMeta(to);
});
