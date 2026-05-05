import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './app/App.vue';
import { router } from './app/router';
import { registerCharts } from './ui/charts/register';

import './styles/index.scss';

registerCharts();

createApp(App).use(createPinia()).use(router).mount('#app');
