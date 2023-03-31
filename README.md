[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/contentful-lib-helpers.svg)](https://npmjs.com/package/contentful-lib-helpers)
![Forks](https://img.shields.io/github/forks/AtidaTech/contentful-lib-helpers)

[comment]: <> ([![Build Status]&#40;https://travis-ci.com/AtidaTech/contentful-lib-helpers.svg?branch=main&#41;]&#40;https://travis-ci.com/AtidaTech/contentful-lib-helpers&#41;)
[comment]: <> (![Version]&#40;https://img.shields.io/github/package-json/v/AtidaTech/contentful-lib-helpers&#41;)
[comment]: <> (![Downloads]&#40;https://img.shields.io/npm/dw/contentful-lib-helpers&#41;)


<div style="text-align: center">

# ![Contentful Lib Helpers](./images/logo-helpers-100.png)

</div>

# Contentful CMA Helper Library

A utility library for the Contentful Management API, designed to help developers interact with the API in a more intuitive and streamlined way. This library provides functions for common tasks, such as retrieving and publishing entries, as well as tools for handling errors and logging.

## Features
- Easy-to-use functions for common tasks
- Compatible return types with CMA
- Customizable verbosity level for console logging
- Robust error handling and validation
- Promises-based API for easy integration into async workflows

## Installation

To use this helper library, you must have [Node.js](https://nodejs.org/) and [npm](http://npmjs.org) installed. 

To install it, simply run:

```shell
npm install contentful-lib-helpers --save
```

Or, if using [yarn](https://yarnpkg.com/lang/en/):

```shell
yarn add contentful-lib-helpers
```

## Usage
Here are the methods available in this library and how to use them:
* [getSpace](#getspace)
* [getEnvironment](#getenvironment)

<hr />

### getSpace

```javascript
getSpace(
    contentfulManagement, 
    contentfulToken, 
    contentfulSpaceId, 
    verbosityLevel = 1
)
```

The getSpace function retrieves a Contentful space object by ID, using the Contentful Management API.

#### Parameters
- `contentfulManagement` - The Contentful Management library.
- `contentfulToken` - The Contentful access token.
- `contentfulSpaceId` - The ID of the space to retrieve.
- `verbosityLevel` - (optional) the level of console logging verbosity to use. See [Verbosity](#verbositylevel)

#### Return Value
The function returns a Promise that resolves with the Space object, or null if not found.

#### Example Usage

```javascript
import { getSpace } from 'contentful-lib-helpers'
const contentfulManagement = require('contentful-management')
const contentfulToken = 'your-access-token'
const contentfulSpaceId = 'your-space-id'

const space = await getSpace(
    contentfulManagement, 
    contentfulToken, 
    contentfulSpaceId, 
    2
)

console.log(space) // { sys: { id: 'your-space-id', ... }, ... }
```

<hr />

### getEnvironment
```javascript
getEnvironment(
    contentfulManagement, 
    contentfulToken, 
    contentfulSpaceId, 
    contentfulEnvironmentId = 'master', 
    verbosityLevel = 1
)
```

The getEnvironment function retrieves a Contentful environment object by ID, using the Contentful Management API.

#### Parameters
- `contentfulManagement` - The Contentful Management library.
- `contentfulToken` - The Contentful access token.
- `contentfulSpaceId` - The ID of the space to retrieve.
- `contentfulEnvironmentId` - The ID of the environment to retrieve (default `master`).
- `verbosityLevel` - (optional) the level of console logging verbosity to use. See [Verbosity](#verbositylevel)

#### Return Value
The function returns a Promise that resolves with the Environment object, or null if not found.

#### Example Usage

```javascript
import { getEnvironment } from 'contentful-lib-helpers'
const contentfulManagement = require('contentful-management')
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

console.log(environment) // { sys: { id: 'your-environment-id', ... }, ... }
```

<hr />

## verbosityLevel
All methods accept an optional verbosityLevel parameter. This parameter is an integer from 0 to 3 that determines the amount of console logging the function should output. A higher number means more logging. The default value is 1 (error logging)

* `0` - No logging.
* `1` - Only errors.
* `2` - Errors and debug information.
* `3` - All logs, including info logs.

## Example

Here a simple example of writing a function that finds an entry by slug, update it and add a tag. It then republish it.

<div>
  <div style="float: left; width: 50%;">

**Contentful Management SDK**

```javascript
const contentfulManagement = require('contentful-management')
    
async function main() {
    const client = contentfulManagement.createClient({
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
            // Update the entry fields
            const newFields = { title: 'Updated Title' }
            const entryToUpdate = await environment.getEntry(entryId)
            Object.keys(newFields).forEach((field) => {
                entryToUpdate.fields[field]['en-US'] = newFields[field]
            })
            const updatedEntry = await entryToUpdate.update()

            // Add tag to the entry
            const tagName = 'your-tag-name'
            const entryWithTags = await environment.getEntry(entryId).then((entry) => {
                entry.metadata = entry.metadata || {}
                entry.metadata.tags = entry.metadata.tags || []
                if (!entry.metadata.tags.includes(tagName)) {
                    entry.metadata.tags.push(tagName)
                }
                return entry.update()
            })

            // Publish the entry with tag
            const publishedEntry = await environment.getEntry(entryId).then((entry) => {
                entry.metadata = entry.metadata || {}
                entry.metadata.tags = entry.metadata.tags || []
                return entry.publish()
            })

            console.log(`Published entry with ID ${publishedEntry.sys.id} and tag ${tagName}`)
        } else {
            console.error(`Entry with ${uniqueFieldName}=${uniqueFieldValue} not found`)
        }
    } catch (error) {
        console.error(`Error: ${error.message}`)
    }
}

await main()
```

</div><div style="float: left; width: 50%;">

**With Contentful Lib Helpers**

```javascript
const contentfulManagement = require('contentful-management')
import * as lib from '@atida/contentful-lib-helpers'

async function main() {
    const verbosity = 2

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
        '/my-awesome-blog-post',
        verbosity
    )

    if (entryId) {
        const entryObject = { title: 'Updated Title' }
        await lib.createOrUpdateEntry(environment, entryId, entryObject, null, verbosity)
        await lib.addEntryTag(environment, entryId, 'your-tag', verbosity)
        await lib.publishEntry(environment, entryId, verbosity)
    }
}

await main()
```

</div></div><br clear="all" />


## Todo

* Add further methods (ie: `getAssets`, `uploadAsset`, `duplicateEnvironment`)
* Add Tests
* Publish NPM package

## Contributors

<table>
  <tr>
    <td align="center"><a href="https://github.com/fciacchi"><img src="https://avatars.githubusercontent.com/u/58506?v=4" width="100px;" alt="Fabrizio Ciacchi" style="border-radius: 50%;" /><br /><sub><b>@fciacchi</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/psyvic"><img src="https://avatars.githubusercontent.com/u/29251597?v=4" width="100px;" alt="Victor Hugo Aizpuruo" style="border-radius: 50%;" /><br /><sub><b>@psyvic</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/aalduz"><img src="https://avatars.githubusercontent.com/u/11409770?v=4" width="100px;" alt="Aldo Fernández" style="border-radius: 50%;" /><br /><sub><b>@aalduz</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/leslyto"><img src="https://avatars.githubusercontent.com/u/4264812?v=4" width="100px;" alt="Stefan Stoev" style="border-radius: 50%;" /><br /><sub><b>@leslyto</b></sub></a><br /></td>
  </tr>
</table>


## Acknowledgements

I would like to express my gratitude to the following parties:

- [Atida](https://www.atida.com/), the company that has allowed these scripts to be open sourced. Atida is an e-commerce platform that sells beauty and medical products. Their support for open source is greatly appreciated. A special thank to <a href="https://github.com/shoopi"><img src="https://avatars.githubusercontent.com/u/1385372?v=4" width="16px;" alt="Shaya Pourmirza" style="border-radius: 50%;" /> Shaya Pourmirza</a> that has been a great promoter and supporter of this initiative inside the company. 
- [Contentful](https://www.contentful.com/), for creating their excellent content management platform and the JavaScript CMA SDK that this library is built on. Without their work, this project would not be possible.

Thank you to everyone involved!

## License
This project is licensed under the [MIT License](LICENSE)
