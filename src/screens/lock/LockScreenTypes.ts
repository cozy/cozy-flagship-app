import { Route } from '@react-navigation/native'
import { TextInputProps, TouchableWithoutFeedbackProps } from 'react-native'

export interface LockScreenProps {
  route: CallbackRouteProp
}

export interface LockViewProps {
  input: string
  logout: () => void
  handleInput: TextInputProps['onChangeText']
  toggleMode: TouchableWithoutFeedbackProps['onPress']
  tryUnlock: TouchableWithoutFeedbackProps['onPress'] &
    TextInputProps['onSubmitEditing']
  fqdn: string
  mode: 'password' | 'PIN'
  uiError?: string
  togglePasswordVisibility: TouchableWithoutFeedbackProps['onPress']
  passwordVisibility: boolean
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
