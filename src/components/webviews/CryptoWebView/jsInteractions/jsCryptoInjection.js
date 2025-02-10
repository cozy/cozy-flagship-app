import { computePKCEFunctionDeclaration } from './jsFunctions/jsComputePKCE'
import { computePassFunctionDeclaration } from './jsFunctions/jsComputePass'
import {
  postMessageFunctionDeclaration,
  listenMessageFunctionDeclaration
} from './jsFunctions/jsMessaging'
import { windowPasswordObjectDeclaration } from './jsFunctions/jsPasswordHelpers'
import { subtleFunctionDeclaration } from './jsFunctions/jsSubtle'

const jsCode = `
  ${postMessageFunctionDeclaration}
  ${listenMessageFunctionDeclaration}
  ${windowPasswordObjectDeclaration}
  ${computePassFunctionDeclaration}
  ${computePKCEFunctionDeclaration}
  ${subtleFunctionDeclaration}

  const messagingFunctions = {
    computePass,
    computePKCE,
    sublteProxy
  }

  postMessage(JSON.stringify({ isReady: true }))
`

export const html = `
  <html>
    <head>
       <title>Crypto WebView</title>
    </head>
    <body>
      <div id="main"></div>
      <script language='javascript'>
        ${jsCode}
      </script>
    </body>
  </html>
`
