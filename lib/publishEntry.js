import { getEntry } from './getEntry'
/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment
 * @param {String} entryId
 * @param {Number} verbosityLevel
 * @returns {Promise<Boolean>}
 */
export async function publishEntry(environment, entryId, verbosityLevel = 1) {
  try {
    const entry = await getEntry(environment, entryId, verbosityLevel)

    if (entry) {
      verbosityLevel > 1 &&
        console.log("%%/DEBUG: Entry '" + entryId + "' retrieved successfully!")

      await entry.publish()

      verbosityLevel > 2 &&
        console.log("##/INFO: Entry: '" + entryId + "' published successfully!")

      return true
    }

    verbosityLevel > 0 &&
      console.log("@@/ERROR: Entry: '" + entryId + "' is empty or invalid")
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return false
}
