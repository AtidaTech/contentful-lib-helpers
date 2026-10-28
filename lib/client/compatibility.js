// The supported helper object surface, implemented over the flat CMA client.
// Methods are non-enumerable so SDK request payloads contain only API data.
const entities = {
  space: ['spaceId', ['name', 'defaultLocale']],
  environment: ['environmentId', ['name']],
  entry: ['entryId', ['fields', 'metadata']],
  contentType: [
    'contentTypeId',
    ['name', 'description', 'displayField', 'fields']
  ],
  locale: [
    'localeId',
    [
      'name',
      'code',
      'fallbackCode',
      'optional',
      'contentDeliveryApi',
      'contentManagementApi'
    ]
  ],
  tag: ['tagId', ['name']],
  apiKey: ['apiKeyId', ['name', 'description', 'environments']],
  environmentAlias: ['environmentAliasId', ['environment']],
  scheduledAction: [
    'scheduledActionId',
    ['entity', 'environment', 'action', 'scheduledFor']
  ]
}

function method(object, name, fn) {
  Object.defineProperty(object, name, { value: fn, enumerable: false })
}

export function wrapEntity(client, kind, data, scope = {}) {
  if (!data) return data
  const [idKey, fields] = entities[kind]
  const params = { ...scope, [idKey]: data.sys.id }
  if (kind === 'scheduledAction')
    params.environmentId = data.environment?.sys.id
  const object = structuredClone(data)
  const endpoint =
    client[kind === 'scheduledAction' ? 'scheduledActions' : kind]
  const wrap = result => wrapEntity(client, kind, result, scope)
  const payload = () => ({
    sys: structuredClone(object.sys),
    ...Object.fromEntries(
      fields
        .filter(key => key in object)
        .map(key => [key, structuredClone(object[key])])
    )
  })
  method(object, 'toPlainObject', () => structuredClone({ ...object }))
  if (endpoint.update)
    method(object, 'update', async () => {
      if (kind === 'scheduledAction') {
        const { sys, ...body } = payload()
        return wrap(
          await endpoint.update({ ...params, version: sys.version }, body)
        )
      }
      return wrap(await endpoint.update(params, payload()))
    })
  if (endpoint.delete)
    method(object, 'delete', () =>
      endpoint.delete(
        kind === 'tag' ? { ...params, version: object.sys.version } : params
      )
    )
  for (const action of ['publish', 'unpublish', 'archive', 'unarchive']) {
    if (endpoint[action])
      method(object, action, async () => {
        const needsPayload =
          action === 'publish' || (kind === 'entry' && action === 'unpublish')
        const result = await endpoint[action](
          params,
          ...(needsPayload ? [payload()] : [])
        )
        return wrap(result)
      })
  }

  function get(name, child, childScope) {
    method(object, name, async (id, environmentId) =>
      wrapEntity(
        client,
        child,
        await client[
          child === 'scheduledAction' ? 'scheduledActions' : child
        ].get({
          ...childScope,
          [entities[child][0]]: id,
          ...(environmentId ? { environmentId } : {})
        }),
        childScope
      )
    )
  }
  function list(name, child, childScope) {
    method(object, name, async (query = {}) => {
      const result = await client[
        child === 'scheduledAction' ? 'scheduledActions' : child
      ].getMany({ ...childScope, query })
      return {
        ...result,
        items: result.items.map(item =>
          wrapEntity(client, child, item, childScope)
        )
      }
    })
  }
  function create(name, child, childScope) {
    method(object, name, async body =>
      wrapEntity(
        client,
        child,
        await client[
          child === 'scheduledAction' ? 'scheduledActions' : child
        ].create(childScope, body),
        childScope
      )
    )
  }
  if (kind === 'space') {
    const childScope = { spaceId: params.spaceId }
    for (const [child, singular, plural] of [
      ['environment', 'Environment', 'Environments'],
      ['environmentAlias', 'EnvironmentAlias', 'EnvironmentAliases'],
      ['apiKey', 'ApiKey', 'ApiKeys'],
      ['scheduledAction', 'ScheduledAction', 'ScheduledActions']
    ]) {
      get(`get${singular}`, child, childScope)
      list(`get${plural}`, child, childScope)
    }
    create('createScheduledAction', 'scheduledAction', childScope)
    method(
      object,
      'createEnvironmentWithId',
      async (environmentId, body, sourceEnvironmentId) =>
        wrapEntity(
          client,
          'environment',
          await client.environment.createWithId(
            { ...childScope, environmentId, sourceEnvironmentId },
            body
          ),
          childScope
        )
    )
    method(
      object,
      'createEnvironmentAliasWithId',
      async (environmentAliasId, body) =>
        wrapEntity(
          client,
          'environmentAlias',
          await client.environmentAlias.createWithId(
            { ...childScope, environmentAliasId },
            body
          ),
          childScope
        )
    )
  }
  if (kind === 'environment') {
    const childScope = {
      spaceId: params.spaceId,
      environmentId: params.environmentId
    }
    for (const [child, singular, plural] of [
      ['entry', 'Entry', 'Entries'],
      ['contentType', 'ContentType', 'ContentTypes'],
      ['locale', 'Locale', 'Locales'],
      ['tag', 'Tag', 'Tags']
    ]) {
      get(`get${singular}`, child, childScope)
      list(`get${plural}`, child, childScope)
    }
    method(object, 'createEntry', async (contentTypeId, body) =>
      wrapEntity(
        client,
        'entry',
        await client.entry.create({ ...childScope, contentTypeId }, body),
        childScope
      )
    )
    method(object, 'createEntryWithId', async (contentTypeId, entryId, body) =>
      wrapEntity(
        client,
        'entry',
        await client.entry.createWithId(
          { ...childScope, contentTypeId, entryId },
          body
        ),
        childScope
      )
    )
    create('createContentType', 'contentType', childScope)
    method(object, 'createContentTypeWithId', async (contentTypeId, body) =>
      wrapEntity(
        client,
        'contentType',
        await client.contentType.createWithId(
          { ...childScope, contentTypeId },
          body
        ),
        childScope
      )
    )
  }
  return object
}

export function createHelperClient(contentfulManagement, accessToken) {
  const client = contentfulManagement.createClient(
    { accessToken },
    { type: 'plain' }
  )
  return {
    async getSpace(spaceId) {
      return wrapEntity(client, 'space', await client.space.get({ spaceId }))
    }
  }
}
