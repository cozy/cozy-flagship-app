import Minilog from '@cozy/minilog'
import { withClient } from 'cozy-client'
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import React, { Component } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { WebView } from 'react-native-webview'

import { BackTo } from '/components/ui/icons/BackTo'
import { getDimensions } from '/libs/dimensions'
import ReactNativeLauncher from '/libs/ReactNativeLauncher'
import { getColors } from '/ui/colors'
import strings from '/constants/strings.json'

const log = Minilog('LauncherView')

const colors = getColors()
const { statusBarHeight } = getDimensions()

const DEBUG = false

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
      workerReady: false
    }
  }

  onStopExecution() {
    this.launcher.stop({ message: 'stopped by user' })
    this.props.setLauncherContext({ state: 'default' })
  }

  async initConnector() {
    const { client, launcherContext } = this.props
    const slug = launcherContext.job.message.konnector

    try {
      this.setState({
        connector: await this.launcher.ensureConnectorIsInstalled({
          slug,
          client
        })
      })
    } catch (err) {
      log.error({ err })
      return 'UNKNOWN_ERROR'
    }
  }

  async componentDidUpdate() {
    this.launcher.setStartContext({
      ...this.props.launcherContext,
      client: this.props.client,
      launcherClient: this.props.launcherClient,
      manifest: get(this, 'state.connector.manifest')
    })
  }

  async componentDidMount() {
    this.launcher = new ReactNativeLauncher()
    this.launcher.setStartContext({
      ...this.props.launcherContext,
      client: this.props.client,
      launcherClient: this.props.launcherClient,
      manifest: get(this, 'state.connector.manifest')
    })
    const initConnectorError = await this.initConnector()

    this.launcher.on('SET_WORKER_STATE', options => {
      this.setState({ worker: { ...this.state.worker, ...options } })
    })

    this.launcher.on('SET_USER_AGENT', userAgent => {
      this.setState({ userAgent })
    })
    this.launcher.on('WORKER_READY', () => {
      this.setState({ workerReady: true })
    })

    if (this.state.connector) {
      await this.launcher.init({
        bridgeOptions: {
          pilotWebView: this.pilotWebView,
          workerWebview: this.workerWebview
        },
        contentScript: get(this, 'state.connector.content')
      })
    }
    await this.launcher.start({ initConnectorError })
    this.props.setLauncherContext({ state: 'default' })
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
                mediaPlaybackRequiresUserAction={true}
                ref={ref => (this.pilotWebView = ref)}
                originWhitelist={['*']}
                source={{
                  uri: get(this, 'state.connector.manifest.vendor_link')
                }}
                useWebKit={true}
                javaScriptEnabled={true}
                userAgent={this.state.userAgent}
                sharedCookiesEnabled={true}
                onMessage={this.onPilotMessage}
                onError={this.onPilotError}
                injectedJavaScriptBeforeContentLoaded={get(
                  this,
                  'state.connector.content'
                )}
              />
            </View>
            <View style={workerStyle}>
              <View style={styles.headerStyle}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={this.onStopExecution}
                  style={styles.headerTouchableStyle}
                >
                  <BackTo color={colors.primaryColor} width={16} height={16} />
                  <Text style={styles.headerTextStyle}>
                    {strings.connectors.worker.backButton}
                  </Text>
                </TouchableOpacity>
              </View>
              <WebView
                mediaPlaybackRequiresUserAction={true}
                ref={ref => (this.workerWebview = ref)}
                originWhitelist={['*']}
                useWebKit={true}
                javaScriptEnabled={true}
                userAgent={this.state.userAgent}
                source={{
                  uri: this.state.worker.url
                }}
                sharedCookiesEnabled={true}
                onMessage={this.onWorkerMessage}
                onError={this.onWorkerError}
                injectedJavaScriptBeforeContentLoaded={get(
                  this,
                  'state.connector.content'
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
  onWorkerError({ nativeEvent }) {
    log.error('onWorkerError', { nativeEvent })
    this.stop({ message: 'VENDOR_DOWN' })
  }
  /**
   * When an error is detected in the pilot webview
   *
   * @param {Object} event
   */
  onPilotError({ nativeEvent }) {
    log.error('onWorkerError', { nativeEvent })
    this.stop({ message: 'VENDOR_DOWN' })
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
        this.setState({ workerReady: false })
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
    width: '100%'
  },
  workerHidden: {
    position: 'absolute',
    left: -2000,
    top: -2000,
    height: 0,
    width: 0,
    flex: 0
  },
  headerStyle: {
    flexDirection: 'row',
    alignContent: 'center',
    paddingHorizontal: 8,
    paddingTop: statusBarHeight + 8,
    paddingBottom: 8
  },
  headerTouchableStyle: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6
  },
  headerTextStyle: {
    marginLeft: 10,
    fontSize: 13,
    fontFamily: 'Lato-Bold',
    lineHeight: 16,
    color: colors.primaryColor
  }
})

export default withClient(LauncherView)
