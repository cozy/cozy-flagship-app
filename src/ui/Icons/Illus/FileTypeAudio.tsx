import React from 'react'
import { CommonPathProps, SvgXml } from 'react-native-svg'

export const FileTypeAudio = (props?: CommonPathProps): JSX.Element => (
  <SvgXml
    {...props}
    xml='&lt;svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"&gt;&lt;g fill="none" fill-rule="evenodd" transform="translate(1 1)"&gt;&lt;rect width="30" height="30" fill="#ACF6F7" rx="2"/&gt;&lt;path fill="#0CCBD0" d="M8 19.998c-1.105 0-2 .888-2 2 0 1.105.898 2 1.998 2H9c1.657 0 3-1.35 3-2.997v-7.679a.63.63 0 0 1 .492-.601l6.016-1.129c.272-.05.492.124.492.418v5.478c0 .282-.215.51-.49.51H17c-1.105 0-2 .904-2 1.997v-.179a2 2 0 0 0 1.998 1.997H18c1.657 0 3-1.349 3-2.993V7c0-.554-.445-.921-.976-.825L10.976 7.82C10.437 7.918 10 8.454 10 9v10.498c0 .276-.215.5-.49.5H8z"/&gt;&lt;/g&gt;&lt;/svg&gt;
  '
  />
)
