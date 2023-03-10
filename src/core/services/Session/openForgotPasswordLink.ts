import { Linking } from 'react-native'

export const openForgotPasswordLink = async (
  instance: string
): Promise<void> => {
  const url = new URL(instance)

  url.pathname = '/auth/passphrase_reset'
  url.searchParams.set('hideBackButton', 'true')

  await Linking.openURL(url.toString())
}
