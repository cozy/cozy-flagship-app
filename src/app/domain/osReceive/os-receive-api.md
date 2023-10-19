# OsReceive API

When a document is shared with the Flagship app, the user can chose which cozy-app will receive the file.

When doing so, the selected cozy-app is opened using its declared `route_to_upload` route, and the cozy-app will be able to handle the received file using the OsReceive API.

This API can be consumed using [cozy-intent](https://github.com/cozy/cozy-libs/tree/master/packages/cozy-intent).

In order to use the OsReceive API the cozy-app needs to declare being able to receive files in its manifest. The manifest content is documented [here](https://docs.cozy.io/en/cozy-stack/accept-from-flagship/)

## API description

### `hasFilesToHandle` method

`hasFilesToHandle` method can be used by the cozy-app to check if files should be received.

When files should be received this methods returns a list of files that are waiting to be uploaded to the Cozy, or that are currently being uploaded.

This list can be used to display the Upload queue when the upload is processed on the Flagship app side. In order to get the list of files to be handled, please prefer the `getFilesToHandle` method. 

Method signature:
```ts
hasFilesToHandle(): Promise<UploadStatus>
```

### `getFilesToHandle` method

`getFilesToHandle` method can be used by the cozy-app to retrieve the list of files that should be received.

This list can be filed with files `names` or `base64` based on the `base64: boolean` parameter.

If the apps need to access the files content before uploading it to the Cozy, then passing `base64: true` parameter should be used. This will allow to receive the files content as base64 in the `getFilesToHandle` anwser.

Otherwise, passing `base64: false` will allow to receive only files metadata. The the cozy-app will have to call `uploadFiles` to trigger the files upload on the Flagship app side

Method signature:
```ts
getFilesToHandle(base64: boolean): Promise<OsReceiveFile[]>

interface OsReceiveFile {
  name: string
  file: ReceivedFile
  status: OsReceiveFileStatus
  handledTimestamp?: number // Unix timestamp representing when the file was handled
  source?: string // base64 of the file content
  type?: string // mimetype of the file
}
```

### `uploadFiles` method

`uploadFiles` method can be used by the cozy-app to trigger a file upload on the Flagship app side.

This methods get a file metadata as parameter. This should contain file's name, upload path, and a conflict strategy.

```ts
uploadFiles(fileOptions: JsonString): Promise<void>

interface FileOptions {
  fileOptions: {
    name: string,
    dirId: string,
    conflictStrategy: 'rename'
  }
}
```

### `resetFilesToHandle` method

`resetFilesToHandle` method can be used to clear the list of shared files.

This should be called after the files upload being done by the cozy-app (using base64)

```ts
resetFilesToHandle(): Promise<boolean>
```

### `cancelUploadByCozyApp` method


`cancelUploadByCozyApp` method can be used to close the cozy-app and come back to the list of elligible apps.

This should be called when the user clicks on the back button or cancel the upload from the cozy-app

```ts
cancelUploadByCozyApp(): Promise<boolean>
```
