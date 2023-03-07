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
import {
  startTimeout,
  stopTimeout
} from '/screens/konnectors/core/handleTimeout'
import { navigate } from '/libs/RootNavigation'
import { TIMEOUT_KONNECTOR_ERROR } from '/libs/Launcher'

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
    this.onCreatedAccount = this.onCreatedAccount.bind(this)
    this.onCreatedJob = this.onCreatedJob.bind(this)
    this.onStoppedJob = this.onStoppedJob.bind(this)
    this.onWorkerWillReload = debounce(this.onWorkerWillReload.bind(this), 1000)
    this.pilotWebView = null
    this.workerWebview = null
    this.state = {
      userAgent: undefined,
      konnector: null,
      worker: {},
      workerReady: false
    }
  }

  onStopExecution() {
    this.launcher.stop({ message: 'stopped by user' })
    this.props.setLauncherContext({ state: 'default' })
  }

  onCreatedJob(job) {
    this.props.onKonnectorJobUpdate(job._id)
  }

  onStoppedJob() {
    this.props.onKonnectorJobUpdate()
  }

  onCreatedAccount(account) {
    // make the webview navigate to the the harvest route associated to the account
    const { launcherContext } = this.props
    const konnector = launcherContext.konnector.slug
    navigate('default', { konnector, account: account._id })
  }

  async initKonnector() {
    const { client, launcherContext } = this.props
    const slug = launcherContext.konnector.slug

    try {
      this.setState({
        konnector: await this.launcher.ensureKonnectorIsInstalled({
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
    this.launcher.setLogger(this.props.onKonnectorLog)
    this.launcher.setStartContext({
      ...this.props.launcherContext,
      ...this.launcher.startContext,
      client: this.props.client,
      launcherClient: this.props.launcherClient,
      manifest: get(this, 'state.konnector.manifest')
    })
  }

  async componentDidMount() {
    this.launcher = new ReactNativeLauncher()
    this.launcher.setLogger(this.props.onKonnectorLog)

    this.launcher.setStartContext({
      ...this.props.launcherContext,
      client: this.props.client,
      launcherClient: this.props.launcherClient,
      manifest: get(this, 'state.konnector.manifest')
    })
    const initKonnectorError = await this.initKonnector()

    this.launcher.on('SET_WORKER_STATE', options => {
      this.setState({ worker: { ...this.state.worker, ...options } })
    })

    this.launcher.on('SET_USER_AGENT', userAgent => {
      this.setState({ userAgent })
    })
    this.launcher.on('WORKER_READY', () => {
      this.setState({ workerReady: true })
    })
    this.launcher.on('CREATED_ACCOUNT', this.onCreatedAccount)
    this.launcher.on('CREATED_JOB', this.onCreatedJob)
    this.launcher.on('STOPPED_JOB', this.onStoppedJob)

    if (this.state.konnector) {
      await this.launcher.init({
        bridgeOptions: {
          pilotWebView: this.pilotWebView,
          workerWebview: this.workerWebview
        },
        contentScript: get(this, 'state.konnector.content')
      })
    }

    startTimeout(() => {
      this.launcher.stop({ message: TIMEOUT_KONNECTOR_ERROR })
      this.props.setLauncherContext({ state: 'default' })
    })

    await this.launcher.start({ initKonnectorError })

    stopTimeout()

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
        {this.state.konnector ? (
          <>
            <View>
              <WebView
                mediaPlaybackRequiresUserAction={true}
                ref={ref => (this.pilotWebView = ref)}
                originWhitelist={['*']}
                source={{
                  uri: get(this, 'state.konnector.manifest.vendor_link')
                }}
                useWebKit={true}
                javaScriptEnabled={true}
                userAgent={this.state.userAgent}
                sharedCookiesEnabled={true}
                onMessage={this.onPilotMessage}
                onError={this.onPilotError}
                injectedJavaScriptBeforeContentLoaded={get(
                  this,
                  'state.konnector.content'
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
                    {strings.konnectors.worker.backButton}
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
                  'state.konnector.content'
                )}
              />
            </View>
          </>
        ) : null}
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
    log.error('onPilotError', { nativeEvent })
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
