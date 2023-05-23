import { RouteProp } from '@react-navigation/native'
import { TextInputProps, TouchableWithoutFeedbackProps } from 'react-native'
import { BiometryType } from 'react-native-biometrics'

type RootStackParamList = Record<string, undefined | { onSuccess: () => void }>

export interface LockScreenProps {
  route: RouteProp<RootStackParamList, 'lock'>
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
