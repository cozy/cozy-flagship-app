import { windowPasswordObjectDeclaration } from './jsFunctions/jsPasswordHelpers'
import { computePassFunctionDeclaration } from './jsFunctions/jsComputePass'
import { computePKCEFunctionDeclaration } from './jsFunctions/jsComputePKCE'
import { subtleFunctionDeclaration } from './jsFunctions/jsSubtle'
import { generateHttpServerSecurityKeyFunctionDeclaration } from './jsFunctions/jsGenerateHttpServerSecurityKey'
import {
  postMessageFunctionDeclaration,
  listenMessageFunctionDeclaration
} from './jsFunctions/jsMessaging'

const jsCode = `
  ${windowPasswordObjectDeclaration}
  ${computePassFunctionDeclaration}
  ${computePKCEFunctionDeclaration}
  ${generateHttpServerSecurityKeyFunctionDeclaration}
  ${subtleFunctionDeclaration}
  ${postMessageFunctionDeclaration}
  ${listenMessageFunctionDeclaration}

  const messagingFunctions = {
    computePass,
    computePKCE,
    generateHttpServerSecurityKey,
    sublteProxy
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
