import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import { ErrorScreen } from '/app/view/Error/ErrorScreen'
import { CozyAppScreen } from '/screens/cozy-app/CozyAppScreen'
import { CreateInstanceScreen } from '/screens/login/CreateInstanceScreen'
import { HomeScreen } from '/screens/home/HomeScreen'
import { LockScreen } from '/app/view/Lock/LockScreen'
import { LoginScreen } from '/screens/login/LoginScreen'
import { ManagerScreen } from '/app/view/Manager/ManagerScreen'
import { OnboardingScreen } from '/screens/login/OnboardingScreen'
import { WelcomeScreen } from '/screens/welcome/WelcomeScreen'
import { routes } from '/constants/routes'
import { OsReceiveScreen } from '/app/view/OsReceive/OsReceiveScreen'

const Root = createStackNavigator()
const Stack = createStackNavigator()

const MainAppNavigator = ({ initialRoute }) => (
  <Root.Navigator
    initialRouteName={routes.default}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen
      name={routes.default}
      component={HomeScreen}
      initialParams={initialRoute.params}
    />
  </Root.Navigator>
)

export const RootNavigator = ({ initialRoute, setClient }) => (
  <Root.Navigator
    initialRouteName={initialRoute.route}
    screenOptions={{ headerShown: false }}
  >
    {/*
    We embed routes.home into its own Navigator so we prevent initialParams
    to be re-applied when calling goBack() from the CozyApp route
    i.e:
    - We open the app with a deeplink https://links.mycozy.cloud/flagship/drive/?fallback=http://drive.cozy.tools:8080/
    - routes.home is called with {initialParams:{cozyAppFallbackURL: 'http://drive.cozy.tools:8080/'}}
    - routes.home reads initialParams and redirects to routes.cozyapp
    - user press the back button so the app redirects to routes.home
    - routes.home SHOULD NOT read initialParams and SHOULD NOT redirect to routes.cozyapp
    */}
    <Root.Screen name={routes.home}>
      {params => <MainAppNavigator initialRoute={initialRoute} {...params} />}
    </Root.Screen>

    <Stack.Screen
      name={routes.authenticate}
      initialParams={initialRoute.params}
    >
      {params => <LoginScreen setClient={setClient} {...params} />}
    </Stack.Screen>

    <Stack.Screen name={routes.manager} initialParams={initialRoute.params}>
      {params => <ManagerScreen {...params} />}
    </Stack.Screen>

    <Stack.Screen name={routes.onboarding} initialParams={initialRoute.params}>
      {params => <OnboardingScreen setClient={setClient} {...params} />}
    </Stack.Screen>

    <Stack.Screen
      name={routes.instanceCreation}
      initialParams={initialRoute.params}
    >
      {params => <CreateInstanceScreen {...params} />}
    </Stack.Screen>

    <Stack.Screen name={routes.welcome}>
      {params => <WelcomeScreen setClient={setClient} {...params} />}
    </Stack.Screen>

    <Root.Screen
      name={routes.error}
      component={ErrorScreen}
      initialParams={{ type: initialRoute.root }}
    />

    <Root.Screen
      name={routes.osReceive}
      component={OsReceiveScreen}
      options={{
        presentation: 'transparentModal',
        animation: 'none'
      }}
    />

    <Root.Screen
      name={routes.cozyapp}
      component={CozyAppScreen}
      options={{
        presentation: 'transparentModal',
        animation: 'none'
      }}
    />

    <Root.Screen
      name={routes.lock}
      component={LockScreen}
      options={{
        presentation: 'transparentModal',
        animation: 'none'
      }}
    />
  </Root.Navigator>
)

RootNavigator.displayName = 'RootNavigator'
