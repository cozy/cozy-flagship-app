import React from 'react'
import { SvgXml } from 'react-native-svg'

const xml = `
<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.94894 4.26604C11.3395 5.01614 14.6534 8.2776 15.9702 11.9514C16.1535 12.4642 15.5195 12.8631 15.1185 12.4933C12.9636 10.4937 9.65382 9.56332 5.94894 9.56332V12.0586C5.94894 12.3348 5.72508 12.5586 5.44894 12.5586C5.31853 12.5586 5.19328 12.5077 5.0999 12.4166L0.347222 7.78311C-0.107546 7.33975 -0.116789 6.61167 0.326577 6.1569L5.09987 1.502C5.29758 1.30922 5.61414 1.31321 5.80692 1.51092C5.89798 1.6043 5.94894 1.72956 5.94894 1.85999V4.26604Z"/>
</svg>
`

class SVG extends React.Component {
  render() {
    return (
      <SvgXml
        xml={xml}
        width={this.props.width}
        height={this.props.height}
        fill={this.props.color}
      />
    )
  }
}

export const BackTo = SVG
