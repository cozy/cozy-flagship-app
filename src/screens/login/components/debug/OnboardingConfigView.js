import React, { useState } from 'react'
import { Button, View, Text, TextInput } from 'react-native'

export const OnboardingConfigView = ({
  setOnboardingData,
  cancelOnboarding
}) => {
  const [onboardingLink, onChangeOnboardingLink] = useState('')

  const submit = () => {
    const onboardingUrl = new URL(onboardingLink)

    const instance = onboardingUrl.origin
    const fqdn = onboardingUrl.host
    const registerToken = onboardingUrl.searchParams.get('registerToken')

    setOnboardingData({
      instance,
      fqdn,
      registerToken
    })
  }

  return (
    <>
      <Text>Onboarding Link</Text>
      <TextInput onChangeText={onChangeOnboardingLink} value={onboardingLink} />

      <View style={{ marginTop: 20 }}>
        <Button onPress={submit} title="Start OAuth" />
      </View>
      <View style={{ marginTop: 20 }}>
        <Button onPress={() => cancelOnboarding()} title="Cancel Onboarding" />
      </View>
    </>
  )
}
