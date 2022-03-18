import {windowPasswordObjectDeclaration} from './jsFunctions/jsPasswordHelpers'
import {computePassFunctionDeclaration} from './jsFunctions/jsComputePass'
import {computePKCEFunctionDeclaration} from './jsFunctions/jsComputePKCE'
import {
  postMessageFunctionDeclaration,
  listenMessageFunctionDeclaration,
} from './jsFunctions/jsMessaging'

const jsCode = `
  ${windowPasswordObjectDeclaration}
  ${computePassFunctionDeclaration}
  ${computePKCEFunctionDeclaration}
  ${postMessageFunctionDeclaration}
  ${listenMessageFunctionDeclaration}

  const messagingFunctions = {
    computePass,
    computePKCE
  }
`

export const html = `
  <html>
    <head>
    </head>
    <body>
      <div id="main"></div>
      <script language='javascript'>
        ${jsCode}
      </script>
    </body>
  </html>
`
