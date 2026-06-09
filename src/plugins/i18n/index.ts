import { createI18n } from 'vue-i18n'
import type { App } from 'vue'
import id from '@/locales/id'
import en from '@/locales/en'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: (typeof document !== 'undefined'
    ? document.cookie.match(/(?:^|; )locale=([^;]*)/)?.[1]
    : null) || 'id',
  fallbackLocale: 'id',
  messages: { id, en },
})

export default function (app: App) {
  app.use(i18n)
}
