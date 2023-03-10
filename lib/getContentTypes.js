/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environmentSingleton
 * @param {Number} verbosityLevel
 * @returns {Promise<import("contentful-management/dist/typings/common-types").Collection<import("contentful-management/dist/typings/entities/content-type").ContentType, import("contentful-management/dist/typings/entities/content-type").ContentTypeProps> | []>}
 */
export async function getContentTypes(
  environmentSingleton,
  verbosityLevel = 1
) {
  verbosityLevel > 2 &&
    console.log('##/INFO: Getting all the Content-types from Contentful')

  try {
    const contentTypes = await environmentSingleton.getContentTypes()

    verbosityLevel > 1 &&
      contentTypes?.items?.length > 0 &&
      console.log('%%/DEBUG: Content-types list retrieved successfully!')

    return contentTypes
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return []
}
