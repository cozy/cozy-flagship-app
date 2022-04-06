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

export const tryConsole = (
  payload: {nativeEvent: {data: string}},
  logger: {[key: string]: (namespace?: string, ...args: string[]) => void},
  logId: string,
) => {
  try {
    const dataPayload = JSON.parse(payload.nativeEvent.data)

    if (!dataPayload?.data) {
      return
    }

    const {type, log: msg} = dataPayload.data

    if (msg[0] === 'webview-service') {
      return console.debug(...msg)
    }
    logger[type](
      `[Console ${logId}]`,
      ...msg.map((v: unknown) => JSON.stringify(v)),
    )
  } catch (e) {
    console.error(e)
  }
}
