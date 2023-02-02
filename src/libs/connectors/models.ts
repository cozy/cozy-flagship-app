export interface LauncherContextValue {
  connector: Connector
  account: Account
  trigger: Trigger
  job: Job
}

interface Account {
  id: string
  _id: string
  _type: string
  _rev: string
  account_type: string
  auth: Auth
  cozyMetadata: CozyMetadata
  state: null
}

type Auth = Record<string, unknown>

interface CozyMetadata {
  createdAt: Date
  createdByApp: string
  doctypeVersion: string
  metadataVersion: number
  updatedAt: Date
  updatedByApps?: UpdatedByApp[]
}

interface UpdatedByApp {
  date: Date
  slug?: string
}

interface Connector {
  type: string
  id?: string
  attributes?: Connector
  meta?: Meta
  links?: ConnectorLinks
  categories: string[]
  checksum: string
  clientSide: boolean
  created_at: Date
  editor: string
  fields: Auth
  folders: Folder[]
  icon: string
  langs: string[]
  language: string
  locales: Locales
  name: string
  permissions: ConnectorPermissions
  slug: string
  source: string
  state: string
  updated_at: Date
  vendor_link: string
  version: string
  _type?: string
  triggers?: Triggers
}

interface Folder {
  defaultDir: string
}

interface ConnectorLinks {
  self: string
  icon: string
  permissions: string
}

interface Locales {
  fr: Fr
}

interface Fr {
  long_description: string
  permissions: FrPermissions
  short_description: string
}

interface FrPermissions {
  bills: PurpleBills
  files: PurpleBills
}

interface PurpleBills {
  description: string
}

interface Meta {
  rev: string
}

interface ConnectorPermissions {
  bills: FluffyBills
  files: FluffyBills
}

interface FluffyBills {
  type: string
}

interface Triggers {
  data: Datum[]
}

interface Datum {
  type: TypeEnum
  id: string
  attributes: DatumAttributes
  meta: Auth
  links: DatumLinks
  _id: string
  _rev: string
  domain: string
  prefix: string
  worker: Worker
  arguments: string
  debounce: string
  options: null
  message: DatumMessage
  current_state: CurrentState
  cozyMetadata: CozyMetadata
  _type: Type
}

enum Type {
  IoCozyTriggers = 'io.cozy.triggers'
}

interface DatumAttributes {
  _id: string
  _rev: string
  domain: string
  prefix: string
  type: TypeEnum
  worker: Worker
  arguments: string
  debounce: string
  options: null
  message: DatumMessage
  current_state: CurrentState
  cozyMetadata: CozyMetadata
}

interface CurrentState {
  trigger_id: string
  status: Stat
  last_execution: Date
  last_executed_job_id: string
  last_failure?: Date
  last_failed_job_id?: string
  last_error?: string
  last_manual_execution: Date
  last_manual_job_id: string
  last_success?: Date
  last_successful_job_id?: string
}

enum Stat {
  Done = 'done',
  Errored = 'errored',
  Running = 'running'
}

interface DatumMessage {
  account: string
  konnector: string
  folder_to_save?: string
}

enum TypeEnum {
  Client = '@client'
}

enum Worker {
  Client = 'client'
}

interface DatumLinks {
  self: string
}

interface Job {
  type: string
  id: string
  attributes: JobAttributes
  meta: Meta
  links: DatumLinks
  _id: string
  _type: string
  _rev: string
  domain: string
  prefix: string
  worker: Worker
  trigger_id: string
  message: JobMessage
  event: null
  manual_execution: boolean
  state: Stat
  queued_at: Date
  started_at: Date
  finished_at: Date
}

interface JobAttributes {
  _id: string
  _rev: string
  domain: string
  prefix: string
  worker: Worker
  trigger_id: string
  message: JobMessage
  event: null
  manual_execution: boolean
  state: Stat
  queued_at: Date
  started_at: Date
  finished_at: Date
}

interface JobMessage {
  account: string
  konnector: string
}

interface Trigger {
  type: TypeEnum
  id: string
  attributes: TriggerAttributes
  meta: Auth
  links: DatumLinks
  _id: string
  _rev: string
  domain: string
  prefix: string
  worker: Worker
  arguments: string
  debounce: string
  options: null
  message: JobMessage
  current_state: CurrentState
  cozyMetadata: CozyMetadata
  _type: Type
}

interface TriggerAttributes {
  _id: string
  _rev: string
  domain: string
  prefix: string
  type: TypeEnum
  worker: Worker
  arguments: string
  debounce: string
  options: null
  message: JobMessage
  current_state: CurrentState
  cozyMetadata: CozyMetadata
}

export interface LauncherContext {
  state: 'default' | 'launch'
  value?: LauncherContextValue
}
