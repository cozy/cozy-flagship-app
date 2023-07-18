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

// Type representing the i18n instance
export type I18nInstance = typeof _i18n
// Type representing the 't' function from the i18n instance
export type TranslationFunction = (
  ...args: Parameters<I18nInstance['t']>
) => ReturnType<I18nInstance['t']>
// Type representing the return type of the useTranslation hook
export type UseTranslationResult = ReturnType<typeof useTranslation>

/**
 * Facade for i18n instance.
 * This reduces coupling with i18n and allows for potential swapping of the i18n implementation.
 *
 * Example of mocking the i18n instance:
 * ```typescript
 * jest.mock('./yourI18nFile', () => ({
 *   ...jest.requireActual('./yourI18nFile'), // import actual implementations of other exports
 *   i18n: jest.fn().mockReturnValue({ // replace `i18n` with a mocked instance
 *     t: jest.fn().mockImplementation((key) => key),
 *     // any other methods used from the i18n instance would be mocked here
 *   }),
 * }));
 * ```
 */
export const i18n = (): I18nInstance => _i18n

/**
 * Facade for i18n.t function.
 * This reduces coupling with i18n and allows for potential swapping of the i18n implementation.
 * It also simplifies testing by allowing the 't' function to be easily mocked.
 *
 * Example of mocking the 't' function:
 * ```typescript
 * jest.mock('./yourI18nFile', () => ({
 *   ...jest.requireActual('./yourI18nFile'), // import actual implementations of other exports
 *   t: jest.fn().mockImplementation((key) => key), // replace `t` with a mocked function
 * }));
 * ```
 */
export const t: TranslationFunction = (...args) => _i18n.t(...args)

/** Facade for useTranslation hook.
 * This reduces coupling with i18n and allows for potential swapping of the i18n implementation.
 * It also simplifies testing by allowing the useTranslation hook to be easily mocked.
 *
 * Example of mocking the useTranslation hook:
 * ```typescript
 * jest.mock('./yourI18nFile', () => ({
 *    ...jest.requireActual('./yourI18nFile'), // import actual implementations of other exports
 *    useI18n: jest.fn().mockReturnValue({ t: jest.fn().mockImplementation((key) => key) }), // replace `useI18n` with a mocked function
 * }));
 * ```
 */
export const useI18n = (): UseTranslationResult => useTranslation()
