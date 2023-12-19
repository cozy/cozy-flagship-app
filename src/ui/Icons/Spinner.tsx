import React from 'react'
import { CommonPathProps, SvgXml } from 'react-native-svg'

export const Spinner = (props?: CommonPathProps): JSX.Element => (
  <SvgXml
    {...props}
    xml="
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
        <path opacity='.25' d='M16 0a16 16 0 0 0 0 32 16 16 0 0 0 0-32m0 4a12 12 0 0 1 0 24 12 12 0 0 1 0-24'/>
        <path d='M16 0a16 16 0 0 1 16 16h-4a12 12 0 0 0-12-12z'/>
      </svg>
    "
  />
)
