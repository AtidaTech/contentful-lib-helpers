/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment
 * @param {Number} verbosityLevel
 * @returns {Promise<import("contentful-management/dist/typings/common-types").Collection<import("contentful-management/dist/typings/entities/locale").Locale, import("contentful-management/dist/typings/entities/locale").LocaleProps> | []>}
 */
export async function getAllLocales(environment, verbosityLevel = 1) {
  verbosityLevel > 2 &&
    console.log('##/INFO: Getting all Locales from Contentful')

  try {
    const allLocales = await environment.getLocales()

    verbosityLevel > 1 &&
      allLocales?.items?.length > 0 &&
      console.log('%%/DEBUG: Locales list retrieved successfully!')

    return allLocales
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return []
}
