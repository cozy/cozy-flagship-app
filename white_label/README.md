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
- xxx_ANDROID_SIGNING_KEY
- xxx_ANDROID_ALIAS
- xxx_ANDROID_KEY_STORE_PASSWORD
- xxx_ANDROID_KEY_PASSWORD
- xxx_ANDROID_SIGNING_KEY
- xxx_ANDROID_ALIAS
- xxx_ANDROID_KEY_STORE_PASSWORD
- xxx_ANDROID_KEY_PASSWORD
- xxx_IOS_MOBILE_PROVISION_BASE64

## Assets generation

Some assets exist in multiple variants. For example on Android the SplashScreen logo exist in `hdpi`, `mdpi`, `xhdpi`, `xxhdpi`, and `xxxhdpi` version

Those may be generated using a reference asset and a command line to automatically create all variants:
- Call `yarn generate-boot-icon` (cf [documentation](https://github.com/zoontek/react-native-bootsplash#assets-generation))

# How to test configurations

Multiple scripts can be executed to test a brand configuration:
- `yarn brand:configure:<brand_name>`: apply the specified brand configuration to your working directory
  - :warning: this command will fail if there are pending git changes in your working directory. However you can bypass this limitation with the `--force` parameter (be careful)
- `yarn brand:check`: check that the `cozy` brand configuration is aligned with the root project
  - this will remind the developper if some of their change may be erased by the white label mechanisms
  - :warning: this command is executed by the CI on each PR

## To be improved

The following tasks may improve the way we handle white labels and should be done in the future:

- [ ] Generate `brand.gradle` from the `white_label/config.json` so we have a single source of truth for package id and app name
- [ ] Add support for templating in all `white_label/brands/<brand_name>` files so we have a singlesource of thruth for universal links and schemes
  - This will have impact on the `yarn brand:check` that would need to apply template before comparing files contents
- [ ] Add a script to automatically generate a brand folder given a name, package_id and some SVG assets
  - For example this should call `yarn generate-boot-icon` to generate all assets' variants