import React, {Component} from 'react'
import {WebView} from 'react-native-webview'
import {StyleSheet, View, Text, TouchableOpacity, Image} from 'react-native'
// TODO find a proper way to load a connector only when needed
// import amazonConnector from '../../../connectors/amazon/dist/webviewScript'
import templateConnector from '../../../connectors/template/dist/webviewScript'
import googleConnector from '../../../connectors/google-takeout/dist/webviewScript'
// import sncfConnector from '../../../connectors/sncf/dist/webviewScript'
import blablacarConnector from '../../../connectors/blablacar/dist/webviewScript'
import edfConnector from '../../../connectors/edf/dist/webviewScript'
import ReactNativeLauncher from '../../libs/ReactNativeLauncher'
import debounce from 'lodash/debounce'
import {withClient} from 'cozy-client'
import {get} from 'lodash'
import Minilog from '@cozy/minilog'

const log = Minilog('LauncherView')

const DEBUG = false

const embeddedConnectors = {
  edf: edfConnector,
  'google-takeout': googleConnector,
  // amazon: amazonConnector,
  template: templateConnector,
  // sncf: sncfConnector,
  blablacar: blablacarConnector,
}
class LauncherView extends Component {
  constructor(props) {
    super(props)
    this.onPilotMessage = this.onPilotMessage.bind(this)
    this.onWorkerMessage = this.onWorkerMessage.bind(this)
    this.onStopExecution = this.onStopExecution.bind(this)
    this.onWorkerWillReload = debounce(this.onWorkerWillReload.bind(this), 1000)
    this.pilotWebView = null
    this.workerWebview = null
    this.state = {
      userAgent: undefined,
      connector: null,
      worker: {},
      workerReady: false,
    }
  }

  onStopExecution() {
    this.launcher.stop({message: 'stopped by user'})
    this.props.setLauncherContext({state: 'default'})
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

    this.launcher.on('SET_WORKER_STATE', options => {
      this.setState({worker: options})
    })

    this.launcher.on('SET_USER_AGENT', userAgent => {
      this.setState({userAgent})
    })
    this.launcher.on('WORKER_READY', () => {
      this.setState({workerReady: true})
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
    const workerStyle =
      this.state.worker.visible || DEBUG
        ? styles.workerVisible
        : styles.workerHidden

    return (
      <>
        {this.state.connector ? (
          <>
            <View>
              <WebView
                ref={ref => (this.pilotWebView = ref)}
                originWhitelist={['*']}
                source={{
                  uri: get(this, 'state.connector.manifest.vendor_link'),
                }}
                useWebKit={true}
                javaScriptEnabled={true}
                userAgent={this.state.userAgent}
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
              <View style={styles.headerStyle}>
                <TouchableOpacity
                  style={styles.ImageIconStyle}
                  activeOpacity={0.5}
                  onPress={this.onStopExecution}>
                  <Image
                    source={require('../../assets/cross.png')}
                    resizeMode="center"
                    style={styles.cross}
                  />
                </TouchableOpacity>
              </View>
              <WebView
                ref={ref => (this.workerWebview = ref)}
                originWhitelist={['*']}
                useWebKit={true}
                javaScriptEnabled={true}
                userAgent={this.state.userAgent}
                source={{
                  uri: this.state.worker.url,
                }}
                sharedCookiesEnabled={true}
                onMessage={this.onWorkerMessage}
                onError={this.onWorkerError}
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
    log.error('worker error event', event)
  }
  /**
   * When an error is detected in the pilot webview
   *
   * @param {Object} event
   */
  onPilotError(event) {
    log.error('error event', event)
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
    if (event.nativeEvent && event.nativeEvent.data) {
      const msg = JSON.parse(event.nativeEvent.data)
      if (msg.message === 'NEW_WORKER_INITIALIZING') {
        if (this.state.workerReady) {
          this.onWorkerWillReload(event)
        }
        return
      }
    }
    if (this.launcher) {
      this.launcher.onWorkerMessage(event)
    }
  }
  /**
   * Detection of a page reload in the worker webview
   *
   * @param {Object} [event={}]
   */
  onWorkerWillReload(event = {}) {
    try {
      if (this.launcher && this.workerWebview) {
        this.setState({workerReady: false})
        return this.launcher.onWorkerWillReload(event)
      }
    } catch (e) {
      log.error('Caught error in onWorkerWillReload', e.message)
      throw e
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
  cross: {
    width: 16,
    height: 16,
    position: 'absolute',
    top: 50,
    right: 20,
  },
  headerStyle: {
    height: 80,
  },
})

export default withClient(LauncherView)
