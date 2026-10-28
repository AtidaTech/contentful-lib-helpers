import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createClient } from 'contentful-management'
import { createHelperClient, wrapEntity } from '../lib/client/compatibility.js'
import {
  getSpace,
  getEnvironment,
  getAllEntriesByContentType,
  publishEntry
} from '../index.js'

const entity = (id, extra = {}) => ({
  sys: { id, type: 'Entry', version: 7 },
  ...extra
})

function fixture() {
  const calls = []
  const client = Object.fromEntries(
    [
      'space',
      'environment',
      'entry',
      'contentType',
      'locale',
      'tag',
      'apiKey',
      'environmentAlias',
      'scheduledAction'
    ].map(kind => [
      kind,
      Object.fromEntries(
        [
          'get',
          'getMany',
          'create',
          'createWithId',
          'update',
          'delete',
          'publish',
          'unpublish',
          'archive',
          'unarchive'
        ].map(action => [
          action,
          async (...args) => {
            calls.push({ kind, action, args })
            const [params, body] = args
            const id = params[`${kind}Id`] ?? kind
            if (action === 'getMany')
              return { total: 1, skip: 0, limit: 100, items: [entity(kind)] }
            if (action === 'delete') return {}
            return entity(id, {
              ...(body ?? {}),
              sys: { id, type: kind, version: action === 'update' ? 8 : 7 }
            })
          }
        ])
      )
    ])
  )
  client.scheduledActions = client.scheduledAction
  delete client.scheduledAction
  return { client, calls, space: wrapEntity(client, 'space', entity('space')) }
}

test('initializer explicitly uses flat CMA and keeps helper signatures and null behavior', async () => {
  const { client } = fixture()
  const sdk = {
    createClient(options, mode) {
      assert.equal(options.accessToken, 'token')
      assert.deepEqual(mode, { type: 'plain' })
      return client
    }
  }
  const space = await getSpace(sdk, 'token', 'space', 0)
  assert.equal(typeof space.getEnvironment, 'function')
  assert.equal(
    (await getEnvironment(sdk, 'token', 'space', 'env', 0)).sys.id,
    'env'
  )
  const failing = {
    createClient() {
      throw Error('unauthorized')
    }
  }
  assert.equal(await getSpace(failing, 'bad', 'space', 0), null)
  assert.equal(await getEnvironment(failing, 'bad', 'space', 'env', 0), null)
})

test('scope, collections, queries, and updated entity methods survive wrapping', async () => {
  const { calls, space } = fixture()
  const env = await space.getEnvironment('env')
  const entries = await env.getEntries({ skip: 3, limit: 2 })
  assert.deepEqual(calls.at(-1).args[0], {
    spaceId: 'space',
    environmentId: 'env',
    query: { skip: 3, limit: 2 }
  })
  const entry = entries.items[0]
  entry.fields = { title: { 'en-US': 'changed' } }
  const updated = await entry.update()
  assert.equal(updated.sys.version, 8)
  assert.deepEqual(calls.at(-1).args, [
    { spaceId: 'space', environmentId: 'env', entryId: 'entry' },
    { sys: entry.sys, fields: entry.fields }
  ])
  assert.equal(typeof updated.publish, 'function')
  assert.deepEqual(Object.keys(entry), ['sys', 'fields'])
  assert.deepEqual(entry.toPlainObject(), {
    sys: entry.sys,
    fields: entry.fields
  })
  await updated.publish()
  assert.equal(calls.at(-1).args[1].sys.version, 8)
  await updated.delete()
  assert.equal(calls.at(-1).args.length, 1)
})

test('cloning, alias mutation, key payloads, entry creation and scheduling keep IDs and versions', async () => {
  const { client, calls, space } = fixture()
  await space.createEnvironmentWithId('copy', { name: 'copy' }, 'source')
  assert.deepEqual(calls.at(-1).args[0], {
    spaceId: 'space',
    environmentId: 'copy',
    sourceEnvironmentId: 'source'
  })
  const alias = await space.getEnvironmentAlias('alias')
  alias.environment = {
    sys: { type: 'Link', linkType: 'Environment', id: 'copy' }
  }
  await alias.update()
  assert.deepEqual(calls.at(-1).args[1].environment, alias.environment)
  const key = wrapEntity(
    client,
    'apiKey',
    entity('key', {
      name: 'key',
      accessToken: 'secret',
      preview_api_key: {},
      environments: []
    }),
    { spaceId: 'space' }
  )
  await key.update()
  assert.deepEqual(Object.keys(calls.at(-1).args[1]), [
    'sys',
    'name',
    'environments'
  ])
  const env = await space.getEnvironment('copy')
  await env.createEntry('post', { fields: {} })
  assert.equal(calls.at(-1).args[0].contentTypeId, 'post')
  const action = await space.createScheduledAction({
    environment: { sys: { id: 'copy' } },
    action: 'publish',
    scheduledFor: { datetime: '2030-01-01T00:00:00Z' }
  })
  await action.update()
  assert.equal(calls.at(-1).args[0].version, 7)
  assert.equal(calls.at(-1).args[0].environmentId, 'copy')
  assert.equal('sys' in calls.at(-1).args[1], false)
})

test('content type unpublish does not pass a payload as request headers', async () => {
  const { client, calls } = fixture()
  await wrapEntity(client, 'contentType', entity('post'), {
    spaceId: 's',
    environmentId: 'e'
  }).unpublish()
  assert.equal(calls.at(-1).args.length, 1)
})

test('existing pagination helper consumes wrapped collections and publish helper keeps booleans', async () => {
  const { client, space } = fixture()
  client.entry.getMany = async ({ query }) => ({
    total: 2,
    items: query.skip < 2 ? [entity(`entry-${query.skip}`)] : []
  })
  const env = await space.getEnvironment('env')
  const entries = await getAllEntriesByContentType(env, 'post', 1, 1)
  assert.equal(entries.items.length, 2)
  assert.equal(typeof entries.items[1].update, 'function')
  assert.equal(await publishEntry(env, 'entry', 0), true)
  client.entry.get = async () => {
    throw Error('missing')
  }
  assert.equal(await publishEntry(env, 'entry', 0), false)
})

test('actual SDK serializes version headers and strips sys without legacy initialization', async () => {
  const requests = []
  const sdk = {
    createClient(options, mode) {
      return createClient(
        {
          ...options,
          retryOnError: false,
          adapter: async config => {
            requests.push(config)
            const data = entity(
              config.url.endsWith('/spaces/s')
                ? 's'
                : config.url.endsWith('/environments/e')
                  ? 'e'
                  : 'entry',
              { fields: {} }
            )
            return { data, status: 200, statusText: 'OK', headers: {}, config }
          }
        },
        mode
      )
    }
  }
  const space = await createHelperClient(sdk, 'fake').getSpace('s')
  const env = await space.getEnvironment('e')
  const entry = await env.getEntry('entry')
  entry.fields.title = { 'en-US': 'new' }
  await entry.update()
  const update = requests.at(-1)
  assert.equal(String(update.headers['X-Contentful-Version']), '7')
  assert.deepEqual(JSON.parse(update.data), { fields: entry.fields })
  await entry.publish()
  assert.match(requests.at(-1).url, /entries\/entry\/published$/)
  assert.equal(String(requests.at(-1).headers['X-Contentful-Version']), '7')
})

test('SDK receives clone, alias, API key, scheduled action and tag version contracts', async () => {
  const requests = []
  const sdk = {
    createClient(options, mode) {
      return createClient(
        {
          ...options,
          adapter: async config => {
            requests.push(config)
            const id = config.url.split('/').at(-1)
            const body =
              typeof config.data === 'string'
                ? JSON.parse(config.data)
                : (config.data ?? {})
            return {
              data: entity(id, body),
              status: 200,
              statusText: 'OK',
              headers: {},
              config
            }
          }
        },
        mode
      )
    }
  }
  const space = await createHelperClient(sdk, 'fake').getSpace('s')
  await space.createEnvironmentWithId('copy', { name: 'copy' }, 'source')
  assert.equal(
    requests.at(-1).headers['X-Contentful-Source-Environment'],
    'source'
  )
  const alias = await space.getEnvironmentAlias('alias')
  alias.environment = {
    sys: { type: 'Link', linkType: 'Environment', id: 'copy' }
  }
  await alias.update()
  assert.match(requests.at(-1).url, /environment_aliases\/alias$/)
  assert.deepEqual(JSON.parse(requests.at(-1).data), {
    environment: alias.environment
  })
  assert.equal(String(requests.at(-1).headers['X-Contentful-Version']), '7')
  const key = await space.getApiKey('key')
  key.name = 'key'
  key.environments = [alias.environment]
  key.accessToken = 'never-send-this'
  await key.update()
  assert.deepEqual(JSON.parse(requests.at(-1).data), {
    name: 'key',
    environments: [alias.environment]
  })
  const action = await space.createScheduledAction({
    environment: alias.environment,
    action: 'publish',
    entity: { sys: { id: 'entry', type: 'Link', linkType: 'Entry' } },
    scheduledFor: { datetime: '2030-01-01T00:00:00Z' }
  })
  await action.update()
  assert.equal(String(requests.at(-1).headers['X-Contentful-Version']), '7')
  assert.equal(requests.at(-1).params['environment.sys.id'], 'copy')
  assert.equal('sys' in JSON.parse(requests.at(-1).data), false)
  const env = await space.getEnvironment('copy')
  await (await env.getTag('tag')).delete()
  assert.equal(String(requests.at(-1).headers['X-Contentful-Version']), '7')
})
