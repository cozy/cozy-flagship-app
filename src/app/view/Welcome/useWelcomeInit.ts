import { useEffect } from 'react'

import { changeLanguageToPhoneLocale } from '/locales/i18n'

export const useWelcomeInit = (): void => {
  useEffect(() => {
    void changeLanguageToPhoneLocale()
  }, [])
}
