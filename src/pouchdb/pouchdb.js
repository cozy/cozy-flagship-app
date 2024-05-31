// eslint-disable-next-line import/order
import 'react-native-get-random-values'

import HttpPouch from 'pouchdb-adapter-http'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite'
import PouchDB from 'pouchdb-core'
import PouchDBFind from 'pouchdb-find'
import mapreduce from 'pouchdb-mapreduce'
import replication from 'pouchdb-replication'
import WebSQLite from 'react-native-quick-websql'

const SQLiteAdapter = SQLiteAdapterFactory(WebSQLite)

export default PouchDB.plugin(HttpPouch)
  .plugin(PouchDBFind)
  .plugin(replication)
  .plugin(mapreduce)
  .plugin(SQLiteAdapter)
