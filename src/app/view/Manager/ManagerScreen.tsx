import React from 'react'
import { WebView } from 'react-native-webview'

import { ManagerScreenProps } from '/app/view/Manager/ManagerScreenTypes'
import { useManagerScreenProps } from '/app/view/Manager/useManagerScreen'

export const ManagerScreen = (props: ManagerScreenProps): React.ReactNode => {
  const managerProps = useManagerScreenProps(props)

  return (
    managerProps.display && (
      <WebView
        source={{ uri: managerProps.managerUrl }}
        onShouldStartLoadWithRequest={managerProps.onShouldStartLoadWithRequest}
        onError={managerProps.handleError}
      />
    )
  )
}
