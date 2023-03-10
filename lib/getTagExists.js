/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environmentSingleton
 * @param {String} tagId
 * @param {Number} verbosityLevel
 * @returns {Promise<Boolean>}
 */
export async function getTagExists(
  environmentSingleton,
  tagId,
  verbosityLevel = 1
) {
  try {
    verbosityLevel > 1 &&
      console.log("%%/DEBUG: Tag '" + tagId + "' is going to be requested")
    const tag = await environmentSingleton.getTag(tagId)

    if (tag?.sys?.id !== tagId) {
      verbosityLevel > 2 &&
        console.log("##/INFO: Tag: '" + tagId + "' retrieved successfully!")

      return true
    }

    verbosityLevel > 0 &&
      console.log('@@/ERROR: Tag: ' + tagId + ' is empty or missing')
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return false
}
