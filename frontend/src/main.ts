import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/index.css'
import './styles/theme.css'
import i18n from './i18n'

// 引入Vant组件库
import 'vant/lib/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// 在应用挂载后初始化设置
app.mount('#app')

// 初始化主题和语言设置
import { useSettingsStore } from './stores/recordStore'
import { setLanguage } from './i18n'
const settingsStore = useSettingsStore()
settingsStore.loadSettings()
// 设置语言
setLanguage(settingsStore.language)