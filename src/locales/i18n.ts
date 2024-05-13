import _i18n, { Resource } from 'i18next'
import intervalPlural from 'i18next-intervalplural-postprocessor'
import 'intl'
import 'intl/locale-data/jsonp/en.js'
import 'intl/locale-data/jsonp/es.js'
import 'intl/locale-data/jsonp/fr.js'
import 'intl-pluralrules'
import { initReactI18next, useTranslation } from 'react-i18next'
import { getLocales } from 'react-native-localize'

import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import strings from '/constants/strings.json'
import en from '/locales/en.json'
import es from '/locales/es.json'
import fr from '/locales/fr.json'

// Configuration
intervalPlural.setOptions({
  // these are the defaults
  intervalSeparator: '||||',
  intervalRegex: /\((\S*)\).*?\[((.|\n)*)\]/, // pre 3.0 /\((\S*)\).*{((.|\n)*)}/,
  intervalSuffix: '_interval'
})

// Translation resources are loaded from the src/locales folder, and pulled in by the transifex-client
const resources: Record<string, Resource> = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es }
}

const defaultLocale = strings.DEFAULT_LOCALE

const getDeviceLanguage = (): string => getLocales()[0]?.languageCode

const deviceLanguage = getDeviceLanguage()

// Gets the supported language code of the device (en, fr or es), or the default language code if the device language is not supported
const language = Object.prototype.hasOwnProperty.call(resources, deviceLanguage)
  ? deviceLanguage
  : defaultLocale

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
    i18nLogger.error('Error during i18n module init', error)
  })

// Types
export type I18nInstance = typeof _i18n

export type TranslationFunction = (
  ...args: Parameters<I18nInstance['t']>
) => ReturnType<I18nInstance['t']>

export type UseTranslationResult = ReturnType<typeof useTranslation>

export type ChangeLanguageFunction = (
  ...args: Parameters<I18nInstance['changeLanguage']>
) => ReturnType<I18nInstance['changeLanguage']>

// API
export const supportedLanguages = Object.keys(resources)

export const defaultLanguage = defaultLocale

export const i18nLogger = Minilog('i18n')

export const i18n = (): I18nInstance => _i18n

export const t: TranslationFunction = (...args) => _i18n.t(...args)

export const useI18n = (): UseTranslationResult => useTranslation()

export const changeLanguage = async (languageCode: string): Promise<void> => {
  // If the language is supported, use it.
  if (supportedLanguages.includes(languageCode)) {
    await _i18n.changeLanguage(languageCode)
    return
  }

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
