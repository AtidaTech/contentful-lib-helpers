[![License: MIT](https://img.shields.io/github/license/AtidaTech/contentful-lib-helpers)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/contentful-lib-helpers)](https://npmjs.com/package/contentful-lib-helpers)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/AtidaTech/contentful-lib-helpers)
![Downloads](https://img.shields.io/npm/dw/contentful-lib-helpers)
![Forks](https://img.shields.io/github/forks/AtidaTech/contentful-lib-helpers)
[![Bun.sh](https://img.shields.io/badge/bun.sh-compatible-orange)](https://bun.sh)

<p align="center">

# ![Contentful Lib Helpers](./images/logo-helpers-100.png)

</p>

# Contentful CMA Helper Library

A utility library for the [Contentful Management API 🔗](https://github.com/contentful/contentful-management.js), designed to help developers interact with the API in a more intuitive and streamlined way. This library provides functions for common tasks, such as retrieving and publishing entries, as well as tools for handling errors and logging.

<h3>Sponsored by <a href="https://github.com/AtidaTech"><b>Atida</b> <img src="https://avatars.githubusercontent.com/u/127305035?s=200&v=4" width="14px;" alt="Atida" /></a></h3>

<hr />

[✨ Features](#-features) · [💡 Installation](#-installation) · [📟 Example](#-example) · [🎹 Usage](#-usage) · [🔊 verbosityLevel](#-verbositylevel) · [📅 ToDo](#-todo) · [👾 Contributors](#-contributors) · [🎩 Acknowledgments](#-acknowledgements) · [📚 Collection](#-other-scripts-in-the-same-collection) · [📄 License](#-license)

<hr />


## ✨ Features
- Easy-to-use functions for common tasks
- Compatible return types with CMA
- Customizable verbosity level for console logging
- Robust error handling and validation
- Async/await API for easy integration into async workflows

## 💡 Installation

To use this helper library, you must have [NodeJS 🔗](https://nodejs.org/) and [npm 🔗](http://npmjs.org) installed. 

To install it, simply run:

```shell
npm install contentful-lib-helpers --save
```

Or, if using [yarn 🔗](https://yarnpkg.com/lang/en/):

```shell
yarn add contentful-lib-helpers
```

> Similarly, if you are using [Bun 🔗](https://bun.sh), just run<br />`bun add contentful-lib-helpers`

### Requirements

* `node` >= 18.0.0
* `npm` >= 9.5.0
* `contentful-management` >= 7.50.0 

## 📟 Example

Here a simple example of writing a function that finds an entry by slug, add a tag and then republishes it.<br />
We show both implementations: one using only the Contentful Management SDK and the other one, much shorter, using the Contentful Lib Helpers.

<details open="open">
<summary>With Contentful Lib Helpers</summary>

```javascript
(async function main () {
    const contentfulManagement = require('contentful-management')
    const lib = await import('contentful-lib-helpers')
    const environment = await lib.getEnvironment(
        contentfulManagement,
        'your-access-token',
        'your-space-id',
        'master'
    )

    const entryId = await lib.getEntryIdByUniqueField(
        environment,
        'page',
        'slug',
        '/my-awesome-blog-post'
    )

    if (entryId) {
        await lib.addEntryTag(environment, entryId, 'your-tag')
        await lib.publishEntry(environment, entryId)
    }
})()
```

</details>


<details>
  <summary>Only with Contentful Management SDK</summary>

```javascript
(async function main () {
    const contentfulManagement = require('contentful-management')
    const client = await contentfulManagement.createClient({
    accessToken: 'your-access-token',
    })

    try {
        // Get the environment
        const space = await client.getSpace('your-space-id')
        const environment = await space.getEnvironment('master')

        // Get the entry ID by unique field
        const entry = await environment.getEntries({
            content_type: 'page',
            ['fields.slug']: '/my-awesome-blog-post',
            limit: 1
        })

        const entryId = entry.items.length > 0 ? entry.items[0].sys.id : null

        if (entryId) {
            // Add tag to the entry
            const tagName = 'country-it'
            const entryWithTags = await environment.getEntry(entryId).then((entry) => {
                entry.metadata = entry.metadata || { tags: [] }
                if (!entry.metadata.tags.includes(tagName)) {
                    entry.metadata.tags.push({
                        sys: {
                            type: 'Link',
                            linkType: 'Tag',
                            id: tagName
                        }
                    })
                }
                return entry
            })
            await entryWithTags.update()

            // Publish the entry with tag
            const publishedEntry = await environment.getEntry(entryId).then((entry) => {
                entry.metadata = entry.metadata || {}
                entry.metadata.tags = entry.metadata.tags || []
                return entry.publish()
            })

            console.log(`Published entry with ID ${publishedEntry.sys.id} and tag ${tagName}`)
        } else {
            console.error(`Entry not found`)
        }
    } catch (error) {
        console.error(`Error: ${error.message}`)
    }
})()
```

</details>

### Note
Two alternative ways to include the Contentful library as ES Module are the following:

```js
// At the beginning of the file
import contentfulManagement from 'contentful-management'

// Inside a function
const { default: contentfulManagement } = await import('contentful-management')

// If you are using Bun.sh
const contentfulManagement = await import('contentful-management')
```

See also: [NodeJS modules import 🔗](https://reflectoring.io/nodejs-modules-imports/)

## 🎹 Usage
Here are the methods available in this library and how to use them:

**Space/Environment**

* [getSpace](#-getspace)
* [getEnvironment](#-getenvironment)
* [deleteEnvironment](#-deleteenvironment)

**Content-types/Entries**

* [getContentTypes](#-getcontenttypes)
* [getContentType](#-getcontenttype)
* [getAllEntriesByContentType](#-getallentriesbycontenttype)
* [getEntryIdByUniqueField](#-getentryidbyuniquefield)
* [getEntry](#-getentry)
* [extractStatusFromSys](#-extractstatusfromsys)
* [publishEntry](#-publishentry)
* [unpublishEntry](#-unpublishentry)

**Tags**

* [getTagExists](#-gettagexists)
* [addEntryTag](#-addentrytag)
* [removeEntryTag](#-removeentrytag)

**Locales**

* [getAllLocales](#-getalllocales)
* [getAllLocalesCode](#-getalllocalescode)
* [getDefaultLocale](#-getdefaultlocale)
* [getDefaultLocaleCode](#-getdefaultlocalecode)
* [getDefaultValuesForLocales](#-getdefaultvaluesforlocales)

**Release**

* [duplicateEnvironment](#-duplicateenvironment)
* [enableCdaKey](#-enablecdakey)
* [linkAliasToEnvironment](#-linkaliastoenvironment)
* [syncScheduledActions](#-syncscheduledactions)

<hr />

### • `getSpace`

The function retrieves a Contentful space object by its ID, using the Contentful Management API.

#### Parameters
- `contentfulManagement` - The Contentful Management library.
- `contentfulToken` - The Contentful access token.
- `contentfulSpaceId` - The ID of the space to retrieve.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value
The function returns a Promise that resolves with the Space object, or null if not found.

#### Example Usage

```javascript
import { getSpace } from 'contentful-lib-helpers'
import contentfulManagement from 'contentful-management'
const contentfulToken = 'your-access-token'
const contentfulSpaceId = 'your-space-id'

const space = await getSpace(
    contentfulManagement, 
    contentfulToken, 
    contentfulSpaceId, 
    2
)
```

<details>
    <summary><code>console.log(space)</code></summary>

```js
{
  name: 'Contentful Test Space',
  sys: {
    type: 'Space',
    id: 'your-space-id',
    version: 2,
    createdBy: { sys: [Object] },
    createdAt: '2023-03-31T10:41:25Z',
    updatedBy: { sys: [Object] },
    updatedAt: '2023-03-31T10:42:41Z',
    organization: { sys: [Object] }
  }
}
```

</details>

<hr />

### • `getEnvironment`

The function retrieves a Contentful environment object by ID, using the Contentful Management API.

#### Parameters
- `contentfulManagement` - The Contentful Management library.
- `contentfulToken` - The Contentful access token.
- `contentfulSpaceId` - The ID of the space to retrieve.
- `contentfulEnvironmentId` - The ID of the environment to retrieve (default `master`).
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value
The function returns a Promise that resolves with the Environment object, or null if not found.

#### Example Usage

```javascript
import { getEnvironment } from 'contentful-lib-helpers'
import contentfulManagement from 'contentful-management'
const contentfulToken = 'your-access-token'
const contentfulSpaceId = 'your-space-id'
const contentfulEnvironmentId = 'your-environment-id'

const environment = await getEnvironment(
    contentfulManagement, 
    contentfulToken, 
    contentfulSpaceId,
    contentfulEnvironmentId,
    2
)
```

<details>
    <summary><code>console.log(environment)</code></summary>

```js
{
  name: 'master',
  sys: {
    type: 'Environment',
    id: 'master',
    version: 3,
    space: { sys: [Object] },
    status: { sys: [Object] },
    createdBy: { sys: [Object] },
    createdAt: '2023-04-04T15:13:55Z',
    updatedBy: { sys: [Object] },
    updatedAt: '2023-04-04T15:13:56Z',
    aliases: []
  }
}
```
</details>

<hr />

### • `getContentTypes`

The function retrieves get all Content-types in a Contentful environment.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value
The function returns a Promise that resolves with a Content-type collection if successful, or an empty Collection otherwise.

Note: the decision to return an empty collection, is because collections of any kind are usually looped trough. If we would be returning a `null`/`false` value, that would need to be verified before looping through the elements. With the empty collection, the items can be passed to the loop (that won't loop because empty).

#### Example Usage

```javascript
const allContentTypes = await getContentTypes(
    environment, 
    2
)
```

<details>
    <summary><code>console.log(allContentTypes)</code></summary>

```js
{
  sys: { type: 'Array' },
  total: 3,
  skip: 0,
  limit: 100,
  items: [
    {
      sys: [Object],
      displayField: 'key',
      name: 'Translation',
      description: '',
      fields: [Array]
    },
    {
      ...
    },
    {
      ...
    }
  ]
}
```
</details>

<hr />

### • `getContentType`

The function retrieves a Content-type object by its ID.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `contentTypeId` - The ID of the content-type to retrieve.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value

The function returns a Promise that resolves with the content-type object if it exists, or `null` otherwise.

#### Example Usage

```javascript
const contentType = await getContentTypes(
    environment, 
    'translation',
    2
)
```

<details>
    <summary><code>console.log(contentType)</code></summary>

```js
{
  sys: {
    space: { sys: [Object] },
    id: 'translation',
    type: 'ContentType',
    createdAt: '2023-03-31T11:12:04.950Z',
    updatedAt: '2023-03-31T11:18:19.563Z',
    environment: { sys: [Object] },
    publishedVersion: 13,
    publishedAt: '2023-03-31T11:18:19.563Z',
    firstPublishedAt: '2023-03-31T11:12:05.422Z',
    createdBy: { sys: [Object] },
    updatedBy: { sys: [Object] },
    publishedCounter: 7,
    version: 14,
    publishedBy: { sys: [Object] }
  },
  displayField: 'key',
  name: 'Translation',
  description: '',
  fields: [
    {
      id: 'key',
      name: 'key',
      type: 'Symbol',
      localized: false,
      required: true,
      validations: [Array],
      disabled: false,
      omitted: false
    },
    {
      id: 'value',
      name: 'value',
      type: 'Symbol',
      localized: true,
      required: true,
      validations: [],
      disabled: false,
      omitted: false
    }
  ]
}
```
</details>

<hr />

### • `getAllEntriesByContentType`

It gets a Collection of all the Contentful Entries, by Content-type. The peculiarity of this method is that does the pagination (default 1000 elements) for you, and the returned collection contains all the entries.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `contentTypeId` - The ID of the content-type to retrieve.
- `limit` - Number of entries to retrieve at each loop. Default `1000`.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value

The function returns a Promise that resolves with a Collection of Contentful Entries, or an empty Collection otherwise. 

Note: the decision to return an empty collection, is because collections of any kind are usually looped trough. If we returned a `null`/`false` value, that would need to be verified before looping through the elements. With the empty collection, the items can be passed to the loop (that won't loop because empty).


#### Example Usage

```javascript
const allEntries = await getAllEntriesByContentType(
    environment, 
    'translation',
    1000,
    2
)
```

<details>
    <summary><code>console.log(allEntries)</code></summary>

```js
{
  sys: { type: 'Array' },
  total: 5,
  skip: 0,
  limit: 5,
  items: [
    { metadata: [Object], sys: [Object], fields: [Object] },
    { metadata: [Object], sys: [Object], fields: [Object] },
    { metadata: [Object], sys: [Object], fields: [Object] },
    { metadata: [Object], sys: [Object], fields: [Object] },
    { metadata: [Object], sys: [Object], fields: [Object] }
  ]
}
```
</details>

<hr />

### • `getEntryIdByUniqueField`

Find an Entry in a specific Content Type and locale by its unique identifier field.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `fieldId` - The ID of the unique field to search for. A unique field is usually a mandatory and unique field in the Content-type (ie: slug).
- `fieldValue` - The value to search for in the unique field.
- `fieldLocale` - The locale to search in for the unique field. If not provided, the default locale will be used.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value

A Promise that resolves to the Entry ID or `null` otherwise. We can then use [getEntry](#-getentry) to retrieve the Entry itself.

#### Example Usage

```javascript
const entryId = await getEntryIdByUniqueField(
    environment,
    'translation',
    'key',
    'test.entry'
)
```

<details>
    <summary><code>console.log(entryId)</code></summary>

```
AKjzIrXfTQFS6oXjJp71Z
```
</details>
<hr />

### • `getEntry`

Get a Contentful entry by ID.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `entryId` - The ID of the entry to get.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value

A Promise that resolves with the entry object, or `null` if not found.

#### Example Usage

```javascript
const entry = await getEntry(
    environment,
    'exampleEntryId',
    2
)
```

<details>
    <summary><code>console.log(entry)</code></summary>

```js
{
  metadata: { tags: [] },
  sys: {
    space: { sys: [Object] },
    id: 'GKjzIfXfTQFS8oXjJp71Y',
    type: 'Entry',
    createdAt: '2023-04-04T15:11:47.018Z',
    updatedAt: '2023-04-04T17:19:50.990Z',
    environment: { sys: [Object] },
    firstPublishedAt: '2023-04-04T17:19:25.915Z',
    createdBy: { sys: [Object] },
    updatedBy: { sys: [Object] },
    publishedCounter: 2,
    version: 9,
    automationTags: [],
    contentType: { sys: [Object] }
  },
  fields: { key: { 'en-US': 'test.entry' }, value: { 'en-US': 'Test' } }
}
```
</details>
<hr />

### • `extractStatusFromSys`

The function extracts the status of a Contentful Entry from its `sys` properties.

#### Parameters
- `entrySys` -  The sys properties of the Entry.

#### Return Value

It returns the status of an Entry: `published`, `changed`, `draft` and `archived` (in the unlikely possibility of an error, it would return `unknown`).

#### Example Usage

```javascript
const entry = await getEntry(
    environment,
    'exampleEntryId'
)

const entryStatus = await extractStatusFromSys(entry?.sys)
```

<details>
    <summary><code>console.log(entryStatus)</code></summary>

```
published
```
</details>
<hr />

### • `publishEntry`

Publishes a Contentful entry.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `entryId` - The ID of the entry to publish.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value

A Promise that resolves with `true` if the entry was published successfully, or `false` otherwise.

#### Example Usage

```javascript
const isEntryPublished = await publishEntry(
    environment,
    'exampleEntryId',
    2
)
```

<details>
    <summary><code>console.log(isEntryPublished)</code></summary>

```
true
```
</details>
<hr />

### • `unpublishEntry`

Unpublishes a Contentful Entry.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `entryId` - The ID of the entry to unpublish.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value

Promise that resolves with `true` if the entry was unpublished successfully, or `false` otherwise.

#### Example Usage

```javascript
const isEntryUnpublished = await unpublishEntry(
    environment,
    'exampleEntryId',
    2
)
```

<details>
    <summary><code>console.log(isEntryUnpublished)</code></summary>

```
true
```
</details>
<hr />

### • `getTagExists`

The function checks if a tag exists in a Contentful environment.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `tagId` - The ID of the tag to check.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value

A Promise that resolves with `true` if the tag exists, or `false` otherwise.

#### Example Usage

```javascript
const tagExists = await getTagExists(
    environment,
    'country-en',
    2
)
```

<details>
    <summary><code>console.log(tagExists)</code></summary>

```
true
```
</details>
<hr />

### • `addEntryTag`

Adds a tag to a Contentful Entry.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `entryId` - he ID of the entry to add the tag to.
- `tagId` - The ID of the tag to add.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value

A Promise that resolves with `true` if the tag was added successfully, or `false` otherwise.

Note: the entry will need to be republished, after the tag is added. See [publishEntry](#-publishentry).

#### Example Usage

```javascript
const isTagAdded = await addEntryTag(
    environment,
    'exampleEntryId',
    'exampleTagId',
    2
)
```

<details>
    <summary><code>console.log(isTagAdded)</code></summary>

```
true
```
</details>
<hr />

### • `removeEntryTag`

Removes a tag to a Contentful Entry.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `entryId` - he ID of the entry to remove the tag from.
- `tagId` - The ID of the tag to remove.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value

A Promise that resolves with `true` if the tag was removed successfully, or `false` otherwise.

Note: the entry will need to be republished, after the tag is removed. See [publishEntry](#-publishentry).

#### Example Usage

```javascript
const isTagRemoved = await addEntryTag(
    environment,
    'exampleEntryId',
    'exampleTagId',
    2
)
```

<details>
    <summary><code>console.log(isTagRemoved)</code></summary>

```
true
```
</details>
<hr />

### • `deleteEnvironment`

The function deletes the given Contentful environment, unless it is protected.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).
- `forbiddenEnvironments` - An array of environment IDs that are protected and cannot be deleted. Default protected environments: `master`, `staging`, `uat`, `dev`.

Note: the function has the `verbosityLevel` as second parameter, instead of the last one. This is to allow using the default value for `forbiddenEnvironments`, hence protecting the production and testing environments.

#### Return Value
The function returns true if the environment was successfully deleted, false otherwise.

#### Example Usage

```javascript
import { getEnvironment, deleteEnvironment } from 'contentful-lib-helpers'
import contentfulManagement from 'contentful-management'
const contentfulToken = 'your-access-token'
const contentfulSpaceId = 'your-space-id'
const contentfulEnvironmentId = 'environment-to-delete'

const environment = await getEnvironment(
    contentfulManagement,
    contentfulToken,
    contentfulSpaceId,
    contentfulEnvironmentId,
    2
)

const isEnvironmentDeleted = await deleteEnvironment(
    environment,
    2,
    ['master', 'staging', 'dev']
)
```

<details>
    <summary><code>console.log(isEnvironmentDeleted)</code></summary>

```
true
```
</details>
<hr />

### • `getAllLocales`

Get all locales for a given environment.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value

A Collection of Locale objects.

#### Example Usage

```javascript
const allLocales = await getAllLocales(
    environment,
    2
)
```

<details>
    <summary><code>console.log(allLocales)</code></summary>

```js
{
  sys: { type: 'Array' },
  total: 2,
  skip: 0,
  limit: 100,
  items: [
    {
      name: 'English (United States)',
      code: 'en-US',
      fallbackCode: null,
      default: true,
      contentManagementApi: true,
      contentDeliveryApi: true,
      optional: false,
      sys: [Object]
    },
    {
      name: 'Italian (Italy)',
      code: 'it-IT',
      fallbackCode: 'en-US',
      default: false,
      contentManagementApi: true,
      contentDeliveryApi: true,
      optional: true,
      sys: [Object]
    }
  ]
}
```
</details>
<hr />

### • `getAllLocalesCode`

Get all the locale codes, as an array of strings (ie: `['en-US', 'it-IT']`)


#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value

An array of locale codes.

#### Example Usage

```javascript
const allLocalesCode = await getAllLocalesCode(
    environment,
    2
)
```

<details>
    <summary><code>console.log(allLocalesCode)</code></summary>

```js
[ 'en-US', 'it-IT' ]
```
</details>
<hr />

### • `getDefaultLocale`

The function returns the default Locale object.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value
The function returns the locale object of the default locale of the Contentful environment.

#### Example Usage

```javascript
const defaultLocale = await getDefaultLocale(
    environment,
    2
)
```

<details>
    <summary><code>console.log(defaultLocale)</code></summary>

```js
{
    name: 'English (United States)',
    code: 'en-US',
    fallbackCode: null,
    default: true,
    contentManagementApi: true,
    contentDeliveryApi: true,
    optional: false,
    sys: {
        type: 'Locale',
        id: '3XPgmbnnEyfxxtHVQlcfki',
        version: 1,
        space: { sys: [Object] },
        environment: { sys: [Object] },
        createdBy: { sys: [Object] },
        createdAt: '2023-04-04T15:13:55Z',
        updatedBy: { sys: [Object] },
        updatedAt: '2023-04-04T15:13:55Z'
    }
}
```
</details>
<hr />

### • `getDefaultLocaleCode`

The function returns the default Locale code (ie: `en-US`).

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value
The function returns default locale code, as a string.

#### Example Usage

```javascript
const defaultLocaleCode = await getDefaultLocaleCode(
    environment,
    2
)
```

<details>
    <summary><code>console.log(defaultLocaleCode)</code></summary>

```js
en-US
```
</details>
<hr />

### • `getDefaultValuseForLocales`

This is a very particular function. Passing a 'default' value, that can be anything (`null`, boolean, string, etc), it returns an object whose keys are the locales, and the values are the default value passed.

This is used by our other NPM package [Contentful CLI Migrations](https://www.npmjs.com/package/contentful-cli-migrations), to build locale-agnostic migrations. Meaning that the locales don't need to be hard-coded when setting up default values in a Contentful Javascript migration.

#### Parameters
- `environment` - Environment Object (you can retrieve it with [getEnvironment](#-getenvironment)).
- `defaultValue` - It can be a value of any type (usually `null`, empty string `''` or a boolean value `true/false`)

#### Return Value
The function returns an object whose keys are the locales and the values are the default value passed.

#### Example Usage

```javascript
const objectDefaultValues = await getDefaultValuesForLocales(
    environment,
    true
)
```

<details>
    <summary><code>console.log(objectDefaultValues)</code></summary>

```js
{ 'en-US': true, 'it-IT': true }
```
</details>
<hr />

### • `duplicateEnvironment`

Given a source Environment id (ie: `master`), it creates a duplicated with a new Environment id. The duplication does not 'copy' the Scheduled Content, for which you will need to use the method [syncScheduledActions](#-syncscheduledactions).

#### Parameters
- `space` - Differently from other methods, it uses the Space Object (you can retrieve it with [getSpace](#-getspace)).
- `sourceEnvironmentId` - The source environment that will be duplicated (default: `master`).
- `destinationEnvironmentId` - The ID/Name of the new environment.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value
The function returns an Environment object that can be queried or manipulated to perform further actions.

#### Example Usage

```javascript
const newEnvironment = await duplicateEnvironment(
    space,
    'master',
    'release-1.25.5',
    3
)
```

<details>
    <summary><code>console.log(newEnvironment)</code></summary>

```js
{
  name: 'release-1.25.5',
  sys: {
    type: 'Environment',
    id: 'release-1.25.5',
    version: 1,
    space: { sys: [Object] },
    status: { sys: [Object] },
    createdBy: { sys: [Object] },
    createdAt: '2023-07-24T14:19:26Z',
    updatedBy: { sys: [Object] },
    updatedAt: '2023-07-24T14:19:26Z',
    aliases: []
  }
}
```
</details>
<hr />


### • `enableCdaKey`

This function is needed when we want to enable an Environment for a particular CDA Key. For example a duplicate of the `master` Environment will need the same CDA Key that is used to query the current master.

> Note: It's a good habit to name the CDA Key with the same name as the Environment. This because the API can query the Key only by name. So it is recommended to a be a lowercase name without punctuation or spaces.

#### Parameters
- `space` - Differently from other methods, it uses the Space Object (you can retrieve it with [getSpace](#-getspace)).
- `cdaKeyName` - The 'name' of the CDA Key. Usually should match an environment name. Recommended to use lowercase, no punctuation and no spaces.
- `targetEnvironmentId` - The Environment id for which the CDA Key will be enabled.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value
`true` if the CDA Key has been enabled. `false` otherwise.

#### Example Usage

```javascript
const enabledCdaKey = await enableCdaKey(
    space,
    'master',
    'release-1.25.5',
    3
)
```

<details>
    <summary><code>console.log(enabledCdaKey)</code></summary>

```js
true
```
</details>
<hr />

### • `linkAliasToEnvironment`

Given an Environment id and and Alias, it links the Alias to that Environment. This function has to be used to switch, for example the current `master` alias to a new release Envirionment.

#### Parameters
- `space` - Differently from other methods, it uses the Space Object (you can retrieve it with [getSpace](#-getspace)).
- `sourceEnvironmentId` - The ID of the source Environment that will be linked.
- `destinationEnvironmentId` - The ID of the Alias to which the Environment will be linked to.
- `releaseRegEx` - Regular expression to identify release Environments.
- `protectedEnvironments` - Safety measure when deleting old release to not deleted important Environments.
- `deleteOldReleases` - If true, it deletes all release Environments, except the newly linked one and the previous one.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value
The function does not return any value, but it does return a detailed error message in case of failure.

#### Example Usage

```javascript
await linkAliasToEnvironment(
    space,
    'release-1.25.5',
    'master'
)
```

### • `syncScheduledActions`

When duplicating an Environment, the Scheduled Actions are not usually carried over. This function copies those Scheduled Actions between two environments.

#### Parameters
- `space` - Differently from other methods, it uses the Space Object (you can retrieve it with [getSpace](#-getspace)).
- `sourceEnvironmentId` - The source environment that contains the Scheduled Actions.
- `destinationEnvironmentId` - The destination environment to which those Actions will be copied to.
- `verbosityLevel` - (optional, default `1`) the level of console logging verbosity to use. See [verbosityLevel](#-verbositylevel).

#### Return Value
The function does not return any value, but it does return a detailed error message in case of failure.

#### Example Usage

```javascript
 await syncScheduledActions(
    space,
    'master',
    'release-1.25.5',
    3
)
```

## 🔊 verbosityLevel
All methods accept an optional verbosityLevel parameter. This parameter is an integer from 0 to 3 that determines the amount of console logging the function should output. A higher number means more logging. The default value is 1 (error logging)

* `0` - No logging.
* `1` - Only errors.
* `2` - Errors and debug information.
* `3` - All logs, including info logs.

## 📅 Todo

* Add further methods (ie: `getAllAssets`, `uploadAsset`, ...)
* Improve Logging (+ Colors).
* Add Tests
* Add Support for [Yargs](https://www.npmjs.com/package/yargs) and [Chalk](https://www.npmjs.com/package/chalk)

## 👾 Contributors

<table>
  <tr>
    <td align="center"><a href="https://github.com/fciacchi"><img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/58506?v=4&h=100&w=100&fit=cover&mask=circle&maxage=7d" width="100px;" alt="Fabrizio Ciacchi" /><br /><sub><b>@fciacchi</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/psyvic"><img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/29251597?v=4&h=100&w=100&fit=cover&mask=circle&maxage=7d" width="100px;" alt="Victor Hugo Aizpuruo" /><br /><sub><b>@psyvic</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/aalduz"><img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/11409770?v=4&h=100&w=100&fit=cover&mask=circle&maxage=7d" width="100px;" alt="Aldo Fernández" /><br /><sub><b>@aalduz</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/leslyto"><img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/4264812?v=4&h=100&w=100&fit=cover&mask=circle&maxage=7d" width="100px;" alt="Stefan Stoev" /><br /><sub><b>@leslyto</b></sub></a><br /></td>
  </tr>
</table>

### Contributions
Feel free to open issues or pull requests in our GitHub Repository if you have suggestions or improvements to propose.

## 🎩 Acknowledgements

I would like to express my gratitude to the following parties:

- [Atida 🔗](https://www.atida.com/), the company that has allowed these scripts to be open sourced. Atida is an e-commerce platform that sells beauty and medical products. Their support for open source is greatly appreciated. A special thank to <a href="https://github.com/shoopi"><img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/1385372?v=4&h=16&w=16&fit=cover&mask=circle&maxage=7d" width="16px;" alt="Shaya Pourmirza" /> Shaya Pourmirza</a> that has been a great promoter and supporter of this initiative inside the company. 
- [Contentful 🔗](https://www.contentful.com/), for creating their excellent content management platform and the JavaScript CMA SDK that this library is built on. Without their work, this project would not be possible.

Thank you to everyone involved!

## 📚 Other Scripts in the same collection

We produce a bunch of interesting packages for Contentful. You might want to check them out:

* **Contentful Lib Helpers** ([GitHub](https://github.com/AtidaTech/contentful-lib-helpers/) and [NpmJS](https://www.npmjs.com/package/contentful-lib-helpers)): Utility Library for Contentful Management API.
* **Contentful CLI Export** ([GitHub](https://github.com/AtidaTech/contentful-cli-export/) and [NpmJS](https://www.npmjs.com/package/contentful-cli-export)): Simplifies backup of your Contentful Environment.
* **Contentful CLI Migrations** ([GitHub](https://github.com/AtidaTech/contentful-cli-migrations/) and [NpmJS](https://www.npmjs.com/package/contentful-cli-migrations)): Tool to automate and scale Contentful Migrations.
* **Contentful CLI Release** ([GitHub](https://github.com/AtidaTech/contentful-cli-release/) and [NpmJS](https://www.npmjs.com/package/contentful-cli-release)): Release utilities to deploy Contentful in a CI/CD.

[//]: # (* **Contentful CLI Sync** &#40;[GitHub]&#40;https://github.com/AtidaTech/contentful-cli-sync/&#41; and [NpmJS]&#40;https://www.npmjs.com/package/contentful-cli-sync&#41;&#41;: Contentful tool to sync data across Spaces and Environments.)

## 📄 License
This project is licensed under the [MIT License](LICENSE)
