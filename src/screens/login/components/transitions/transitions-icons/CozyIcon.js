import React from 'react'
import { Animated } from 'react-native'
import { SvgXml } from 'react-native-svg'

import { getAvatarTransitionSvg } from '/ui/Logo/avatar'

const xml = getAvatarTransitionSvg()

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

export const CozyIcon = Animated.createAnimatedComponent(SVG)
