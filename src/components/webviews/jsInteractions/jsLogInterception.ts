/* eslint-disable no-console */
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
    const { data: rawData } = payload.nativeEvent

    const dataPayload = JSON.parse(rawData)

    if (!dataPayload.data || dataPayload.type !== 'Console') return

    const { type, log } = dataPayload.data

    if (rawData.includes('@post-me')) return console.debug(...log)

    logger[type](`[Console ${logId}]`, ...log)
  } catch (e) {
    console.error('error', e)
  }
}
