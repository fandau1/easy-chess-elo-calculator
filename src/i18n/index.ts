import { createI18n } from 'vue-i18n'

// Import překladů
import en from './locales/en.json'
import cs from './locales/cs.json'

// Typ zpráv pro TypeScript
export type MessageSchema = typeof en

// Podporované jazyky
export const SUPPORT_LOCALES = ['en', 'cs'] as const
export type SupportLocale = (typeof SUPPORT_LOCALES)[number]

// Klíč pro localStorage
const LOCALE_STORAGE_KEY = 'lang'

// Detekce jazyka prohlížeče
function getBrowserLocale(): SupportLocale {
  const navigatorLocale = navigator.language.split('-')[0]
  return SUPPORT_LOCALES.includes(navigatorLocale as SupportLocale)
    ? (navigatorLocale as SupportLocale)
    : 'en'
}

// Získání uloženého nebo detekovaného jazyka
function getInitialLocale(): SupportLocale {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (saved && SUPPORT_LOCALES.includes(saved as SupportLocale)) {
    return saved as SupportLocale
  }
  return getBrowserLocale()
}

// Konfigurace i18n
const i18n = createI18n({
  legacy: false, // použití Composition API
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    cs,
  },
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false,
})

// Pomocná funkce pro změnu jazyka
export function setLocale(locale: SupportLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  document.documentElement.lang = locale
}

// Nastavení počátečního jazyka v HTML
document.documentElement.lang = getInitialLocale()

export default i18n


