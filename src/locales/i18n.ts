import _i18n, { Resource } from 'i18next'
import 'intl-pluralrules'
import { initReactI18next, useTranslation } from 'react-i18next'
import { getLocales } from 'react-native-localize'

import en from './en.json'
import es from './es.json'
import fr from './fr.json'

// Translation resources are loaded from the src/locales folder, and pulled in by the transifex-client
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

// This function returns the supported language code of the device, or the default language code ('en')
const getSupportedLanguageCode = (
  languageCode: string
): keyof typeof resources => {
  return Object.prototype.hasOwnProperty.call(resources, languageCode)
    ? languageCode
    : 'en'
}

const language = getSupportedLanguageCode(getLocales()[0].languageCode)

// Initialize i18next with resources and settings
_i18n
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

export type I18nInstance = typeof _i18n
export type TranslationFunction = (
  ...args: Parameters<I18nInstance['t']>
) => ReturnType<I18nInstance['t']>
export type UseTranslationResult = ReturnType<typeof useTranslation>
export type ChangeLanguageFunction = (
  ...args: Parameters<I18nInstance['changeLanguage']>
) => ReturnType<I18nInstance['changeLanguage']>

export const i18n = (): I18nInstance => _i18n
export const t: TranslationFunction = (...args) => _i18n.t(...args)
export const useI18n = (): UseTranslationResult => useTranslation()
export const changeLanguage: ChangeLanguageFunction = languageCode =>
  _i18n.changeLanguage(languageCode)
