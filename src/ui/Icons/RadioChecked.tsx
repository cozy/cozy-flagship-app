import React from 'react'
import { CommonPathProps, SvgXml } from 'react-native-svg'

export const RadioChecked = (props?: CommonPathProps): JSX.Element => (
  <SvgXml
    {...props}
    xml='&lt;svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"&gt;
  &lt;path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" /&gt;&lt;/svg&gt;'
  />
)
