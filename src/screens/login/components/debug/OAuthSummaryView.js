import React from 'react'
import {Button, View, Text} from 'react-native'

export const OAuthSummaryView = ({
  loginData,
  startOAuth,
  cancelLogin,
  cancelOnboarding = undefined,
}) => {
  return (
    <View>
      <Text style={{maxHeight: 300}}>{JSON.stringify(loginData)}</Text>
      <Button onPress={() => startOAuth()} title="Start OAuth" />
      <View style={{marginTop: 20}}>
        <Button onPress={() => cancelLogin()} title="Cancel OAuth" />
      </View>
      {cancelOnboarding && (
        <View style={{marginTop: 20}}>
          <Button
            onPress={() => cancelOnboarding()}
            title="Cancel Onboarding"
          />
        </View>
      )}
    </View>
  )
}
