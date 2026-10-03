import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import de from './locales/de/translation.json'

export { useTranslation } from 'react-i18next'

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      // React handles XSS escaping; Trans needs this off to render tags
      escapeValue: false
    }
  })

export default i18n
