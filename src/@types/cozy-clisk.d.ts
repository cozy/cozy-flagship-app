/* eslint-disable @typescript-eslint/no-unused-vars */
declare module 'cozy-clisk' {
  export class LauncherBridge {
    constructor(options: object)
    init(options: object)
  }
  export class ContentScriptMessenger {
    constructor(options: object)
    postMessage(message: string)
    addMessageListener(listener: function): function
  }
  export const addData: (
    entries: object[],
    doctype: string,
    options: object
  ) => Promise<object[]>
  export const hydrateAndFilter: (
    documents: object[],
    doctype: string,
    options: object
  ) => Promise<object[]>
  export const saveFiles: (
    client: object,
    entries: object[],
    folderPath: string,
    options: object
  ) => Promise<object[]>
  export const saveBills: (
    entries: object[],
    options: object
  ) => Promise<object[]>
  export const saveIdentity: (
    contractOrIdentity: object,
    accountIdentifier: string | null | undefined,
    options: object
  ) => Promise<void>
  export const updateOrCreate: (
    entries: object[],
    doctype: string,
    matchingAttributes: string[],
    options: object
  ) => Promise<object>
}
