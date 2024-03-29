import React from 'react'
import { CommonPathProps, SvgXml } from 'react-native-svg'

export const FileTypeImage = (props?: CommonPathProps): JSX.Element => (
  <SvgXml
    {...props}
    xml='&lt;svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"&gt;&lt;g fill="none" fill-rule="evenodd" transform="translate(0 3)"&gt;&lt;rect width="32" height="26" fill="#8EE39B" rx="2"/&gt;&lt;path fill="#1EC737" d="M0 20l6.29-6.29a.999.999 0 0 1 1.416-.004L11 17l8.294-8.294a1.003 1.003 0 0 1 1.412 0L32 20v4.002C32 25.106 31.11 26 29.998 26H2.002A2.002 2.002 0 0 1 0 24.002V20z"/&gt;&lt;circle cx="8" cy="7" r="3" fill="#FFF"/&gt;&lt;path stroke="#8EE39B" d="M11 16l-5.5 5.5L11 16z" stroke-linecap="round" stroke-linejoin="round"/&gt;&lt;/g&gt;&lt;/svg&gt;'
  />
)
