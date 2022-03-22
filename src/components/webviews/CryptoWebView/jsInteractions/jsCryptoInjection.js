import {
  postMessageFunctionDeclaration,
  listenMessageFunctionDeclaration,
} from './jsFunctions/jsMessaging'

const jsCode = `
  ${postMessageFunctionDeclaration}
  ${listenMessageFunctionDeclaration}

  const messagingFunctions = {
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
