# How to debug notifications

To try notifications, you will need a Firebase project id (to target the good environment), a Firebase Cloud Messaging (FCM) token (to target the good device), an oauth token (to be allowed to send notifications) and a REST client.

## About Firebase projects

Two Firebase projects have been created, one for development environnement (_cozy-flagship-app-push-dev_) and one for production environment (_cozy-flagship-app-push-prod_). These projects are automatically linked to the app build.

Android

`yarn android` -> _cozy-flagship-app-push-dev_
`yarn android --variant=release` -> _cozy-flagship-app-push-prod_

iOS

Target CozyReactNativeDev -> _cozy-flagship-app-push-dev_
Target CozyReactNative -> _cozy-flagship-app-push-prod_

If you want to connect to a local stack or to a cozy dev or cozy int environment, you will need to build the app with _cozy-flagship-app-push-dev_.
If you want to connect to a prod cozy, you will need to build the app with _cozy-flagship-app-push-prod_.

## Get Firebase project id

Normally, you know which Firebase project is loaded when building the app. But if you want to check, you can use the following code.

```
// App.js
import { utils } from '@react-native-firebase/app'

console.log(utils()._app._options.projectId) // cozy-flagship-app-push-dev or cozy-flagship-app-push-prod
```

## Get FCM token

```
// App.js
import messaging from '@react-native-firebase/messaging'

const checkToken = async () => {
  const fcmToken = await messaging().getToken()
  if (fcmToken) {
    console.log(`fcmToken : ${fcmToken}`)
  }
}
checkToken()
```

## Send a notification (Android physical, Android emulator, iOS physical)

To get an oauth token, check the Google OAuth Playground. [More information](https://blog.mestwin.net/send-your-test-fcm-push-notification-quickly-with-curl/). You can then send post requests to trigger notifications.

```
POST https://fcm.googleapis.com/v1/projects/<Firebase project id>/messages:send

HEADERS
Authorization Bearer <oauth token>
Content-Type application/json

BODY
{
  "message": {
    "token": "<FCM token>",
    "notification": {
      "title": "Titre",
      "body": "Description"
    },
    "data": {
      "url": "new",
      "slug": "contacts",
      "appName": "contacts",
      "pathname": "/"
    }
  }
}
```

## Send a notification (iOS simulator)

You can drag'n'drop on the iOS simulator a file called _test.apns_ with the content below :
```

{
  "Simulator Target Bundle": "io.cozy.flagship.mobile",
  "aps": {
    "badge": 0,
    "alert": {
      "title": "Titre",
      "body": "Description",
      "sound": "default"
    }
  },
  "gcm.message_id": "123",
  "url": "new",
  "slug": "contacts",
  "appName": "contacts",
  "pathname": "/"
}
```
