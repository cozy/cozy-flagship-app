import React, {Component} from 'react'
import {WebView} from 'react-native-webview'
import {StyleSheet, View, Text} from 'react-native'
// TODO find a proper way to load a connector only when needed
// import templateConnector from '../../../connectors/template/dist/webviewScript'
import sncfConnector from '../../../connectors/sncf/dist/webviewScript'
import blablacarConnector from '../../../connectors/blablacar/dist/webviewScript'
import ReactNativeLauncher from '../../libs/ReactNativeLauncher'
import CookieManager from '@react-native-cookies/cookies'
import debounce from 'lodash/debounce'
import {withClient} from 'cozy-client'
import {get} from 'lodash'

const embeddedConnectors = {
  // template: templateConnector,
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
    this.state = {
      connector: null,
      worker: {},
    }
    // this.resetSession()
  }

  resetSession() {
    CookieManager.flush()
  }

  async initConnector() {
    const {client, launcherContext} = this.props
    let result = null
    let connector = embeddedConnectors[launcherContext.job.message.konnector]
    if (!connector) {
      try {
        connector = await this.launcher.ensureConnectorIsInstalled({
          ...launcherContext,
          client,
        })
      } catch (err) {
        result = err
      }
    }
    this.setState({connector})
    return result
  }

  async componentDidUpdate() {
    this.launcher.setStartContext({
      ...this.props.launcherContext,
      client: this.props.client,
      manifest: get(this, 'state.connector.manifest'),
    })
  }

  async componentDidMount() {
    this.launcher = new ReactNativeLauncher()
    this.launcher.setStartContext({
      ...this.props.launcherContext,
      client: this.props.client,
      manifest: get(this, 'state.connector.manifest'),
    })
    const initConnectorError = await this.initConnector()

    this.launcher.on('SET_WORKER_STATE', (options) => {
      if (this.state.worker.url !== options.url) {
        this.onWorkerWillReload(options)
      }
      this.setState({worker: options})
    })

    if (this.state.connector) {
      await this.launcher.init({
        bridgeOptions: {
          pilotWebView: this.pilotWebView,
          workerWebview: this.workerWebview,
        },
        contentScript: get(this, 'state.connector.content'),
      })
    }
    await this.launcher.start({initConnectorError})
    this.props.setLauncherContext({state: 'default'})
  }

  componentWillUnmount() {
    if (this.launcher.removeAllListener) {
      this.launcher.removeAllListener()
    }
    this.launcher.close()
  }

  render() {
    const workerStyle = this.state.worker.visible
      ? styles.workerVisible
      : styles.workerHidden
    return (
      <>
        {this.state.connector ? (
          <>
            <View>
              <WebView
                ref={(ref) => (this.pilotWebView = ref)}
                originWhitelist={['*']}
                source={{
                  uri: get(this, 'state.connector.manifest.vendor_link'),
                }}
                useWebKit={true}
                javaScriptEnabled={true}
                sharedCookiesEnabled={true}
                onMessage={this.onPilotMessage}
                onError={this.onPilotError}
                injectedJavaScriptBeforeContentLoaded={get(
                  this,
                  'state.connector.content',
                )}
              />
            </View>
            <View style={workerStyle}>
              <WebView
                style={workerStyle}
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
                injectedJavaScriptBeforeContentLoaded={get(
                  this,
                  'state.connector.content',
                )}
              />
            </View>
          </>
        ) : (
          <View>
            <Text>Loading...</Text>
          </View>
        )}
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
    height: '100%',
    width: '100%',
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
