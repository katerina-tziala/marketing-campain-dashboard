import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './app/App.vue'
import { registerCharts } from './ui/charts/register'
import { router } from './app/router'
import './styles/index.scss'

registerCharts()

createApp(App).use(createPinia()).use(router).mount('#app')
