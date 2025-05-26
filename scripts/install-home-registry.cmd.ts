import { installHomeRegistry } from './install-home-registry'

void installHomeRegistry(
  'https://apps-registry.cozycloud.cc/registry/home/beta/latest',
  [
    'android/app/src/main/assets/cozy-home/build',
    'ios/assets/resources/cozy-home/build'
  ]
)
