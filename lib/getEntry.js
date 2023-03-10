/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment
 * @param {String} entryId
 * @param {Number} verbosityLevel
 * @returns {Promise<import("contentful-management/dist/typings/entities/entry").Entry|null>}
 */
export async function getEntry(environment, entryId, verbosityLevel = 1) {
  verbosityLevel > 1 &&
    console.log("%%/DEBUG: Entry '" + entryId + "' is going to be requested")

  try {
    return await environment.getEntry(entryId)
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return null
}
