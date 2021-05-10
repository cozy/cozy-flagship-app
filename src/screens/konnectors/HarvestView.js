import React from 'react'
import {domain, name} from '../../../config.json'
import {get} from 'lodash'
import {WebView} from 'react-native-webview'

const HarvestView = (props) => {
  const run = `
    window.cozy = {
      ClientConnectorLauncher: 'react-native',
      clientSideSlugs: ['ameli', 'sncf', 'blablacar', 'template']
    };
    console.log('injected', window.cozy)
    return true
    `
  let uri = `https://${name}-home.${domain}`
  if (props.slug && props.accountId) {
    uri = `https://${name}-home.${domain}/#connected/${props.slug}/accounts/${props.accountId}`
  }
  const {setLauncherContext} = props
  return (
    <WebView
      originWhitelist={['*']}
      useWebKit={true}
      javaScriptEnabled={true}
      source={{uri}}
      injectedJavaScriptBeforeContentLoaded={run}
      onMessage={(m) => {
        const data = get(m, 'nativeEvent.data')
        if (data) {
          const {message, value} = JSON.parse(data)
          if (message === 'startLauncher') {
            setLauncherContext({state: 'launch', value})
          }
        }
      }}
    />
  )
}

export default HarvestView
