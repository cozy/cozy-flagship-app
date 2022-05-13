# 0.0.11

## ✨ Features


## 🐛 Bug Fixes


## 🔧 Tech


# 0.0.10

## ✨ Features

* Add a Welcome page ([PR #209](https://github.com/cozy/cozy-pass-mobile/pull/209) and [PR #217](https://github.com/cozy/cozy-pass-mobile/pull/217))

## 🐛 Bug Fixes

* Intercept clicks on mailto:, tel:, maps:, geo:, sms: to prevent error  ([PR #180](https://github.com/cozy/cozy-pass-mobile/pull/180) and [PR #213](https://github.com/cozy/cozy-pass-mobile/pull/213))
* Improve Post-me stability when browsing between cozy-apps ([PR #212](https://github.com/cozy/cozy-pass-mobile/pull/212))
* Display splash screen during loading steps  ([PR #214](https://github.com/cozy/cozy-pass-mobile/pull/214))
* Fix Navbar height calculation ([PR #215](https://github.com/cozy/cozy-pass-mobile/pull/215))
* Prevent GoBack after logout  ([PR #218](https://github.com/cozy/cozy-pass-mobile/pull/218))
* Add a safe area on login, onboarding and error screens ([PR #223](https://github.com/cozy/cozy-pass-mobile/pull/223))
* Redirect to the correct screen when the device retrieves Internet connection ([PR #224](https://github.com/cozy/cozy-pass-mobile/pull/224))

## 🔧 Tech

* Add JSX support in Jest configuration ([PR #210](https://github.com/cozy/cozy-pass-mobile/pull/210))

# 0.0.9

## ✨ Features

* The app now displays an Offline screen when no connection is available ([PR #180](https://github.com/cozy/cozy-pass-mobile/pull/180) and [PR #189](https://github.com/cozy/cozy-pass-mobile/pull/189))
* Intercept redirection/reloading and refresh only WebView ([PR #187](https://github.com/cozy/cozy-react-native/pull/187))
* The app now displays a NotFound screen when the entered Cozy url is not valid ([PR #197](https://github.com/cozy/cozy-react-native/pull/197))

## 🐛 Bug Fixes

* Prevent crash during the animated transition after login ([PR #205](https://github.com/cozy/cozy-pass-mobile/pull/205))

## 🔧 Tech

* Fix Android's Back button listener that would produce a memory leak ([PR #196](https://github.com/cozy/cozy-pass-mobile/pull/196))

# 0.0.8

## ✨ Features

* show/hide InApp Browser on cozy-intent call ([PR #179](https://github.com/cozy/cozy-pass-mobile/pull/179))

## 🐛 Bug Fixes

* Force the instance to be lowercase after validating ClouderyView ([PR #169](https://github.com/cozy/cozy-pass-mobile/pull/169))
* Prevent crash during the animated transition after login ([PR #178](https://github.com/cozy/cozy-pass-mobile/pull/178))
* Disable zoom on weviews ([PR #176](https://github.com/cozy/cozy-pass-mobile/pull/176))
* Set a background color to ClouderyWebview ([PR #176](https://github.com/cozy/cozy-pass-mobile/pull/176))
* Fix possible cases of failed handshake preventing webview apps to communicate with the native code ([PR #168](https://github.com/cozy/cozy-pass-mobile/pull/168))

## 🔧 Tech

* Improve webview env injection ([PR #167](https://github.com/cozy/cozy-pass-mobile/pull/167))

# 0.0.7

## ✨ Features

* Handle back navigation on CozyWebView ([PR #140](https://github.com/cozy/cozy-pass-mobile/pull/140))

## 🐛 Bug Fixes

* Don't reset password on bad password ([PR #157](https://github.com/cozy/cozy-pass-mobile/pull/157))

## 🔧 Tech

* Improve debug logs ([PR #150](https://github.com/cozy/cozy-react-native/pull/150) and [PR #154](https://github.com/cozy/cozy-react-native/pull/154) and [PR #161](https://github.com/cozy/cozy-react-native/pull/161))
* Improve linting ([PR #151](https://github.com/cozy/cozy-react-native/pull/151))
* Add Prettier config ([PR #153](https://github.com/cozy/cozy-react-native/pull/153))
* Improve tests tooling ([PR #155](https://github.com/cozy/cozy-react-native/pull/155))
* Improve tests coverage ([PR #156](https://github.com/cozy/cozy-react-native/pull/156))
* Run Test coverage only on CI ([PR #159](https://github.com/cozy/cozy-react-native/pull/159))
* Clear automatically all mocks after each tests ([PR #160](https://github.com/cozy/cozy-react-native/pull/160))
* Add Sentry tracking ([PR #51](https://github.com/cozy/cozy-react-native/pull/51) and [PR #163](https://github.com/cozy/cozy-react-native/pull/163) and [PR #164](https://github.com/cozy/cozy-react-native/pull/164))

# 0.0.1 to 0.0.6

## ✨ Features


## 🐛 Bug Fixes


## 🔧 Tech

* Add dependabot configuration
* Move android Main files inside correct path for react-native link usage
* Remove unused library @react-native-community/masked-view
