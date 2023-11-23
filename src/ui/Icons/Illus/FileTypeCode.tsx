import React from 'react'
import { CommonPathProps, SvgXml } from 'react-native-svg'

export const FileTypeCode = (props?: CommonPathProps): JSX.Element => (
  <SvgXml
    {...props}
    xml='&lt;svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"&gt;&lt;g fill="none" fill-rule="evenodd"&gt;&lt;path fill="#E6D5FF" d="M3 2.002C3 .896 3.89 0 4.997 0H22l7 7v22.996A2 2 0 0 1 27.003 32H4.997A1.995 1.995 0 0 1 3 29.998V2.002z"/&gt;&lt;path fill="#9C59FF" d="M21.5 0c-.276 0-.5.23-.5.5V8h7.5c.276 0 .5-.232.5-.5V7l-7-7h-.5z"/&gt;&lt;g stroke="#9C59FF" stroke-width="2"&gt;&lt;path stroke-linejoin="round" d="M12 22l-4-4 4-4M20 22l4-4-4-4"/&gt;&lt;path d="M14 25l4-14"/&gt;&lt;/g&gt;&lt;/g&gt;&lt;/svg&gt;
  '
  />
)
