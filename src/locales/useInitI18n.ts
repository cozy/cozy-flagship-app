import { useEffect } from 'react'

import CozyClient from 'cozy-client'

import { changeLanguage, getClientLang, i18nLogger } from '/locales/i18n'

export const useInitI18n = (client?: CozyClient): void => {
  useEffect(() => {
    if (!client) return

    const applyClientLang = async (): Promise<void> => {
      try {
        await changeLanguage(getClientLang(client))
      } catch (error) {
        i18nLogger.error('Failed to apply client language:', error)
      }
    }

    if (client.isLogged) {
      void applyClientLang()
    } else {
      client.on('login', applyClientLang)
    }

    return () => {
      client.removeListener('login', applyClientLang)
    }
  }, [client])
}
