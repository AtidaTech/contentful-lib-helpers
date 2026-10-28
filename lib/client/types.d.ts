/** Helper-owned data and method contracts; no dependency on retired SDK types. */
export interface HelperSys {
  id: string
  type: string
  version?: number
  [key: string]: unknown
}
export interface HelperLink {
  sys: { type: 'Link'; linkType: string; id: string }
}
export interface HelperData {
  sys: HelperSys
  [key: string]: unknown
}
export interface HelperMutable<T> {
  toPlainObject(): HelperData
  update(): Promise<T>
  delete(): Promise<unknown>
}
export interface HelperCollection<T> {
  sys?: unknown
  total?: number
  skip?: number
  limit?: number
  pages?: { next?: string; prev?: string }
  items: T[]
}
type Query = Record<string, unknown>
type Fields = Record<string, Record<string, unknown>>
export interface HelperEntry extends HelperData, HelperMutable<HelperEntry> {
  fields: Fields
  metadata?: { tags: HelperLink[]; [key: string]: unknown }
  publish(): Promise<HelperEntry>
  unpublish(): Promise<HelperEntry>
  archive(): Promise<HelperEntry>
  unarchive(): Promise<HelperEntry>
}
export interface HelperContentType
  extends HelperData, HelperMutable<HelperContentType> {
  name: string
  fields: Record<string, unknown>[]
  publish(): Promise<HelperContentType>
  unpublish(): Promise<HelperContentType>
}
export interface HelperLocale extends HelperData, HelperMutable<HelperLocale> {
  code: string
  default: boolean
}
export interface HelperTag extends HelperData, HelperMutable<HelperTag> {
  name: string
}
export interface HelperApiKey extends HelperData, HelperMutable<HelperApiKey> {
  name: string
  environments: HelperLink[]
}
export interface HelperEnvironmentAlias
  extends HelperData, HelperMutable<HelperEnvironmentAlias> {
  environment: HelperLink
}
export interface HelperScheduledAction
  extends HelperData, HelperMutable<HelperScheduledAction> {
  entity: HelperLink
  environment: HelperLink
  action: string
  scheduledFor: { datetime: string; timezone?: string }
}
export interface HelperEnvironment
  extends HelperData, HelperMutable<HelperEnvironment> {
  name: string
  getEntry(id: string): Promise<HelperEntry>
  getEntries(query?: Query): Promise<HelperCollection<HelperEntry>>
  createEntry(
    contentTypeId: string,
    body: { fields: Fields; metadata?: unknown }
  ): Promise<HelperEntry>
  createEntryWithId(
    contentTypeId: string,
    entryId: string,
    body: { fields: Fields; metadata?: unknown }
  ): Promise<HelperEntry>
  getContentType(id: string): Promise<HelperContentType>
  getContentTypes(query?: Query): Promise<HelperCollection<HelperContentType>>
  createContentType(body: {
    name: string
    fields: Record<string, unknown>[]
    [key: string]: unknown
  }): Promise<HelperContentType>
  createContentTypeWithId(
    id: string,
    body: {
      name: string
      fields: Record<string, unknown>[]
      [key: string]: unknown
    }
  ): Promise<HelperContentType>
  getLocale(id: string): Promise<HelperLocale>
  getLocales(query?: Query): Promise<HelperCollection<HelperLocale>>
  getTag(id: string): Promise<HelperTag>
  getTags(query?: Query): Promise<HelperCollection<HelperTag>>
}
export interface HelperSpace extends HelperData, HelperMutable<HelperSpace> {
  getEnvironment(id: string): Promise<HelperEnvironment>
  getEnvironments(query?: Query): Promise<HelperCollection<HelperEnvironment>>
  createEnvironmentWithId(
    id: string,
    body: { name: string },
    sourceEnvironmentId?: string
  ): Promise<HelperEnvironment>
  getEnvironmentAlias(id: string): Promise<HelperEnvironmentAlias>
  getEnvironmentAliases(
    query?: Query
  ): Promise<HelperCollection<HelperEnvironmentAlias>>
  createEnvironmentAliasWithId(
    id: string,
    body: { environment: HelperLink }
  ): Promise<HelperEnvironmentAlias>
  getApiKey(id: string): Promise<HelperApiKey>
  getApiKeys(query?: Query): Promise<HelperCollection<HelperApiKey>>
  getScheduledAction(
    id: string,
    environmentId: string
  ): Promise<HelperScheduledAction>
  getScheduledActions(
    query?: Query
  ): Promise<HelperCollection<HelperScheduledAction>>
  createScheduledAction(body: {
    entity: HelperLink
    environment: HelperLink
    action: string
    scheduledFor: { datetime: string; timezone?: string }
  }): Promise<HelperScheduledAction>
}
