import { getEntry } from './getEntry.js'
import { validateInputs } from './validation/validateInputs.js'
import { validateString } from './validation/validateString.js'

/**
 * Publishes a Contentful entry.
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful environment object.
 * @param {string} entryId - The ID of the entry to publish.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<boolean>} - A Promise that resolves with `true` if the entry was published successfully, or `false` otherwise.
 *
 * @example
 *
 * Usage:
 * import contentfulManagement from 'contentful-management'
 * const environment = await getEnvironment(contentfulManagement, 'access-token', 'space-id', 'environment-id')
 * const entryId = 'exampleEntryId'
 * const entry = await getEntry(environment, entryId)
 * entry.fields.exampleField['en-US'] = 'New value'
 * entry.update()
 * const published = await publishEntry(environment, entryId, 2)
 * console.log(published) // true
 */
export async function publishEntry(environment, entryId, verbosityLevel = 1) {
  if (
    !(await validateInputs(environment, 'getEntry', verbosityLevel)) ||
    !(await validateString(entryId, 'entryId'))
  ) {
    return false
  }

  const environmentId = environment?.sys?.id ?? 'unknown'

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Publishing entry ${entryId} in environment ${environmentId}`
    )

  try {
    const entry = await getEntry(environment, entryId, verbosityLevel)

    if (entry) {
      await entry.publish()

      verbosityLevel > 1 &&
        console.log(
          `%%/DEBUG: Entry ${entryId} published successfully in environment ${environmentId}`
        )

      return true
    }

    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Entry ${entryId} not found in environment ${environmentId}`
      )
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Error publishing entry ${entryId} in environment ${environmentId}: ${error}`
      )
  }

  return false
}
