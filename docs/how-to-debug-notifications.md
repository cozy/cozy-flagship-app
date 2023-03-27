# How to debug notifications

To try notifications, you will need a Firebase project id (to target the good environment), a Firebase Cloud Messaging (FCM) token (to target the good device), an oauth token (to be allowed to send notifications) and a REST client.

## About Firebase projects

Two Firebase projects have been created, one for development environnement (_cozy-flagship-app-push-dev_) and one for production environment (_cozy-flagship-app-push-prod_). These projects are automatically linked to the app build.

**Android (based on flavors)**

 - `yarn android --variant=devDebug` -> _cozy-flagship-app-push-dev_ and app in debug
 - `yarn android --variant=prodDebug` -> _cozy-flagship-app-push-prod_ and app in debug
 - `yarn android --variant=devRelease` -> _cozy-flagship-app-push-dev_ and app in release
 - `yarn android --variant=prodRelease` -> _cozy-flagship-app-push-prod_ and app in release

To build `devRelease` or `prodRelease` locally, you may need to uncomment `signingConfig` in _android/app/build.gradle_.

**iOS (based on targets)**

 - Target CozyReactNativeDev -> _cozy-flagship-app-push-dev_
 - Target CozyReactNative -> _cozy-flagship-app-push-prod_

If you want to connect to a dev cozy, you will need to build the app with _cozy-flagship-app-push-dev_.
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
      "redirectLink": "contacts/#/new" // the link to open when you click on the notification
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
  "redirectLink": "contacts/#/new" // the link to open when you click on the notification
}
```
