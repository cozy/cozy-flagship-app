import _i18n, { Resource } from 'i18next'
import intervalPlural from 'i18next-intervalplural-postprocessor'
import 'intl'
import 'intl-pluralrules'
import { initReactI18next, useTranslation } from 'react-i18next'
import { getLocales } from 'react-native-localize'

import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import en from './en.json'
import es from './es.json'
import fr from './fr.json'

const i18nLogger = Minilog('i18n')

intervalPlural.setOptions({
  // these are the defaults
  intervalSeparator: '||||',
  intervalRegex: /\((\S*)\).*?\[((.|\n)*)\]/, // pre 3.0 /\((\S*)\).*{((.|\n)*)}/,
  intervalSuffix: '_interval'
})

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

export const supportedLanguages = Object.keys(resources)
export const defaultLanguage = 'en'

// This function returns the supported language code of the device, or the default language code ('en')
const getSupportedLanguageCode = (
  languageCode: string
): keyof typeof resources => {
  return Object.prototype.hasOwnProperty.call(resources, languageCode)
    ? languageCode
    : defaultLanguage
}

const language = getSupportedLanguageCode(getLocales()[0].languageCode)

// Initialize i18next with resources and settings
_i18n
  .use(initReactI18next)
  .use(intervalPlural)
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

const getDeviceLanguage = (): string => getLocales()[0]?.languageCode

export const changeLanguage = async (languageCode: string): Promise<void> => {
  // If the language is supported, use it.
  if (supportedLanguages.includes(languageCode)) {
    await _i18n.changeLanguage(languageCode)
    return
  }

  // Otherwise, fallback to the device's language (if supported)
  const deviceLanguage = getDeviceLanguage()

  if (supportedLanguages.includes(deviceLanguage)) {
    await _i18n.changeLanguage(deviceLanguage)
    return
  }

  // If the device's language is also not supported, default to English
  await _i18n.changeLanguage(defaultLanguage)
}

export const changeLanguageToPhoneLocale = async (): Promise<void> => {
  try {
    await _i18n.changeLanguage(language)
  } catch (error) {
    i18nLogger.error('Error while changing language to phone language', error)
  }
}

export const getClientLang = (client: CozyClient): string =>
  client.getInstanceOptions().locale
