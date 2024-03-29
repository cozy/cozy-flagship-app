import React from 'react'
import { CommonPathProps, SvgXml } from 'react-native-svg'

export const FileTypeSheet = (props?: CommonPathProps): JSX.Element => (
  <SvgXml
    {...props}
    xml='&lt;svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"&gt;&lt;g fill="none" fill-rule="evenodd"&gt;&lt;path fill="#9FE6A2" d="M3 2.002C3 .896 3.89 0 4.997 0H22l7 7v22.996A2 2 0 0 1 27.003 32H4.997A1.995 1.995 0 0 1 3 29.998V2.002z"/&gt;&lt;path fill="#0FC016" d="M21.5 0c-.276 0-.5.23-.5.5V8h7.5c.276 0 .5-.232.5-.5V7l-7-7h-.5zM8 9h4v2H8V9zm0-4h4v2H8V5zm0 8h4v2H8v-2zm0 4h4v2H8v-2zm0 4h4v2H8v-2zm0 4h4v2H8v-2zm6-16h4v2h-4V9zm0-4h4v2h-4V5zm0 8h4v2h-4v-2zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2zm6-12h4v2h-4v-2zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2z"/&gt;&lt;/g&gt;&lt;/svg&gt;
  '
  />
)
