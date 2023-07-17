import i18n, { Resource } from 'i18next'
import 'intl-pluralrules'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'react-native-localize'

import en from './en.json'
import es from './es.json'
import fr from './fr.json'

const resources: Record<string, Resource> = {
  en: {
    translation: en
  },
  fr: {
    translation: fr
  },
  es: {
    translation: es
  }
}

const getSupportedLanguageCode = (
  languageCode: string
): keyof typeof resources => {
  return Object.prototype.hasOwnProperty.call(resources, languageCode)
    ? languageCode
    : 'en'
}

const language = getSupportedLanguageCode(getLocales()[0].languageCode)

i18n
  .use(initReactI18next)
  .init({
    resources: resources,
    lng: language,
    keySeparator: '.',
    interpolation: {
      escapeValue: false
    }
  })
  .catch(error => {
    // eslint-disable-next-line no-console
    console.log(error)
  })

export const geti18n = (): typeof i18n => i18n
export const getT = (): typeof i18n.t => i18n.t
