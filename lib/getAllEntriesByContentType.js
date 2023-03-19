import { getContentType } from './getContentType'
import { validateInputs } from './validation/validateInputs'
import { validateNumber } from './validation/validateNumber'
import { validateString } from './validation/validateString'

/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful environment object.
 * @param {string} contentTypeId - The ID of the content-type to retrieve.
 * @param {number} [limit=1000] - Number of entries to retrieve at each loops.
 * @param {number} [verbosityLevel=1] - The verbosity level of the logging (0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO).
 * @returns {Promise<Array<import("contentful-management/dist/typings/entities/entry").Entry>>}
 */
export async function getAllEntriesByContentType(
  environment,
  contentTypeId,
  limit = 1000,
  verbosityLevel = 1
) {
  const environmentId = environment?.sys?.id ?? null

  if (environmentId === null) {
    console.error('@@/ERROR: Invalid environment')
    return []
  }

  const validInputs =
    (await validateString(contentTypeId, 'contentTypeId')) &&
    (await validateInputs(environment, 'getEntries', verbosityLevel)) &&
    (await validateNumber(limit, 'limit', verbosityLevel)) &&
    (await validateNumber(verbosityLevel, 'verbosityLevel', verbosityLevel))

  if (!validInputs) {
    return []
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
    return []
  }

  // Initialize pagination values
  let entriesArray = []
  let shouldLoop = true
  let skip = 0

  do {
    let entriesCollection
    try {
      entriesCollection = await environment.getEntries({
        content_type: contentTypeId,
        skip,
        limit
      })
    } catch (error) {
      console.error('@@/ERROR: ' + error)
      return []
    }

    if (entriesCollection?.items && entriesCollection?.items?.length > 0) {
      entriesArray = entriesArray.concat(entriesCollection?.items)
      skip += limit
    } else {
      shouldLoop = false
    }
  } while (shouldLoop)

  verbosityLevel > 1 &&
    console.log(
      `%%/DEBUG: Retrieved ${entriesArray?.length} Entries of Content Type '${contentTypeId}' in Environment '${environmentId}'`
    )

  return entriesArray
}
