export const interceptHashAndNavigate = (uri, webviewRef, logger, logId) => {
  const url = new URL(uri)

  if (url.hash && webviewRef) {
    logger.info(`[Native ${logId}] Redirect webview to ${url.hash}`)
    webviewRef.injectJavaScript(`
      (function() {
        window.location.hash = '${url.hash}';
        true;
      })();
    `)
  }
}
