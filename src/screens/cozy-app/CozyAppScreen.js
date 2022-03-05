import React, {useState, useEffect} from 'react'
import {View, Animated, Dimensions} from 'react-native'

import CozyWebView from '../../components/webviews/CozyWebView'

export const CozyAppScreen = ({route, navigation}) => {
  const [visible, setVisible] = useState(true)
  const [value] = useState(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(value, {
      toValue: 1,
      duration: 10000,
      useNativeDriver: true,
    }).start()
  }, [value])
  return (
    <View style={{flex: 1}}>
      <CozyWebView
        source={{uri: route.params.href}}
        navigation={navigation}
        logId="AppScreen"
        onLoadEnd={() => {
          setVisible(false)
          //fadeAnimation()
        }}
      />
      {visible && (
        <View
          style={{
            backgroundColor: '#297EF2',
            position: 'absolute',
            height: Dimensions.get('window').height,
            width: Dimensions.get('window').width,
          }}>
          <Animated.Image
            source={require('../../assets/bootsplash_logo.png')}
            useNativeDriver={true}
            resizeMode="cover"
            style={{
              position: 'absolute',
              left: (Dimensions.get('window').width - 40) / 2,
              top: (Dimensions.get('window').height - 40) / 2,
              height: 40,
              width: 40,
              transform: [
                {
                  translateX: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0],
                  }),
                },
                {
                  translateY: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 25],
                  }),
                },
                {
                  scaleX: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 12],
                  }),
                },
                {
                  scaleY: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 12],
                  }),
                },
              ],
            }}
          />
        </View>
      )}
    </View>
  )
}
