import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import './ui/charts/register'
import { router } from './router'
import './style.scss'

createApp(App).use(createPinia()).use(router).mount('#app')
