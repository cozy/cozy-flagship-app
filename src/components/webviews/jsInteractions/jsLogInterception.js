export const jsLogInterception = `
  const originalJsConsole = console;
  const consoleLog = (type, log) => {
    originalJsConsole[type](log);
    window.ReactNativeWebView.postMessage(
      JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}})
    );
  };
  console = {
    log: (log) => consoleLog('log', log),
    debug: (log) => consoleLog('debug', log),
    info: (log) => consoleLog('info', log),
    warn: (log) => consoleLog('warn', log),
    error: (log) => consoleLog('error', log),
  };
`

export const tryConsole = (payload, logger, logId) => {
  try {
    const dataPayload = JSON.parse(payload.nativeEvent.data)

    if (dataPayload) {
      if (dataPayload.type === 'Console') {
        const {type, log: msg} = dataPayload.data
        logger[type](`[Console ${logId}] ${msg}`)
      }
    }
  } catch (e) {
    log.error(e)
  }
}
