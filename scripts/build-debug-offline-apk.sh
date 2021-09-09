set -x

# source :
# https://dev.to/shubhkirtisharma/building-serverless-or-debug-apk-for-react-native-apps-356m

cd `git rev-parse --show-toplevel`

mkdir -p android/app/src/main/assets

react-native bundle --platform android --dev false --entry-file src/index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

curl "http://localhost:8081/index.bundle?platform=android" -o "android/app/src/main/assets/index.android.bundle"

cd android && ./gradlew clean assembleDebug

cd ..

echo Done.
echo Result : $PWD/android/app/build/outputs/apk/debug/app-debug.apk

