import React from 'react'
import { CommonPathProps, SvgXml } from 'react-native-svg'

export const LogoutFlipped = (props?: CommonPathProps): JSX.Element => (
  <SvgXml
    {...props}
    xml='<svg width="15" height="16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.414 7H14a1 1 0 1 1 0 2H6.414l1.293 1.293a1 1 0 1 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414l3-3a1 1 0 0 1 1.414 1.414L6.414 7ZM2 15a1 1 0 1 1-2 0V1a1 1 0 1 1 2 0v14Z" /></svg>'
  />
)
