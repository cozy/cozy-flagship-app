import React, {Component} from 'react'
import {WebView} from 'react-native-webview'
import connector from '../../../connectors/test/dist/webviewScript.js'
import ReactNativeLauncher from './libs/ReactNativeLauncher.js'

export default class LauncherView extends Component {
  constructor(props) {
    super(props)
    this.onMessage = this.onMessage.bind(this)
    this.webViewRef = null
    this.launcherContext = props.launcherContext
  }
  async componentDidMount() {
    this.launcher = new ReactNativeLauncher()
    await this.launcher.init({
      bridgeOptions: {
        webViewRef: this.webViewRef,
      },
      contentScript: connector.source,
    })
    await this.launcher.start({context: this.launcherContext})
  }
  render() {
    return (
      <WebView
        ref={(ref) => (this.webViewRef = ref)}
        originWhitelist={['*']}
        source={{uri: connector.manifest.vendor_link}}
        sharedCookiesEnabled={true}
        onMessage={this.onMessage}
        onError={this.onError}
      />
    )
  }
  onError(event) {
    console.error('error event', event)
  }
  onMessage(event) {
    if (this.launcher) {
      this.launcher.onMessage(event)
    }
  }
}
