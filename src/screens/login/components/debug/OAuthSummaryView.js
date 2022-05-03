import React from 'react'
import { Button, View, Text } from 'react-native'
import { styles } from './OAuthSummaryView.styles'

export const OAuthSummaryView = ({
  loginData,
  startOAuth,
  cancelLogin,
  cancelOnboarding = undefined
}) => {
  return (
    <View>
      <Text style={styles.loginDataText}>{JSON.stringify(loginData)}</Text>
      <Button onPress={() => startOAuth()} title="Start OAuth" />
      <View style={styles.viewButton}>
        <Button onPress={() => cancelLogin()} title="Cancel OAuth" />
      </View>
      {cancelOnboarding && (
        <View style={styles.viewButton}>
          <Button
            onPress={() => cancelOnboarding()}
            title="Cancel Onboarding"
          />
        </View>
      )}
    </View>
  )
}
