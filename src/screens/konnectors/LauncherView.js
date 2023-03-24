import Minilog from '@cozy/minilog'

import { withClient } from 'cozy-client'

import {
  jsLogInterception,
  tryConsole
} from '/components/webviews/jsInteractions/jsLogInterception'
import { shouldEnableKonnectorExtensiveLog } from '/core/tools/env'

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
    this.onWorkerError = this.onWorkerError.bind(this)
    this.onStopExecution = this.onStopExecution.bind(this)
    this.onCreatedAccount = this.onCreatedAccount.bind(this)
    this.onCreatedJob = this.onCreatedJob.bind(this)
    this.onStoppedJob = this.onStoppedJob.bind(this)
    this.pilotWebView = null
    this.workerWebview = null
    this.state = {
      userAgent: undefined,
      konnector: null,
      worker: {}
    }
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
  onCreatedAccount(account) {
    const { launcherContext } = this.props
    const konnector = launcherContext.konnector.slug
    navigate('default', { konnector, account: account._id })
  }

  /**
   * Load konnector in memory from file system or cozy-stack
   *
   * @returns {Promise<void>}
   */
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
    this.launcher = new ReactNativeLauncher()
    // made to measure the time between the launcher initialization and the display of the worker webview (when needed)
    // this is not await not to block the initialization of the launcher
    this.launcher.waitForWorkerVisible()
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
    this.launcher.on('CREATED_ACCOUNT', this.onCreatedAccount)
    this.launcher.on('CREATED_JOB', this.onCreatedJob)
    this.launcher.on('STOPPED_JOB', this.onStoppedJob)

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
                  uri: get(this, 'state.konnector.manifest.vendor_link')
                }}
                useWebKit={true}
                javaScriptEnabled={true}
                userAgent={this.state.userAgent}
                sharedCookiesEnabled={true}
                onMessage={this.onPilotMessage}
                onError={this.onPilotError}
                injectedJavaScriptBeforeContentLoaded={run}
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
                injectedJavaScriptBeforeContentLoaded={run}
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
        this.launcher.emit('NEW_WORKER_INITIALIZING')
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
