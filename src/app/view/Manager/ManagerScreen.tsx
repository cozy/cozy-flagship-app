import React from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'

import { ManagerScreenProps } from '/app/view/Manager/ManagerScreenTypes'
import { useManagerScreenProps } from '/app/view/Manager/useManagerScreen'
import { getColors } from '/ui/colors'

const colors = getColors()

export const ManagerScreen = (props: ManagerScreenProps): React.ReactNode => {
  const managerProps = useManagerScreenProps(props)

  return (
    <View style={styles.view}>
      {managerProps.display && (
        <WebView
          source={{ uri: managerProps.managerUrl }}
          onShouldStartLoadWithRequest={
            managerProps.onShouldStartLoadWithRequest
          }
          onError={managerProps.handleError}
          onHttpError={managerProps.handleHttpError}
          style={{
            backgroundColor: colors.onboardingBackgroundColor
          }}
        />
      )}
      <View
        style={[
          styles.loadingOverlay,
          {
            backgroundColor: colors.onboardingBackgroundColor
          }
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
})
