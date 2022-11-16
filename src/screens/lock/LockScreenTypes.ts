import { BiometryType } from 'react-native-biometrics'
import { Route } from '@react-navigation/native'
import { TextInputProps, TouchableWithoutFeedbackProps } from 'react-native'

export interface LockScreenProps {
  route: CallbackRouteProp
}

export interface LockViewProps {
  biometryEnabled: boolean
  biometryType: BiometryType | null
  fqdn: string
  handleBiometry: () => Promise<void>
  handleInput: TextInputProps['onChangeText']
  hasLogoutDialog: boolean
  input: string
  logout: () => void
  mode?: 'password' | 'PIN'
  passwordVisibility: boolean
  toggleLogoutDialog: () => void
  toggleMode: TouchableWithoutFeedbackProps['onPress']
  togglePasswordVisibility: TouchableWithoutFeedbackProps['onPress']
  tryUnlock: TouchableWithoutFeedbackProps['onPress'] &
    TextInputProps['onSubmitEditing']
  uiError?: string
}

export type CallbackRouteProp =
  | Route<
      string,
      Readonly<{
        key: string
        name: string
        path?: string | undefined
        params: Readonly<
          Readonly<{ key: string; name: string; path?: string | undefined }>
        >
      }>
    >
  | undefined

export type RouteProp = Route<
  string,
  Readonly<{ key: string; name: string; path?: string | undefined }>
>
