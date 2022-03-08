import React, {useState, useEffect} from 'react'
import {View, Animated, Dimensions, Button, SafeAreaView, Text, Image} from 'react-native'
import {changeBarColors} from 'react-native-immersive-bars'

import CozyWebView from '../../components/webviews/CozyWebView'
import {Values} from '../../constants/values'
import {navBarColorEvent} from '../../libs/intents/setNavBarColor'
import {navbarHeight, statusBarHeight} from '../../libs/dimensions'
import {statusBarColorEvent} from '../../libs/intents/setStatusBarColor'

import ContactsIcon from '../../assets/apps/contacts.svg';
import DriveIcon from '../../assets/apps/drive.svg';
import MespapiersIcon from '../../assets/apps/mespapiers.svg';
import SettingsIcon from '../../assets/apps/settings.svg';
import NotesIcon from '../../assets/apps/notes.svg';
import StoreIcon from '../../assets/apps/store.svg';

const appsIcon = {
    drive : DriveIcon,
    contacts: ContactsIcon,
    mespapiers: MespapiersIcon,
    settings: SettingsIcon,
    notes: NotesIcon,
    store: StoreIcon
}



export const CozyAppScreen = ({route, navigation}) => {
  console.log('route', route)
  const appslug = route.params.app.slug
    const ImgApp = appsIcon[appslug]

  const [visible, setVisible] = useState(true)

  const clickX = route.params.event.x
  const clickY = route.params.event.y
  console.log('clickX', clickX)
  console.log('clicjY', clickY)
  console.log('heught', Dimensions.get('window').height)
  console.log('width', Dimensions.get('window').width)

  const [displayWebview, setDisplayWebview] = useState(false)
  const [displayAnimationView, setDisplayAnimationView] = useState(true)
  const scaleAnimation = new Animated.Value(0)
  const displayAnimationViewOpacity = new Animated.Value(1)

  const imgSize = new Animated.Value(40)
  useEffect(() => {
    Animated.timing(imgSize, {
      toValue: 128,
      duration: 300,
      //easing: Easing.ease,
      //useNativeDriver: true,
    }).start()
  }, [])
  useEffect(() => {
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: 800,
      //easing: Easing.ease,
      useNativeDriver: true,
    }).start()
  }, [])
  
  useEffect(() => {
    Animated.timing(displayAnimationViewOpacity, {
      toValue: 0,
      duration: 900,
      //easing: Easing.ease,
      useNativeDriver: true,
    }).start()
  }, [])
  useEffect(() => {
    setTimeout(() => {
      setDisplayWebview(true)
    }, 800)
  }, [])
  useEffect(() => {
    setTimeout(() => {
      setDisplayAnimationView(false)
    }, 800)
  }, [])
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
      {!displayAnimationView && (
        <View
          style={{
            height: statusBarHeight,
            backgroundColor: statusBarColor,
          }}
        />
      )}

      <CozyWebView
        source={{uri: route.params.href}}
        navigation={navigation}
        route={route}
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

      {/* displayAnimationView */ true  && (
        <Animated.View
          style={{
            backgroundColor: '#FFFFFF',
            position: 'absolute',
            height: 40,
            width: 40,
            zIndex: 99999,
            top: clickX,
            left: clickY,
            
            opacity: 1,
            //opacity: displayAnimationViewOpacity,
            transform: [
              {
                translateX: scaleAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    0,
                    (Dimensions.get('window').width - 40) / 2 - clickY,
                  ],
                }),
              },
              {
                translateY: scaleAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    0,
                    (Dimensions.get('window').height - 40) / 2 - clickX,
                  ],
                }),
              },
              {
                scaleX: scaleAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, Dimensions.get('window').width / 45],
                }),
              },
              {
                scaleY: scaleAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, Dimensions.get('window').height / 45],
                }),
              },
            ],
          }}>
          {/*<View style={{backgroundColor: "#FFFFFF", flex: 1,  alignItems: "center", justifyContent: "center", paddingLeft: "20%"}}>*/}
          {/*  {ImgApp && <ImgApp /> } */}
          <Text>Toto</Text>
           {<Animated.Image source={require('../../assets/apps/drive.png')} style={{width: 100, height: 100}} resizeMode="center"
              //resizeMode="contain"
             
          />} 
          
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
