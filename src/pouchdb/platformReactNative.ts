import { events } from '/pouchdb/platformReactNative.events'
import { isOnline } from '/pouchdb/platformReactNative.isOnline'
import { storage } from '/pouchdb/platformReactNative.storage'
import PouchDB from '/pouchdb/pouchdb'

export const platformReactNative = {
  storage,
  events,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  pouchAdapter: PouchDB,
  isOnline
}
