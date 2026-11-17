import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import de from './locales/de/translation.json'

export { useTranslation } from 'react-i18next'

const LANG_KEY = 'lang'

// Saved choice survives a reload; anything but 'de' falls back to English.
function storedLang(): string | null {
  try {
    return localStorage.getItem(LANG_KEY) === 'de' ? 'de' : null
  } catch {
    return null
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de }
  },
  lng: storedLang() ?? 'en',
  fallbackLng: 'en',
  interpolation: {
    // React handles XSS escaping; Trans needs this off to render tags
    escapeValue: false
  }
})

// The markup starts as English; a stored preference must correct <html lang>
// before the first paint, not only when the language changes again. The build
// renders this module in Node, where there is no document.
function setHtmlLang(lang: string) {
  if (typeof document !== 'undefined') document.documentElement.lang = lang
}

setHtmlLang(i18n.language.startsWith('de') ? 'de' : 'en')

i18n.on('languageChanged', (lang) => {
  setHtmlLang(lang)
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    // Preference is best-effort; storage may be unavailable.
  }
})

export default i18n
