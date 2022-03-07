import React, {useState, useEffect} from 'react'
import {View, Animated, Dimensions, Button, SafeAreaView} from 'react-native'
import {changeBarColors} from 'react-native-immersive-bars'

import CozyWebView from '../../components/webviews/CozyWebView'
import {Values} from '../../constants/values'
import {navBarColorEvent} from '../../libs/intents/setNavBarColor'
import {navbarHeight, statusBarHeight} from '../../libs/dimensions'
import {statusBarColorEvent} from '../../libs/intents/setStatusBarColor'

export const CozyAppScreen = ({route, navigation}) => {
  console.log('route', route)
  const [visible, setVisible] = useState(true)
  const [imageSize, setImageSize] = useState(new Animated.Value(0))
  const restartAnimation = () => {
    setImageSize(new Animated.Value(0))
    setAnimatedHeight(new Animated.Value(40))
    setAnimatedWidth(new Animated.Value(40))
    setAnimatedTop(new Animated.Value(clickX))
    setAnimatedLeft(new Animated.Value(clickY))
    setDisplayWebview(true)
    Animated.timing(webviewOpacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start()
  }
  useEffect(() => {
    Animated.timing(imageSize, {
      toValue: 1,
      duration: 10000,
      useNativeDriver: true,
    }).start()
  }, [imageSize])
  const clickX = route.params.event.x
  const clickY = route.params.event.y
  console.log('heught', Dimensions.get('window').height)
  console.log('width', Dimensions.get('window').width)
  const [animatedHeight, setAnimatedHeight] = useState(new Animated.Value(40))
  const [animatedWidth, setAnimatedWidth] = useState(new Animated.Value(40))
  const [animatedTop, setAnimatedTop] = useState(new Animated.Value(clickX))
  const [animatedLeft, setAnimatedLeft] = useState(new Animated.Value(clickY))
  const webviewOpacity = new Animated.Value(1)
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: Dimensions.get('window').height,
      duration: 1000,
      //  useNativeDriver: true,
    }).start()
    Animated.timing(animatedWidth, {
      toValue: Dimensions.get('window').width,
      duration: 1000,
      // useNativeDriver: true,
    }).start()
    Animated.timing(animatedTop, {
      toValue: 0,
      duration: 1000,
      //  useNativeDriver: true,
    }).start()
    Animated.timing(animatedLeft, {
      toValue: 0,
      duration: 1000,
      //useNativeDriver: true,
    }).start()
  }, [animatedHeight, animatedWidth, animatedTop, animatedLeft])
  const [displayWebview, setDisplayWebview] = useState(false)
  const [displayAnimationView, setDisplayAnimationView] = useState(true)
  useEffect(() => {
    setTimeout(() => {
      setDisplayWebview(true)
      Animated.timing(webviewOpacity, {
        toValue: 0,
        duration: 100,
        //  useNativeDriver: true,
      }).start()
    }, 1000)
  }, [webviewOpacity])
  useEffect(() => {
    setTimeout(() => {
      setDisplayAnimationView(false)
    }, 1100)
  }, [webviewOpacity])
  console.log('EVENT', route.params.event)

  const [statusBarColor, setStatusBarColor] = useState(
    Values.DEFAULT_STATUSBAR_COLOR,
  )
  const [navBarColor, setNavBarColor] = useState(Values.DEFAULT_NAVBAR_COLOR)

  useEffect(() => {
    changeBarColors(false)

    statusBarColorEvent.on('change', color => {
      setStatusBarColor(color)
    })

    navBarColorEvent.on('change', color => {
      setNavBarColor(color)
    })

    return () => {
      statusBarColorEvent.removeAllListeners()
      navBarColorEvent.removeAllListeners()
    }
  }, [])

  return (
    <View style={{flex: 1}}>
      <View
        style={{
          height: statusBarHeight,
          backgroundColor: statusBarColor,
        }}
      />

      <CozyWebView
        source={{uri: route.params.href}}
        navigation={navigation}
        logId="AppScreen"
        style={
          !displayWebview
            ? {
                top: 9999,
                left: 9999,
                opacity: 0,
                position: 'absolute',
              }
            : {opacity: 1, flex: 1}
        }
      />

      {/* {visible && ( */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          position: 'absolute',
          top: 50,
          left: 50,
          height: 50,
          width: 50,
          zIndex: 999,
        }}>
        <Button
          onPress={() => {
            //alert('test')
            restartAnimation()
          }}
          title="Start"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
      </View>

      {displayAnimationView && (
        <Animated.View
          style={{
            backgroundColor: '#FFFFFF',
            position: 'absolute',
            height: animatedHeight,
            width: animatedWidth,
            top: animatedTop,
            left: animatedLeft,
            paddingLeft: '20%',
            paddingRight: '20%',
            opacity: webviewOpacity,
          }}>
          <Animated.Image
            source={require('../../assets/bootsplash_logo.png')}
            useNativeDriver={true}
            resizeMode="contain"
            style={{
              // position: 'relative',
              //left: '40%',
              //top: '40%',
              //height: 40,
              height: '100%',
              width: '100%',
              /* transform: [
              {
                translateX: imageSize.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 128],
                }),
              },
              {
                translateY: imageSize.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 25],
                }),
              },
              {
                scaleX: imageSize.interpolate({
                  inputRange: [10, 100],
                  outputRange: [10, 100],
                }),
              },
              {
                scaleY: imageSize.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 12],
                }),
              },
            ], */
            }}
          />
        </Animated.View>
      )}
      <View
        style={{
          height: navbarHeight,
          backgroundColor: navBarColor,
        }}
      />
    </View>
  )
}
