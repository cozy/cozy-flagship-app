import Minilog from '@cozy/minilog'

import {
  jsLogInterception,
  tryConsole
} from '/components/webviews/jsInteractions/jsLogInterception'
import { shouldEnableKonnectorExtensiveLog } from '/core/tools/env'

import get from 'lodash/get'
import React, { Component } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { WebView } from 'react-native-webview'

import { handleBackPress, stopExecIfVisible } from './core/handleBackPress'

import { withClient } from 'cozy-client'

import { BackTo } from '/components/ui/icons/BackTo'
import { getDimensions } from '/libs/dimensions'
import ReactNativeLauncher from '/libs/ReactNativeLauncher'
import { getColors } from '/ui/colors'
import strings from '/constants/strings.json'
import {
  startTimeout,
  stopTimeout
} from '/screens/konnectors/core/handleTimeout'
import { navigationRef } from '/libs/RootNavigation'
import { TIMEOUT_KONNECTOR_ERROR } from '/libs/Launcher'
import { setFlagshipUI } from '/libs/intents/setFlagshipUI'
import { deactivateKeepAwake } from '/app/domain/sleep/services/sleep'

const log = Minilog('LauncherView')

const colors = getColors()
const { statusBarHeight } = getDimensions()
const HEADER_PADDING_TOP = statusBarHeight + 8
const HEADER_PADDING_BOTTOM = 8
const HEADER_LINE_HEIGHT = 16
const TOUCHABLE_VERTICAL_PADDING = 8

export class LauncherView extends Component {
  constructor(props) {
    super(props)
    this.onPilotMessage = this.onPilotMessage.bind(this)
    this.onWorkerMessage = this.onWorkerMessage.bind(this)
    this.onWorkerError = this.onWorkerError.bind(this)
    this.onWorkerLoad = this.onWorkerLoad.bind(this)
    this.onStopExecution = this.onStopExecution.bind(this)
    this.onCreatedAccount = this.onCreatedAccount.bind(this)
    this.onCreatedJob = this.onCreatedJob.bind(this)
    this.onStoppedJob = this.onStoppedJob.bind(this)
    this.pilotWebView = null
    this.workerWebview = null
    this.state = {
      userAgent: undefined,
      konnector: null,
      workerInnerUrl: null,
      worker: {},
      workerKey: 0,
      workerInteractionBlockerVisible: false
    }
    this.DEBUG = false
  }

  /**
   * Run when the job is stopped by the user
   */
  onStopExecution() {
    this.launcher.stop({ message: 'stopped by user' })
    this.props.setLauncherContext({ state: 'default' })
  }

  /**
   * Run when a job is created by the launcher. Update the current job id in the redux store.
   */
  onCreatedJob(job) {
    this.props.onKonnectorJobUpdate(job._id)
  }

  /**
   * Run when a job is normally stopped. Remove the current job id from the redux store.
   */
  onStoppedJob() {
    this.props.onKonnectorJobUpdate()
  }

  /**
   * Run when an account is created by the flagship app
   * make the webview navigate to the the harvest route associated to the account
   *
   * @param {import('cozy-client/types/types').IOCozyAccount} - cozy account object
   */
  onCreatedAccount({ _id: account }) {
    const konnector = this.props.launcherContext.konnector.slug

    // We already are in the Home Screen if we reach this point, so we just need to set params, no need to navigate.
    // It will trigger a re-render of the Home Screen and the Homeview uri will be updated
    // with the new account id and the konnector slug, making Harvest function properly.
    navigationRef.setParams({ account, konnector })
  }

  /**
   * Load konnector in memory from file system or cozy-stack
   *
   * @returns {Promise<void>}
   */
  async initKonnector() {
    const { client, launcherContext } = this.props
    const { DEBUG = false } = launcherContext
    this.DEBUG = DEBUG
    const slug = launcherContext.konnector.slug

    try {
      this.setState({
        konnector: await this.launcher.ensureKonnectorIsInstalled({
          slug,
          client
        })
      })
    } catch (err) {
      this.launcher.log({
        level: 'error',
        msg:
          'launcherView.initKonnector.ensureKonnectorIsInstalled: ' +
          err.message
      })
      return new Error('UNKNOWN_ERROR.KONNECTOR_INSTALL')
    }
    try {
      if (this.state.konnector) {
        await this.launcher.init({
          bridgeOptions: {
            pilotWebView: this.pilotWebView,
            workerWebview: this.workerWebview
          },
          contentScript: get(this, 'state.konnector.content')
        })
      }
    } catch (err) {
      this.launcher.log({
        level: 'error',
        msg: 'launcherView.initKonnector.HANDSHAKE: ' + err.message
      })
      return new Error('UNKNOWN_ERROR.HANDSHAKE_FAILED')
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
    this.launcher = this.props.launcher || new ReactNativeLauncher()
    // made to measure the time between the launcher initialization and the display of the worker webview (when needed)
    // this is not await not to block the initialization of the launcher
    this.launcher.waitForWorkerVisible(() =>
      setFlagshipUI({ topTheme: 'dark' })
    )
    this.launcher.setLogger(this.props.onKonnectorLog)

    this.launcher.setStartContext({
      ...this.props.launcherContext,
      client: this.props.client,
      launcherClient: this.props.launcherClient,
      manifest: get(this, 'state.konnector.manifest')
    })
    const initKonnectorError = await this.initKonnector()

    this.launcher.on('SET_WORKER_STATE', options => {
      // here we check the difference with worker inner url
      const newUrl = options.url
      const shouldForceWorkerReload =
        newUrl === this.state.worker.url && newUrl !== this.state.workerInnerUrl
      if (shouldForceWorkerReload) {
        this.setState({ workerKey: Date.now() })
      } else {
        // if we don't force worker reload, the reference to the worker webview won't change. Then we can resolve this promise directly.
        this.launcher.emit('worker:webview:ready')
      }
      this.setState({
        worker: { ...this.state.worker, ...options }
      })
    })

    this.launcher.on('BLOCK_WORKER_INTERACTIONS', () =>
      this.setState({ workerInteractionBlockerVisible: true })
    )
    this.launcher.on('UNBLOCK_WORKER_INTERACTIONS', () =>
      this.setState({ workerInteractionBlockerVisible: false })
    )

    this.launcher.on('SET_USER_AGENT', userAgent => {
      this.setState({ userAgent })
    })
    this.launcher.on('CREATED_ACCOUNT', this.onCreatedAccount)
    this.launcher.on('CREATED_JOB', this.onCreatedJob)
    this.launcher.on('STOPPED_JOB', this.onStoppedJob)

    startTimeout(() => {
      this.launcher.stop({ message: TIMEOUT_KONNECTOR_ERROR })
      this.props.setLauncherContext({ state: 'default' })
    })

    this.removeBackPress = handleBackPress(this, [stopExecIfVisible])

    await this.launcher.start({ initKonnectorError })

    stopTimeout()

    // in DEBUG mode, do not hide the worker in the end of the konnector execution
    // this allows to make it easier to try pilot commands in web inspector
    if (!this.DEBUG) this.props.setLauncherContext({ state: 'default' })
  }

  componentWillUnmount() {
    deactivateKeepAwake('clisk')
    this.removeBackPress()

    if (this.launcher.removeAllListener) {
      this.launcher.removeAllListener()
    }
    this.launcher.close()
  }

  render() {
    const workerVisible = this.state.worker.visible || this.DEBUG
    const workerStyle = workerVisible
      ? styles.workerVisible
      : styles.workerHidden

    const debug = shouldEnableKonnectorExtensiveLog()
    const run = debug
      ? `
        (function() {
         ${jsLogInterception}
          return true;
        })();
        ${get(this, 'state.konnector.content')}
      `
      : get(this, 'state.konnector.content')
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
                  uri: 'about:blank',
                  html: '<html></html>'
                }}
                useWebKit={true}
                javaScriptEnabled={true}
                sharedCookiesEnabled={true}
                onMessage={this.onPilotMessage}
                onError={this.onPilotError}
                injectedJavaScriptBeforeContentLoaded={run}
              />
            </View>
            <View testID="workerView" style={workerStyle}>
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
                key={this.state.workerKey}
                mediaPlaybackRequiresUserAction={true}
                ref={ref => {
                  this.workerWebview = ref
                }}
                originWhitelist={['*']}
                onLoad={this.onWorkerLoad}
                useWebKit={true}
                javaScriptEnabled={true}
                userAgent={this.state.userAgent}
                source={{
                  uri: this.state.worker.url
                }}
                sharedCookiesEnabled={true}
                onMessage={this.onWorkerMessage}
                onError={this.onWorkerError}
                injectedJavaScriptBeforeContentLoaded={run}
              />
              {workerVisible && this.state.workerInteractionBlockerVisible ? (
                <View
                  testID="workerInteractionBlocker"
                  style={[
                    styles.workerInteractionBlockerStyle,
                    this.DEBUG
                      ? styles.workerInteractionBlockerDebugStyle
                      : null
                  ]}
                />
              ) : null}
            </View>
          </>
        ) : null}
      </>
    )
  }

  onWorkerLoad(event) {
    this.setState({ workerInnerUrl: event.nativeEvent.url })
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
    tryConsole(event, log, 'CONSOLE_PILOT')
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
    tryConsole(event, log, 'CONSOLE_WORKER')
    if (event.nativeEvent && event.nativeEvent.data) {
      const msg = JSON.parse(event.nativeEvent.data)
      if (msg.message === 'NEW_WORKER_INITIALIZING') {
        this.launcher.emit('NEW_WORKER_INITIALIZING', this.workerWebview)
        return
      } else if (['load', 'DOMContentLoaded'].includes(msg.message)) {
        this.launcher.emit('worker:' + msg.message)
        return
      }
    }
    if (this.launcher) {
      this.launcher.onWorkerMessage(event)
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
    alignContent: 'center',
    backgroundColor: '#fff', // We do not want the default background color of <View /> which is blue in the app
    flexDirection: 'row',
    paddingBottom: HEADER_PADDING_BOTTOM,
    paddingHorizontal: 8,
    paddingTop: HEADER_PADDING_TOP
  },
  headerTouchableStyle: {
    flexDirection: 'row',
    paddingVertical: TOUCHABLE_VERTICAL_PADDING,
    paddingHorizontal: 6
  },
  headerTextStyle: {
    marginLeft: 10,
    fontSize: 13,
    fontFamily: 'Lato-Bold',
    lineHeight: HEADER_LINE_HEIGHT,
    color: colors.primaryColor
  },
  workerInteractionBlockerStyle: {
    position: 'absolute',
    backgroundColor: 'red',
    top:
      HEADER_PADDING_BOTTOM +
      HEADER_PADDING_TOP +
      HEADER_LINE_HEIGHT +
      TOUCHABLE_VERTICAL_PADDING * 2,
    width: '100%',
    height: '100%',
    opacity: 0.01
  },
  workerInteractionBlockerDebugStyle: {
    opacity: 0.1
  }
})

export default withClient(LauncherView)
