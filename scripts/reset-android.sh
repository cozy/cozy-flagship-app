rm -rf $HOME/.gradle/caches/
cd android && ./gradlew clean && ./gradlew cleanBuildCache
rm -rf app/src/main/assets/cozy-home
cd ..
rm -rf node_modules
yarn cache clean --force
yarn install
