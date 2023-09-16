# White label configuration

White label configuration allows to build multiple versions of the app with customization on:
- Package id and app name
- Icons
- Splashscreens
- Notifications channels
- Universal links and schemes
- iOS Provisionning profiles
- Permissions
- etc

> **Warning**
> This documentation describes all shell commands using `<brand>` notation. This pattern should be replaced by the brand identifier before running any command 

## Nomenclature

- `White label`: Customization mechanism that allows to edit the app for multiple brands
- `Brand`: Identifier that represent one of the app's version (i.e. `cozy` or  `mabulle`)
- `Root project`: The project that can be compiled to run the app. It is composed by the `src/`, `android` and `ios` folder and by all other files necessary to build it. The `white_label` folder is not part of the `root project`, it is used to modify the `root project` to apply a brand
- `App name`: The name of the application as it appears on the OS' home screen
  - `CFBundleName`: iOS' nomenclature for `App name`
- `Bundle id`: The unique identifier of the application that is used by the OS and by the store
  - `Application id`: Android's nomenclature for `Bundle id`
  - `package_name`: `google-services.json` nomenclature for `Bundle id`
  - `packageName`: Android CI's nomenclature for `Bundle id`
  - `CFBundleIdentifier`: iOS' nomenclature for `Bundle id`
  - `Product bundle identifier`: iOS' PbxProj nomenclature for `Bundle id`

## Worfklow

Brand configurations are stored in the `white_label/brands` folder. This folder contains one subfolder for each brands we want to configure

A brand subfolder should contain up to 3 folders:
- `android`: every files in this folder will be copied in the root `android` folder
- `ios`: every files in this folder will be copied in the root `ios` folder
- `javascript`: every files in this folder will be copied in the root `src` folder

In addition to this folder, the `white_label/config.json` file is used to define project specific variables that should be propagated into root project files (ex: variables that should be injected in `Info.plist``)

## Android customizations

### App name and bundle id

- App name is specified in `white_label/brands/<brand_name>/android/app/src/main/res/values/strings.xml`
- Bundle id is specified in `white_label/brands/<brand_name>/android/app/brand.gradle`
  - :warning: `applicationId` should be synchronized whith `package_name` in `google-services.json` files

### Universal Links and Schemes
- UniverslLinks and Schemes are specified in `white_label/brands/<brand_name>/android/app/brand.gradle`

## iOS customizations

Note that `Info.plist` and `project.pbxproj` are not handled as other files
- It would be too difficult to maintain one version of those file for each brand
- Those file are modified directly by the configure-brand.ts script using `PlistBuddy` and regexes

### App name and bundle id

- App name is specified in `white_label/config.json`
- Bundle id specified in `white_label/config.json`

### Universal Links and Schemes
- UniverslLinks and Schemes are specified in `white_label/config.json`
- Provisionning profiles names are specified in `white_label/config.json`

## Javascript customizations

### Universal Links and Schemes

- UniverslLinks and Schemes are specified in `white_label/brands/<brand_name>/js/constants/strings.json`

## CI customizations

Each workflow now takes a `brand` parameter that allows to build/deploy the app for the specified brand

Each brand should have their dedicated secret in the form `xxx_SECRET_NAME` where `xxx` is the brand name

Brand specific secrets are:
- xxx_ANDROID_ALIAS
- xxx_ANDROID_KEY_PASSWORD
- xxx_ANDROID_KEY_STORE_PASSWORD
- xxx_ANDROID_SIGNING_KEY
- xxx_IOS_MOBILE_PROVISION_BASE64

## Assets generation

Some assets exist in multiple variants. For example on Android the Bootsplash logo exist in `hdpi`, `mdpi`, `xhdpi`, `xxhdpi`, and `xxxhdpi` version

Bootsplash may be generated using a reference asset and a command line to automatically create all variants:
- Call `yarn generate-boot-icon` (cf [documentation](https://github.com/zoontek/react-native-bootsplash#assets-generation))

The procedure to create the Bootsplash icons is described with more details in the [How to create a new Brand](#how-to-create-a-new-brand) section

# How to test configurations

Multiple scripts can be executed to test a brand configuration:
- `yarn brand:configure:<brand_name>`: apply the specified brand configuration to your working directory
  - :warning: this command will fail if there are pending git changes in your working directory. However you can bypass this limitation with the `--force` parameter (be careful)
- `yarn brand:check`: check that the `cozy` brand configuration is aligned with the root project
  - this will remind the developper if some of their change may be erased by the white label mechanisms
  - :warning: this command is executed by the CI on each PR

## How to create a new Brand

- Create the `white_label/brands/<brand_name>` folder
- Add new entry in `white_label/config.json` file
- On Apple side
  - Create 2 new identifiers in [Apple dev account/Identifiers](https://developer.apple.com/account/resources/identifiers/list)
    - Identifiers should be named `amiral-<brand>-ci-profile` and `amiral-<brand>-dev-profile`
  - Create 2 new profiles in [Apple dev account/Profiles](https://developer.apple.com/account/resources/profiles/list)
    - Profiles should be named `amiral-<brand>-ci-profile` and `amiral-<brand>-dev-profile`
    - Those profiles should refer previously created identifiers
    - The CI profile should be downloaded and stored in Github secrets as base64 with the name `<brand>_IOS_MOBILE_PROVISION_BASE64`
      - The following command can be used to get the base64 string `openssl base64 < amiral<brand>ciprofile.mobileprovision | tr -d '\n' | tee amiral<brand>ciprofile.base64.txt`
  - In [Appstore Connect](https://appstoreconnect.apple.com/apps) create a new app that refers previously created identifier
- On Android side
  - Create a new Signing Certificate using `keytool -genkey -v -keystore <brand>key.keystore -dname "cn=XXX, o=Cozy Cloud, c=FR" -alias <brand>key -keyalg RSA -keysize 2048 -validity 10950 -storepass <NEW_PASSWORD>` (Replace XXX by CEO's name)
    - This Certificate should be stored in Github secrets as base64 with the name `<brand>_ANDROID_SIGNING_KEY`
      - The following command can be used to get the base64 string `openssl base64 < <brand>key.keystore | tr -d '\n' | tee <brand>key.keystore.base64.txt`
    - This Certificate's passwords should be stored in Github secrets as plain text with the names `<brand>_ANDROID_KEY_PASSWORD` and `<brand>_ANDROID_KEY_STORE_PASSWORD`
    - This Certificate's alias should be stored in Github secrets as plain text with the name `<brand>_ANDROID_ALIAS`
    - Don't forget to save this Certificate and its corresponding password in the team's password store
      - `pass insert -fm app-amirale/Certificates/<brand>key.keystore < <brand>key.keystore`
      - `pass edit app-amirale/Certificates/<brand>key.keystore.txt` <- insert alias and password in this file
  - In [Google Play Console](https://play.google.com/console/u/0/developers/) create a new app for the new brand
- On Cozy-Stack side
  - Declare the new app in `cmd/serve.go` on our servers (do not override default configuration in the Github repository)
    - The `flagship-apk-certificate-digests` can be generated by copying the signing certificate's SHA-256 from the Google Play Console then by running following command `echo "<the SHA-256 fingerprint>" | xxd -r -p | base64`
      - :warning: This fingerprint is accessible only after the first APK upload (run the `Android Deploy` CI at least once)
    - More info on configuring Flagship certification can be found [here](https://github.com/cozy/cozy-flagship-app#how-to-enable-flagship-certification)
- Configure Firebase notifications
  - In the [Firebase Console](https://console.firebase.google.com/) open `cozy-flagship-app-push-prod` project
  - In the project settings
    - In the General tab, add a new Android App and a new Apple app for the new brand
    - In the Cloud Messaging tab, select the newly created Apple app and upload the team's `APNs Auth Key`
      - The `APNs Auth Key` can be found on the [Apple Developer Keys section](https://developer.apple.com/account/resources/authkeys/list) with the name `Firebase Push`
    - In the General tab, download the `google-services.json` for both Android and Apple apps
    - Put those files in `white_label/brands/<brand>/android/app/src/Prod/google-services.json` and `white_label/brands/<brand>/ios/Prod/GoogleService-Info.plist`
      - :warning: Compare those files with `cozy` and `mabulle` equivalents and homogenize them (i.e. remove `appinvite_service` section, set `IS_APPINVITE_ENABLED` to false etc.)
  - Repeat the operation for the `cozy-flagship-app-push-dev` project
- Configure Universal Links
  - Declare `.well-known` files in our Gitlab dedicated repository
- Generate the new app bootsplash
  - Put the app's icon SVG file in `white_label/brands/<brand>/build_assets/splashscreen.svg` and version it
  - Run the following script then commit all `white_label/**` created files, don't commit the ones on other folders. Also replace `297EF2` by the new brand's primary color in the `svg-convert` command
```sh
rsvg-convert -w 3000 white_label/brands/<brand>/build_assets/splashscreen.svg -o white_label/brands/<brand>/build_assets/splashscreen.png &&
yarn react-native generate-bootsplash white_label/brands/<brand>/build_assets/splashscreen.png --background-color=297EF2 --logo-width=160 --assets-path=src/assets --flavor=main &&
cp ./android/app/src/main/res/mipmap-hdpi/bootsplash_logo.png ./white_label/brands/<brand>/android/app/src/main/res/mipmap-hdpi/ &&
cp ./android/app/src/main/res/mipmap-mdpi/bootsplash_logo.png ./white_label/brands/<brand>/android/app/src/main/res/mipmap-mdpi/ &&
cp ./android/app/src/main/res/mipmap-xhdpi/bootsplash_logo.png ./white_label/brands/<brand>/android/app/src/main/res/mipmap-xhdpi/ &&
cp ./android/app/src/main/res/mipmap-xxhdpi/bootsplash_logo.png ./white_label/brands/<brand>/android/app/src/main/res/mipmap-xxhdpi/ &&
cp ./android/app/src/main/res/mipmap-xxxhdpi/bootsplash_logo.png ./white_label/brands/<brand>/android/app/src/main/res/mipmap-xxxhdpi/ &&
cp ./android/app/src/main/res/values/colors.xml ./white_label/brands/<brand>/android/app/src/main/res/values/ &&
cp ./ios/CozyReactNative/BootSplash.storyboard ./white_label/brands/<brand>/ios/CozyReactNative/ &&
cp ./ios/CozyReactNative/Images.xcassets/BootSplashLogo.imageset/bootsplash_logo.png ./white_label/brands/<brand>/ios/CozyReactNative/Images.xcassets/BootSplashLogo.imageset/ &&
cp ./ios/CozyReactNative/Images.xcassets/BootSplashLogo.imageset/bootsplash_logo@2x.png ./white_label/brands/<brand>/ios/CozyReactNative/Images.xcassets/BootSplashLogo.imageset/ &&
cp ./ios/CozyReactNative/Images.xcassets/BootSplashLogo.imageset/bootsplash_logo@3x.png ./white_label/brands/<brand>/ios/CozyReactNative/Images.xcassets/BootSplashLogo.imageset/ &&
cp ./src/assets/bootsplash_logo.png ./white_label/brands/<brand>/js/assets/ &&
cp ./src/assets/bootsplash_logo@1,5x.png ./white_label/brands/<brand>/js/assets/ &&
cp ./src/assets/bootsplash_logo@2x.png ./white_label/brands/<brand>/js/assets/ &&
cp ./src/assets/bootsplash_logo@3x.png ./white_label/brands/<brand>/js/assets/ &&
cp ./src/assets/bootsplash_logo@4x.png ./white_label/brands/<brand>/js/assets/
```
- Add an entry in the `brand` input for each CI workflow
- Use a diff tool between `white_label/brands/cozy` and `white_label/brands/mabulle` folders to check existence of files that are not documented here

## To be improved

The following tasks may improve the way we handle white labels and should be done in the future:

- [ ] Generate `brand.gradle` from the `white_label/config.json` so we have a single source of truth for package id and app name
- [ ] Add support for templating in all `white_label/brands/<brand_name>` files so we have a singlesource of thruth for universal links and schemes
  - This will have impact on the `yarn brand:check` that would need to apply template before comparing files contents
- [ ] Add a script to automatically generate a brand folder given a name, package_id and some SVG assets
  - For example this should call `yarn generate-boot-icon` to generate all assets' variants