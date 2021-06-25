import React, {Component} from 'react'
import {WebView} from 'react-native-webview'
import {StyleSheet, View} from 'react-native'
// TODO find a proper way to load a connector only when needed
import templateConnector from '../../../connectors/template/dist/webviewScript'
import sncfConnector from '../../../connectors/sncf/dist/webviewScript'
import blablacarConnector from '../../../connectors/blablacar/dist/webviewScript'
import ReactNativeLauncher from '../../libs/ReactNativeLauncher'
import CookieManager from '@react-native-cookies/cookies'
import debounce from 'lodash/debounce'
import {withClient} from 'cozy-client'

const connectors = {
  template: templateConnector,
  sncf: sncfConnector,
  blablacar: blablacarConnector,
}
class LauncherView extends Component {
  constructor(props) {
    super(props)
    this.onPilotMessage = this.onPilotMessage.bind(this)
    this.onWorkerMessage = this.onWorkerMessage.bind(this)
    this.onWorkerWillReload = debounce(this.onWorkerWillReload, 1000).bind(this)
    this.pilotWebView = null
    this.workerWebview = null
    this.connector = connectors[props.launcherContext.job.message.konnector]
    if (!this.connector) {
      throw new Error(
        `No client connector available for slug ${this.connector.manifest.slug}`,
      )
    }
    this.state = {
      worker: {},
    }
    // this.resetSession()
  }

  resetSession() {
    CookieManager.flush()
  }

  async componentDidMount() {
    this.launcher = new ReactNativeLauncher({
      context: this.props.launcherContext,
      manifest: this.connector.manifest,
      client: this.props.client,
    })
    this.launcher.on('SET_WORKER_STATE', (options) => {
      if (this.state.worker.url !== options.url) {
        this.onWorkerWillReload(options)
      }
      this.setState({worker: options})
    })
    await this.launcher.init({
      bridgeOptions: {
        pilotWebView: this.pilotWebView,
        workerWebview: this.workerWebview,
      },
      contentScript: this.connector.source,
    })
    await this.launcher.start()
    this.props.setLauncherContext({state: 'default'})
  }

  componentWillUnmount() {
    if (this.launcher.removeAllListener) {
      this.launcher.removeAllListener()
    }
  }
  render() {
    return (
      <>
        <View>
          <WebView
            ref={(ref) => (this.pilotWebView = ref)}
            originWhitelist={['*']}
            source={{
              uri: this.connector.manifest.vendor_link,
            }}
            useWebKit={true}
            javaScriptEnabled={true}
            sharedCookiesEnabled={true}
            onMessage={this.onPilotMessage}
            onError={this.onPilotError}
            injectedJavaScriptBeforeContentLoaded={this.connector.source}
          />
        </View>
        <View
          style={
            this.state.worker.visible
              ? styles.workerVisible
              : styles.workerHidden
          }>
          <WebView
            style={
              this.state.worker.visible
                ? styles.workerVisible
                : styles.workerHidden
            }
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
            onShouldStartLoadWithRequest={this.onWorkerWillReload}
            injectedJavaScriptBeforeContentLoaded={this.connector.source}
          />
        </View>
      </>
    )
  }

  /**
   * When an error is detected in the worker webview
   *
   * @param {Object} event
   */
  onWorkerError(event) {
    console.error('worker error event', event)
  }
  /**
   * When an error is detected in the pilot webview
   *
   * @param {Object} event
   */
  onPilotError(event) {
    console.error('error event', event)
  }
  /**
   * Postmessage relay from the pilot to  the launcher
   *
   * @param {Object} event
   */
  onPilotMessage(event) {
    if (this.launcher) {
      this.launcher.onPilotMessage(event)
    }
  }
  /**
   * Postmessage relay from the worker to  the launcher
   *
   * @param {Object} event
   */
  onWorkerMessage(event) {
    if (this.launcher) {
      this.launcher.onWorkerMessage(event)
    }
  }
  /**
   * Detection of a page reload in the worker webview
   *
   * @param {Object} event
   */
  onWorkerWillReload(event) {
    if (this.launcher && this.workerWebview) {
      return this.launcher.onWorkerWillReload(event)
    } else {
      return true
    }
  }
}

const styles = StyleSheet.create({
  workerVisible: {
    display: 'flex',
    flex: 1,
  },
  workerHidden: {
    position: 'absolute',
    left: -2000,
    top: -2000,
    height: 0,
    width: 0,
    flex: 0,
  },
})

export default withClient(LauncherView)
