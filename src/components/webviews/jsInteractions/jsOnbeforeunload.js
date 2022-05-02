export const jsOnbeforeunload = `
  // On Android, when reloading manually a page, the WebView.onShouldStartLoadWithRequest method is not called
  // Using WindowEventHandlers.onbeforeunload allows to catch reload event only on Android manual reload
  // The postMessage will be caught and ReloadInterceptorWebView will handle this reloading case
  window.onbeforeunload = (event) => {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'intercept-reload',
        data: {event},
      }),
    )
  }
`
