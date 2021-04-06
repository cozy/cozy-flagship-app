import React, {Component} from 'react'
import {WebView} from 'react-native-webview'
import connector from '../../../connectors/test/dist/webviewScript.js'
import Launcher from './libs/Launcher.js'

export default class LauncherView extends Component {
  constructor(props) {
    super(props)
    this.onMessage = this.onMessage.bind(this)
    this.webViewRef = null
    this.LauncherContext = props.launcherContext
  }
  async componentDidMount() {
    this.launcher = new Launcher()
    await this.launcher.init({
      webViewRef: this.webViewRef,
      contentScript: connector.source,
    })
    await this.launcher.start({context: this.launcherContext})
  }
  render() {
    return (
      <WebView
        ref={(ref) => (this.webViewRef = ref)}
        originWhitelist={['*']}
        useWebKit={true}
        javaScriptEnabled={true}
        source={{uri: connector.manifest.vendor_link}}
        sharedCookiesEnabled={true}
        onMessage={this.onMessage}
      />
    )
  }
  onMessage(event) {
    if (this.launcher) {
      this.launcher.onMessage(event)
    }
  }
}
