import { validateInputs } from './validation/validateInputs.js'
import { validateString } from './validation/validateString.js'

/**
 * Get a Contentful entry by ID.
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} [environment] - The Contentful Environment object.
 * @param {string} entryId - The ID of the entry to get.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<import("contentful-management/dist/typings/entities/entry").Entry>} - A Promise that resolves with the entry object, or `null` if not found.
 *
 * @example
 *
 * Usage:
 * import contentfulManagement from 'contentful-management'
 * const environment = await getEnvironment(contentfulManagement, 'access-token', 'space-id', 'environment-id')
 * const entryId = 'exampleEntryId'
 * const entry = await getEntry(environment, entryId, 2)
 * console.log(entry) // { sys: { id: 'exampleEntryId', ... }, ... }
 */
export async function getEntry(environment, entryId, verbosityLevel = 1) {
  if (!(await validateString(entryId, 'entryId'))) {
    return null
  }

  if (!(await validateInputs(environment, 'getEntry', verbosityLevel))) {
    return null
  }

  const environmentId = environment?.sys?.id ?? 'unknown'

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Getting entry ${entryId} from environment ${environmentId}`
    )

  try {
    const entry = await environment.getEntry(entryId)

    if (entry) {
      verbosityLevel > 1 &&
        console.log(
          `%%/DEBUG: Entry ${entryId} retrieved successfully from environment ${environmentId}`
        )

      return entry
    }

    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Entry ${entryId} not found in environment ${environmentId}`
      )
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Error retrieving entry ${entryId} in environment ${environmentId}: ${error}`
      )
  }

  return null
}
