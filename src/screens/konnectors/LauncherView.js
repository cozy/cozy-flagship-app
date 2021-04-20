import React, {Component} from 'react'
import {WebView} from 'react-native-webview'
import connector from '../../../connectors/test/dist/webviewScript.js'
import ReactNativeLauncher from './libs/ReactNativeLauncher.js'

export default class LauncherView extends Component {
  constructor(props) {
    super(props)
    this.onPilotMessage = this.onPilotMessage.bind(this)
    this.onWorkerMessage = this.onWorkerMessage.bind(this)
    this.pilotWebView = null
    this.workerWebview = null
    this.launcherContext = props.launcherContext
    this.state = {
      worker: {},
    }
    this.launcher = new ReactNativeLauncher()
    this.launcher.on('SET_WORKER_STATE', (options) => {
      this.setState({worker: options})
    })
  }
  async componentDidMount() {
    await this.launcher.init({
      bridgeOptions: {
        pilotWebView: this.pilotWebView,
        // workerWebview: this.workerWebview,
      },
      contentScript: connector.source,
    })
    await this.launcher.start({context: this.launcherContext})
  }

  componentWillUnmount() {
    if (this.launcher.removeAllListener) {
      this.launcher.removeAllListener()
    }
  }
  render() {
    return (
      <>
        <WebView
          ref={(ref) => (this.pilotWebView = ref)}
          originWhitelist={['*']}
          source={{
            uri: connector.manifest.vendor_link,
          }}
          useWebKit={true}
          javaScriptEnabled={true}
          sharedCookiesEnabled={true}
          onMessage={this.onPilotMessage}
          onError={this.onError}
          injectedJavaScriptBeforeContentLoaded={connector.source}
        />
        {this.state.worker.visible ? (
          <WebView
            ref={(ref) => (this.workerWebview = ref)}
            originWhitelist={['*']}
            useWebKit={true}
            javaScriptEnabled={true}
            source={{
              uri: this.state.worker.url,
            }}
            sharedCookiesEnabled={true}
            onMessage={this.onWorkerMessage}
            onError={this.onWorkerError}
            injectedJavaScriptBeforeContentLoaded={connector.source}
          />
        ) : null}
      </>
    )
  }
  onWorkerError(event) {
    console.error('worker error event', event)
  }
  onError(event) {
    console.error('error event', event)
  }
  onPilotMessage(event) {
    if (this.launcher) {
      this.launcher.onPilotMessage(event)
    }
  }
  onWorkerMessage(event) {
    if (this.launcher) {
      this.launcher.onWorkerMessage(event)
    }
  }
}
