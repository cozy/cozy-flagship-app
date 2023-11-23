import React from 'react'
import { CommonPathProps, SvgXml } from 'react-native-svg'

export const FileTypeText = (props?: CommonPathProps): JSX.Element => (
  <SvgXml
    {...props}
    xml='&lt;svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"&gt;&lt;g fill="none" fill-rule="evenodd"&gt;&lt;path fill="#B2D3FF" d="M3 2.002C3 .896 3.89 0 4.997 0H22l7 7v22.996A2 2 0 0 1 27.003 32H4.997A1.995 1.995 0 0 1 3 29.998V2.002z"/&gt;&lt;path fill="#197BFF" d="M21.5 0c-.276 0-.5.23-.5.5V8h7.5c.276 0 .5-.232.5-.5V7l-7-7h-.5zM9 11h14v2H9v-2zm0 4h12v2H9v-2zm0 4h14v2H9v-2zm0 4h10v2H9v-2z"/&gt;&lt;/g&gt;&lt;/svg&gt;
  '
  />
)
