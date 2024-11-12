// eslint-disable-next-line import/order
import 'react-native-get-random-values'

import HttpPouch from 'pouchdb-adapter-http'
import SQLiteAdapter from 'pouchdb-adapter-react-native-sqlite'
import PouchDB from 'pouchdb-core'
import PouchDBFind from 'pouchdb-find'
import mapreduce from 'pouchdb-mapreduce'
import replication from 'pouchdb-replication'

export default PouchDB.plugin(HttpPouch)
  .plugin(PouchDBFind)
  .plugin(replication)
  .plugin(mapreduce)
  .plugin(SQLiteAdapter)
