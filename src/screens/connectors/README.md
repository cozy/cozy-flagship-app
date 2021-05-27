## Client Side Connectors

At the moment, this needs a little bit of setup to work:

1. The empty oui.sncf client needs to be installed on the cozy : git://github.com/konnectors/cozy-konnector-template.git#build-debug

It has empty fields and just the minimum of code to be viable and the manifest has the client_side
attribute.

cozy-stack konnectors install sncfempty git://github.com/konnectors/cozy-konnector-template.git#build-debug

2. A specific home with a modified harvest from branch https://github.com/cozy/cozy-libs/tree/feat/react-native-launcher needs to be also installed on
   the targeted cozy

cozy-stack apps update home git://github.com/doubleface/cozy-collect.git#build-debug
