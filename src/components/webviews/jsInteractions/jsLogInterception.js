import log from 'cozy-logger'

export const jsLogInterception = `
  const originalJsConsole = console
  const consoleLog = (type, log) => {
    originalJsConsole[type](...log)

    try {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'Console',
          data: {type, log},
        }),
      )
    } catch {}
  }

  console = {
    log: (...log) => consoleLog('log', log),
    debug: (...log) => consoleLog('debug', log),
    info: (...log) => consoleLog('info', log),
    warn: (...log) => consoleLog('warn', log),
    error: (...log) => consoleLog('error', log),
  }
`

export const tryConsole = (payload, logger, logId) => {
  try {
    const dataPayload = JSON.parse(payload.nativeEvent.data)

    if (
      !(dataPayload === null || dataPayload === undefined
        ? undefined
        : dataPayload.data)
    ) {
      return
    }

    const { type, log: msg } = dataPayload.data

    if (msg[0] === 'webview-service') {
      // eslint-disable-next-line no-console
      return console.debug(...msg)
    }
    logger[type](`[Console ${logId}]`, ...msg.map(v => JSON.stringify(v)))
  } catch (e) {
    log('error', e)
  }
}
