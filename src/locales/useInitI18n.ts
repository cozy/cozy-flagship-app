import { useEffect } from 'react'

import CozyClient from 'cozy-client'

import { changeLanguage, getClientLang } from '/locales/i18n'

export const useInitI18n = (client?: CozyClient): void => {
  useEffect(() => {
    if (client) {
      const onLogin = (): void => void changeLanguage(getClientLang(client))

      if (client.isLogged) {
        void changeLanguage(getClientLang(client))
      } else {
        client.on('login', onLogin)

        return () => {
          client.removeListener('login', onLogin)
        }
      }
    }
  }, [client])
}
