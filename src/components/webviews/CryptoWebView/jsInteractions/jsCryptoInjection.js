import {windowPasswordObjectDeclaration} from './jsFunctions/jsPasswordHelpers'
import {computePassFunctionDeclaration} from './jsFunctions/jsComputePass'
import {
  postMessageFunctionDeclaration,
  listenMessageFunctionDeclaration,
} from './jsFunctions/jsMessaging'

const jsCode = `
  ${windowPasswordObjectDeclaration}
  ${computePassFunctionDeclaration}
  ${postMessageFunctionDeclaration}
  ${listenMessageFunctionDeclaration}

  const messagingFunctions = {
    computePass
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
