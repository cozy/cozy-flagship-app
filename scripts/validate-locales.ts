import fs from 'fs'

type Locale = Record<string, string | Record<string, unknown>>

let errors: string[] = []

export const validateLocales = (
  referenceLocale: string,
  otherLocales: string[]
): void => {
  const referenceContent: Locale = JSON.parse(
    fs.readFileSync(`src/locales/${referenceLocale}/translation.json`, 'utf-8')
  ) as Locale

  otherLocales.forEach(locale => {
    const localeContent: Locale = JSON.parse(
      fs.readFileSync(`src/locales/${locale}/translation.json`, 'utf-8')
    ) as Locale

    checkKeys(referenceContent, localeContent, '', locale, referenceLocale)
  })

  if (errors.length > 0) {
    errors.forEach(error => {
      process.stdout.write(`::warning::${error}\n`)
    })
    errors = []
  }
}

const checkKeys = (
  reference: Locale,
  target: Locale,
  currentPath: string,
  locale: string,
  referenceLocale: string
): void => {
  Object.keys(reference).forEach(key => {
    const newKeyPath = currentPath ? `${currentPath}.${key}` : key

    if (!Object.prototype.hasOwnProperty.call(target, key)) {
      errors.push(
        `Error: ${locale}/translate.json is missing key ${newKeyPath} present in ${referenceLocale}/translate.json`
      )
    } else {
      if (
        typeof reference[key] === 'object' &&
        !Array.isArray(reference[key])
      ) {
        // If the value is an object, recurse.
        checkKeys(
          reference[key] as Locale,
          target[key] as Locale,
          newKeyPath,
          locale,
          referenceLocale
        )
      } else if (typeof target[key] === 'string' && target[key] === '') {
        errors.push(
          `Error: ${locale}/translate.json has an empty string for key: ${newKeyPath}`
        )
      }
    }
  })
}
