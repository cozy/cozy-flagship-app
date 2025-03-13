# How to make a cozy-app compatible

There are some constraints when running a cozy-app inside the Flagship app. Some APIs that should not be used or have been partially mocked for various technical reasons:
- We forward webview logs to React Native logs so we patched console. Only main console methods are supported for the moment. See [jsLogInterception.ts](https://github.com/cozy/cozy-flagship-app/blob/2c4614d4bd5d7eb1b501b7f2fb5d5dc12cdf94b0/src/components/webviews/jsInteractions/jsLogInterception.ts#L17).
- On iOS and Android, some APIs are not supported at all like Notifications API.
- On iOS, apps in webview are unfortunately not on a *Secure contexts* which means that some browser APIs does not work. To circumvent this, we inject a subpart of these APIs
    - window.crypto.subtle
    - window.navigator.clipboard
    - window.navigator.share
- On iOS, because we inject [here](https://github.com/cozy/cozy-flagship-app/blob/5edfaed11b16dcdd34a9419b5a500852e5f26fd1/src/components/webviews/CozyProxyWebView.functions.js#L121-L124) html code and a base URL, it breaks webview history (it is an iOS bug) so we can not go back in history for example with `navigate(-1)`.