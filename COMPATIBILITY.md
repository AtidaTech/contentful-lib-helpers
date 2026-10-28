# Helpers 2.0 compatibility

Requires Node.js >=24.22.1 and npm >=12.2.1. Existing helper names, positional arguments, defaults, and null/boolean error conventions remain supported. Continue passing the `contentful-management` module to `getSpace` and `getEnvironment`.

The helpers explicitly initialize the supported flat CMA client. Returned values are helper-owned mutable data objects with non-enumerable compatibility methods; they are no longer instances of Contentful's deprecated nested SDK. API data and collection metadata are retained. Use returned values after updates to obtain their new versions:

```js
const environment = await getEnvironment(contentfulManagement, token, spaceId, environmentId)
let entry = await environment.getEntry(entryId)
entry.fields.title = { 'en-US': 'Updated' }
entry = await entry.update()
await entry.publish()
```

Supported object methods:

- Space: getEnvironment(s), createEnvironmentWithId (including source cloning), getEnvironmentAlias(es), createEnvironmentAliasWithId, getApiKey(s), getScheduledAction(s), createScheduledAction.
- Environment: getEntry/Entries, createEntry, createEntryWithId, getContentType(s), createContentType, createContentTypeWithId, getLocale(s), getTag(s).
- Entity: update/delete where the flat endpoint supports them; publish/unpublish for entries and content types; archive/unarchive for entries. Operations return newly wrapped data. `getScheduledAction(id, environmentId)` requires an environment ID.
- All wrapped entities: toPlainObject(). Collection items retain scope. Queries retain SDK pagination behavior; use the helpers for full entry pagination.

Updates include only writable fields and the current sys version; the SDK builds version headers. API keys exclude tokens and other read-only fields. Scheduled actions use their endpoint's version parameter.

This surface covers the helpers, bundled CLIs, and documented examples. Arbitrary methods from the retired nested SDK are not emulated. For additional endpoints, create a flat CMA client directly. Callers can still pass their own objects implementing methods used by a helper.

Delivery API key changes are Management API operations. This adapter does not introduce or replace a Content Delivery API SDK client.
