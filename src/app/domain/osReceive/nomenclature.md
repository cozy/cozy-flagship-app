## Files used in this feature

### Services 
* OsReceiveApi: provides methods for cozy-intent in order to communicate with a webapp, both input and output. It is closely linked to the OsReceiveState
* OsReceiveData: low-level service that will handle incoming files from Native OS
* OsReceiveNetwork: provides methods to communicate with cozy-stack, namely to get cozy-apps manifests and to upload files
* OsReceiveStatus: detects how the app was opened or resumed, eg. with or without a file to upload. It is necessary to have this check before receiving the actual files because it's much faster and we want to react to it as soon as possible

### Components
* OsReceiveProvider: main component that handles and orchestrates the whole feature, linking low-level services to native views and webapp views. It is heavily state based (useReducer) and reacts to events in a crucial way for the user flow
* OsReceiveScreen: functional view that displays available apps to share to and redirect to the correct webapp. Currently auto redirect to drive
* OsReceiveState: handles all the state of the feature (that is injected into OsReceiveProvider), and provide various values and dispatch types. It is a very important file in terms of architecture and should be read carefully
* useOsReceiveApi: simple hook that listens to local state and will call webview methods when needed, eg. when a file has been uploaded or failed to upload