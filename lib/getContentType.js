/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environmentSingleton
 * @param {String} contentTypeId
 * @param {Number} verbosityLevel
 * @returns {Promise<import("contentful-management/dist/typings/entities/content-type").ContentType|null>}
 */
export async function getContentType(
  environmentSingleton,
  contentTypeId,
  verbosityLevel = 1
) {
  verbosityLevel > 2 &&
    console.log(
      "##/INFO: Content-type: '" + contentTypeId + "' is going to be requested"
    )

  try {
    const contentType = await environmentSingleton.getContentType(contentTypeId)

    verbosityLevel > 1 &&
      contentType?.sys?.id &&
      console.log(
        "%%/DEBUG: Content-type '" + contentTypeId + "' retrieved successfully!"
      )

    return contentType
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return null
}
