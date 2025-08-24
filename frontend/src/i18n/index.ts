import { createI18n } from 'vue-i18n'
import zhCN from '../locales/zh-CN'
import enUS from '../locales/en-US'

// 获取浏览器语言
function getBrowserLanguage(): string {
  const language = navigator.language || 'zh-CN'
  if (language.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en-US'
}

// 从本地存储获取语言设置
function getStoredLanguage(): string {
  try {
    const settings = localStorage.getItem('accounting-settings')
    if (settings) {
      const parsed = JSON.parse(settings)
      return parsed.language || getBrowserLanguage()
    }
  } catch (error) {
    console.warn('Failed to parse stored language settings:', error)
  }
  return getBrowserLanguage()
}

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const i18n = createI18n({
  legacy: false,
  locale: getStoredLanguage(),
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true
})

// 导出切换语言的方法
export function setLanguage(locale: string) {
  if (messages[locale as keyof typeof messages]) {
    i18n.global.locale.value = locale as any
  }
}

export default i18n