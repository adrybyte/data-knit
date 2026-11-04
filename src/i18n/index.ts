import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import es from './es.json'

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
] as const

export type Language = (typeof LANGUAGES)[number]['code']

const STORAGE_KEY = 'data-knit-lang'

function isLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'es'
}

function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en'

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isLanguage(stored)) return stored
  } catch {
    /* localStorage bloqueado */
  }

  return window.navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

function applyLanguage(language: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, language)
  } catch {
    /* localStorage bloqueado */
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = language
  }
}

const initialLanguage = detectLanguage()

i18n.on('languageChanged', applyLanguage)

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  supportedLngs: ['en', 'es'],
  initAsync: false,
  interpolation: {
    escapeValue: false,
  },
})

applyLanguage(initialLanguage)

export default i18n
