import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { registerCharts } from './ui/charts/register'
import { router } from './router'
import './style.scss'

registerCharts()

createApp(App).use(createPinia()).use(router).mount('#app')
