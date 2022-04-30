Objectif de la session :
- ☑️ Tester au moins un composant (soit Login, soit Onboarding, qui contient une Webview). Ex : PasswordWebview
- 1/2 trouver comment tester un tel composant
- 1/2 définir quelle stratégie de test utilisée ? unitaire ? ou pas ?
- 1/2 qu'est-ce qui fait sens d'être testé ou pas ?

On souhaite décider comment on va tester.

☑️ Pour cela, on va rendre le CryptoWebview.
☑️ Et on va lire son snapshot.
Puis intéragir
  
### Premier test
☑️ Vérifier qu'au mount, le component subscribe au crypto script

### Second test
☑️ Vérifier qu'au unmount, le component unsubscribe au crypto script

### sendAnswer
Vérifier qu'on a sendAnswer avec la bonne value au onMessage WebView

  - ☑️ option 1: mocker reactnative-webview manuellement pour que quand il reçoit postMessage il appelle dans la foulée onMessage
  - option 2: mocker reactnative-webview avec Ersatz et voir comment il fonctionne

FIN MOB 1
______

MOB 2 :
Objectif :
- ☑️ mocker reactnative-webview avec Ersatz et voir comment le test "sendAnswer" CryptoWebview fonctionne
- trouver un moyen de tester l'injection des scripts javascript (ou pas)
- finir de trouver comment tester un composant dont la logique est dans sa Webview (CryptoWebview)
- continuer de définir quelle stratégie de test utilisée ? unitaire ? ou pas ?
- continuer de définir qu'est-ce qui fait sens d'être testé ou pas ?

Autres idées d'objectif :
- Vérification du podfile avant le merge
- Comment simuler le fait que la WebView appelle un évenement (events avec callback)
- Comment éviter les breaking change cozy-intent
- Refacto le LoginScreen
- Refacto l'organisation du dossier libs

Objectif de la session :
- mocker react-native-webview avec Ersatz et voir comment le test "sendAnswer" CryptoWebview fonctionne
  - la library ersatz n'est plus mise à jour et n'implémente pas suffisamment l'API WebView
