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
    warn: (...log) => consoleLog('log', ['warn:', ...log]),
    error: (...log) => consoleLog('error', log),
    group: (...log) => consoleLog('group', log),
    groupEnd: (...log) => consoleLog('groupEnd', log),
    count: () => consoleLog('log', ['console.count is not supported in the flagship app']),
    countReset: () => consoleLog('log', ['console.countReset is not supported in the flagship app']),
    table: () => consoleLog('log', ['console.table is not supported in the flagship app']),
    time: () => consoleLog('log', ['console.time is not supported in the flagship app']),
    timeEnd: () => consoleLog('log', ['console.timeEnd is not supported in the flagship app']),
  }
`

export const tryConsole = (
  payload: { nativeEvent: { data: string } } | undefined,
  logger: MiniLogger | undefined,
  logId: string | undefined
): void => {
  try {
    if (!payload || !logger || !logId) return console.error('no payload')

    const { data: rawData } = payload.nativeEvent

    const dataPayload = JSON.parse(rawData) as {
      type: string
      data?: { type: string; log: string[] }
    }

    if (!dataPayload.data || dataPayload.type !== 'Console') return

    const { type, log } = dataPayload.data

    if (rawData.includes('@post-me')) return console.debug(...log)

    if (typeof logger[type as keyof MiniLogger] === 'function') {
      logger[type as keyof MiniLogger](`[Console ${logId}]`, ...log)
    }
  } catch (e) {
    console.error('error', e)
  }
}
