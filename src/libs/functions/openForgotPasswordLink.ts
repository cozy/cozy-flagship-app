import { Linking } from 'react-native'

export const openForgotPasswordLink = async (
  instance: string
): Promise<void> => {
  const url = new URL(instance)

  url.pathname = '/auth/passphrase_reset'

  await Linking.openURL(url.toString())
}
