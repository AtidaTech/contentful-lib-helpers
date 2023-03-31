import { getEntry } from './getEntry'
import { validateInputs } from './validation/validateInputs'
import { validateString } from './validation/validateString'

/**
 * Unpublishes a Contentful entry.
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful environment object.
 * @param {string} entryId - The ID of the entry to unpublish.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<boolean>} - A Promise that resolves with `true` if the entry was unpublished successfully, or `false` otherwise.
 *
 * @example
 *
 * Usage:
 * const cmaClass = require('contentful-management')
 * const environment = await getEnvironment(cmaClass, 'access-token', 'space-id', 'environment-id')
 * const entryId = 'exampleEntryId'
 * const unpublished = await unpublishEntry(environment, entryId, 2)
 * console.log(unpublished) // true
 */
export async function unpublishEntry(environment, entryId, verbosityLevel = 1) {
  if (
    !(await validateInputs(environment, 'getEntry', verbosityLevel)) ||
    !(await validateString(entryId, 'entryId'))
  ) {
    return false
  }

  const environmentId = environment?.sys?.id ?? 'unknown'

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Unpublishing entry ${entryId} in environment ${environmentId}`
    )

  try {
    const entry = await getEntry(environment, entryId, verbosityLevel)

    if (entry) {
      await entry.unpublish()

      verbosityLevel > 1 &&
        console.log(
          `%%/DEBUG: Entry ${entryId} unpublished successfully in environment ${environmentId}`
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
        `@@/ERROR: Error unpublishing entry ${entryId} in environment ${environmentId}: ${error}`
      )
  }

  return false
}
