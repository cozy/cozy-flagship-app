import { computePKCEFunctionDeclaration } from './jsFunctions/jsComputePKCE'
import { computePassFunctionDeclaration } from './jsFunctions/jsComputePass'
import { generateHttpServerSecurityKeyFunctionDeclaration } from './jsFunctions/jsGenerateHttpServerSecurityKey'
import {
  postMessageFunctionDeclaration,
  listenMessageFunctionDeclaration
} from './jsFunctions/jsMessaging'
import { windowPasswordObjectDeclaration } from './jsFunctions/jsPasswordHelpers'
import { subtleFunctionDeclaration } from './jsFunctions/jsSubtle'

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
