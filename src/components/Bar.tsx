// This was taken from https://github.com/oblador/react-native-progress because hacks were needed
// At this time the fastest was just to copy the file, it has no dependencies

import React, { Component, ReactElement } from 'react'
import {
  Animated,
  Easing,
  View,
  I18nManager,
  ViewStyle,
  StyleProp
} from 'react-native'

const INDETERMINATE_WIDTH_FACTOR = 0.6 // 0.3 to 0.6
const BAR_WIDTH_ZERO_POSITION =
  INDETERMINATE_WIDTH_FACTOR / (1 + INDETERMINATE_WIDTH_FACTOR)

export interface ProgressBarProps {
  animated?: boolean
  borderRadius?: number
  borderWidth?: number
  color?: string
  height?: number
  indeterminate?: boolean
  indeterminateAnimationDuration?: number
  progress?: number
  width?: number
  useNativeDriver?: boolean
  animationConfig?: { bounciness: number }
  animationType?: string
  onLayout?: (event: unknown) => void
  unfilledColor?: string
  borderColor?: string
  style?: StyleProp<ViewStyle>
  children?: ReactElement
}

interface ProgressBarState {
  width: number
  progress: Animated.Value
  animationValue: Animated.Value
}

export default class ProgressBar extends Component<
  ProgressBarProps,
  ProgressBarState
> {
  static defaultProps = {
    animated: true,
    borderRadius: 4,
    borderWidth: 1,
    color: 'rgba(0, 122, 255, 1)',
    height: 6,
    indeterminate: false,
    indeterminateAnimationDuration: 1000,
    progress: 0,
    width: 150,
    useNativeDriver: false,
    animationConfig: { bounciness: 0 },
    animationType: 'spring'
  }

  constructor(props: ProgressBarProps) {
    super(props)
    const progress = Math.min(Math.max(props.progress ?? 0, 0), 1)
    this.state = {
      width: 0,
      progress: new Animated.Value(
        props.indeterminate ? INDETERMINATE_WIDTH_FACTOR : progress
      ),
      animationValue: new Animated.Value(BAR_WIDTH_ZERO_POSITION)
    }
  }

  componentDidMount(): void {
    if (this.props.indeterminate) {
      this.animate()
    }
  }

  componentDidUpdate(prevProps: ProgressBarProps): void {
    if (prevProps.indeterminate !== this.props.indeterminate) {
      if (this.props.indeterminate) {
        this.animate()
      } else {
        Animated.spring(this.state.animationValue, {
          toValue: BAR_WIDTH_ZERO_POSITION,
          useNativeDriver: this.props.useNativeDriver ?? false
        }).start()
      }
    }
    if (
      prevProps.indeterminate !== this.props.indeterminate ||
      prevProps.progress !== this.props.progress
    ) {
      const progress = this.props.indeterminate
        ? INDETERMINATE_WIDTH_FACTOR
        : Math.min(Math.max(this.props.progress ?? 0, 0), 1)

      if (this.props.animated) {
        const { animationType, animationConfig } = this.props
        const animationFunction = Animated[
          animationType as keyof typeof Animated
        ] as (
          value: Animated.Value,
          config: Animated.SpringAnimationConfig
        ) => Animated.CompositeAnimation
        animationFunction(this.state.progress, {
          ...animationConfig,
          toValue: progress,
          useNativeDriver: this.props.useNativeDriver ?? false
        }).start((endState: { finished: boolean }) => {
          if (endState.finished && this.props.indeterminate) {
            this.animate()
          }
        })
      } else {
        this.state.progress.setValue(progress)
      }
    }
  }

  handleLayout = (event: {
    nativeEvent: { layout: { width: number } }
  }): void => {
    if (!this.props.width) {
      this.setState({ width: event.nativeEvent.layout.width })
    }
    if (this.props.onLayout) {
      this.props.onLayout(event)
    }
  }

  animate(): void {
    this.state.animationValue.setValue(0)
    Animated.timing(this.state.animationValue, {
      toValue: 1,
      duration: this.props.indeterminateAnimationDuration,
      easing: Easing.linear,
      isInteraction: false,
      useNativeDriver: this.props.useNativeDriver ?? false
    }).start(endState => {
      if (endState.finished) {
        this.animate()
      }
    })
  }

  render(): JSX.Element {
    const {
      borderColor,
      borderRadius,
      borderWidth,
      children,
      color,
      height,
      style,
      unfilledColor,
      width,
      ...restProps
    } = this.props

    const innerWidth =
      Math.max(0, width ?? this.state.width) - (borderWidth ?? 1) * 2
    const containerStyle = {
      width,
      borderWidth,
      borderColor: borderColor ?? color,
      borderRadius,
      overflow: 'hidden',
      backgroundColor: unfilledColor
    } as ViewStyle
    const progressStyle = {
      backgroundColor: color,
      borderRadius: 100, // Added
      height,
      transform: [
        {
          translateX: this.state.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [innerWidth * -INDETERMINATE_WIDTH_FACTOR, innerWidth]
          })
        },
        {
          translateX: this.state.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [innerWidth / (I18nManager.isRTL ? 2 : -2), 0]
          })
        },
        {
          // Interpolation a temp workaround for https://github.com/facebook/react-native/issues/6278
          scaleX: this.state.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.0001, 1]
          })
        }
      ]
    }

    return (
      <View
        style={[containerStyle, style]}
        onLayout={this.handleLayout}
        {...restProps}
      >
        <Animated.View style={progressStyle} />
        {children}
      </View>
    )
  }
}
