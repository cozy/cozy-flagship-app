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
    assert: (...log) => consoleLog('assert', log),
    clear: (...) => consoleLog('clear', log),
    count: (...) => consoleLog('count', log),
    countReset: (...) => consoleLog('countReset', log),
    debug: (...log) => consoleLog('debug', log),
    dir: (...log) => consoleLog('dir', log),
    dirxml: (...log) => consoleLog('dirxml', log),
    error: (...log) => consoleLog('error', log),
    group: (...log) => consoleLog('group', log),
    groupCollapsed: (...log) => consoleLog('groupCollapsed', log),
    groupEnd: (...log) => consoleLog('groupEnd', log),
    info: (...log) => consoleLog('info', log),
    log: (...log) => consoleLog('log', log),
    table: (...log) => consoleLog('table', log),
    time: (...log) => consoleLog('time', log),
    timeEnd: (...log) => consoleLog('timeEnd', log),
    timeLog: (...log) => consoleLog('timeLog', log),
    trace: (...log) => consoleLog('trace', log),
    warn: (...log) => consoleLog('warn', log),
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
