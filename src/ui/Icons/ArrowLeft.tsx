import React from 'react'
import { CommonPathProps, SvgXml } from 'react-native-svg'

export const ArrowLeft = (props?: CommonPathProps): JSX.Element => (
  <SvgXml
    {...props}
    xml='&lt;svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"&gt;&lt;g id="icons/16/icon-arrow-left"&gt;&lt;path id="Shape" fill-rule="evenodd" clip-rule="evenodd" d="M3.41421 7H14.9932C15.5492 7 16 7.44386 16 8C16 8.55229 15.5501 9 14.9932 9H3.41421L8.70711 14.2929C9.09763 14.6834 9.09763 15.3166 8.70711 15.7071C8.31658 16.0976 7.68342 16.0976 7.29289 15.7071L0.292893 8.70711C-0.0976311 8.31658 -0.0976311 7.68342 0.292893 7.29289L7.29289 0.292893C7.68342 -0.0976311 8.31658 -0.0976311 8.70711 0.292893C9.09763 0.683418 9.09763 1.31658 8.70711 1.70711L3.41421 7Z" fill-opacity="0.72"/&gt;&lt;/g&gt;&lt;/svg&gt;'
  />
)
