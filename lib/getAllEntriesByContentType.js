import { getContentType } from './getContentType.js'
import { validateInputs } from './validation/validateInputs.js'
import { validateNumber } from './validation/validateNumber.js'
import { validateString } from './validation/validateString.js'

/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful environment object.
 * @param {string} contentTypeId - The ID of the content-type to retrieve.
 * @param {number} [limit=1000] - Number of entries to retrieve at each loop.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<import("contentful-management/dist/typings/common-types").Collection<import("contentful-management/dist/typings/entities/entry").Entry, import("contentful-management/dist/typings/entities/entry").EntryProps<import("contentful-management/dist/typings/common-types").KeyValueMap>>>}
 */
export async function getAllEntriesByContentType(
  environment,
  contentTypeId,
  limit = 1000,
  verbosityLevel = 1
) {
  const environmentId = environment?.sys?.id ?? null

  // Initialize Empty collection
  let entriesCollection = {
    sys: { type: 'Array' },
    total: 0,
    skip: 0,
    limit: 0,
    items: []
  }

  if (environmentId === null) {
    console.error('@@/ERROR: Invalid environment')
    return entriesCollection
  }

  const validInputs =
    (await validateString(contentTypeId, 'contentTypeId')) &&
    (await validateInputs(environment, 'getEntries', verbosityLevel)) &&
    (await validateNumber(limit, 'limit', verbosityLevel)) &&
    (await validateNumber(verbosityLevel, 'verbosityLevel', verbosityLevel))

  if (!validInputs) {
    return entriesCollection
  }

  const contentType = await getContentType(
    environment,
    contentTypeId,
    verbosityLevel
  )
  if (!contentType) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Content Type '${contentTypeId}' not found in Environment '${environmentId}'`
      )
    return entriesCollection
  }

  let shouldLoop = true
  let skip = 0

  do {
    let entriesResult
    try {
      entriesResult = await environment.getEntries({
        content_type: contentTypeId,
        skip,
        limit
      })
    } catch (error) {
      console.error('@@/ERROR: ' + error)
      entriesResult = {
        sys: { type: 'Array' },
        total: 0,
        skip: 0,
        limit: 0,
        items: []
      }
    }

    if (entriesResult?.items && entriesResult?.items?.length > 0) {
      entriesCollection.items = entriesCollection.items.concat(
        entriesResult?.items
      )
      entriesCollection.total = entriesResult?.total ?? 0
      skip += limit
    } else {
      shouldLoop = false
    }
  } while (shouldLoop)

  entriesCollection.limit = entriesCollection.total

  verbosityLevel > 1 &&
    console.log(
      `%%/DEBUG: Retrieved ${entriesCollection?.items?.length} Entries of Content Type '${contentTypeId}' in Environment '${environmentId}'`
    )

  return entriesCollection
}
