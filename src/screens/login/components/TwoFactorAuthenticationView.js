import React, {useState} from 'react'
import {Button, View, Text, TextInput} from 'react-native'

export const TwoFactorAuthenticationView = ({
  setTwoFactorCode,
  cancelLogin,
}) => {
  const [twoFactorCode, onChangeTwoFactorCode] = useState('')

  const onValidateTwoFactorCode = () => {
    setTwoFactorCode(twoFactorCode)
  }

  return (
    <View>
      <Text>2FA</Text>
      <TextInput onChangeText={onChangeTwoFactorCode} />

      <View style={{marginTop: 20}}>
        <Button
          onPress={onValidateTwoFactorCode}
          title="Validate"
          accessibilityLabel="Validate"
        />
      </View>
      <View style={{marginTop: 20}}>
        <Button
          onPress={cancelLogin}
          title="Cancel OAuth"
          accessibilityLabel="Cancel OAuth"
        />
      </View>
    </View>
  )
}

export const TwoFactorAuthenticationWrongCodeView = ({retry, cancel}) => {
  return (
    <View>
      <Text>You entered the wrong code</Text>

      <View style={{marginTop: 20}}>
        <Button onPress={retry} title="Retry" accessibilityLabel="Retry" />
      </View>
      <View style={{marginTop: 20}}>
        <Button onPress={cancel} title="Cancel" accessibilityLabel="Cancel" />
      </View>
    </View>
  )
}
