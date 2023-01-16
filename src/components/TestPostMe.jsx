import React, { Component } from 'react'
import { Button } from 'react-native'
import { WebView } from 'react-native-webview'

import ContentScriptBridge from '/libs/bridge/ContentScriptBridge'

class Launcher {
  constructor() {}

  doStuff() {
    console.log('🍒 doStuff')
  }

  doStuffEvent() {
    console.log('🍒 doStuffEvent')
  }

  async init(webview) {
    const exposedMethodsNames = ['doStuff']

    const listenedEventsNames = ['doStuffEvent']

    this.pilot = new ContentScriptBridge({ label: 'pilot' })

    await this.pilot.init({
      root: this,
      exposedMethodsNames,
      listenedEventsNames,
      webViewRef: webview,
      label: 'pilot',
      debug: false
    })
  }

  call(name) {
    return this.pilot.call(name)
  }
}

export class TestPostMe extends Component {
  launcher = undefined

  constructor(props) {
    super(props)
    this.pilotWebView = null
  }

  async init() {
    this.launcher = new Launcher()
    this.launcher.init(this.pilotWebView)
  }

  onPilotMessage(event) {
    if (this.launcher?.pilot) {
      const messenger = this.launcher.pilot.messenger
      messenger.onMessage.bind(messenger)(event)
    }
  }

  onPilotError(event) {
    console.error('error event', event)
  }

  async doStart() {
    const iterations = this.props.iterations
    console.log(`🍎 PostMe starts ${iterations} iterations`)
    const start = Date.now()
    for (let i = 0; i < iterations; i++) {
      const result = await this.launcher.call('ensureAuthenticated')
    }

    const end = Date.now()
    const diff = end - start
    console.log('🍎 PostMe ellapsed:', diff)
  }

  render() {
    const injectedJs =
      require('../../connectors/template/dist/webviewScript.js').content

    return (
      <>
        <WebView
          mediaPlaybackRequiresUserAction={true}
          ref={ref => (this.pilotWebView = ref)}
          originWhitelist={['*']}
          source={{
            uri: 'http://books.toscrape.com/'
          }}
          useWebKit={true}
          javaScriptEnabled={true}
          sharedCookiesEnabled={true}
          onMessage={this.onPilotMessage.bind(this)}
          onError={this.onPilotError}
          injectedJavaScriptBeforeContentLoaded={injectedJs}
        />
        <Button title="Init" onPress={this.init.bind(this)} />
        <Button title="Start" onPress={this.doStart.bind(this)} />
      </>
    )
  }
}
