import { validateInputs } from './validation/validateInputs.js'

/**
 * Get all locales for a given environment
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful Environment object
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<import("contentful-management").Collection<import("contentful-management").Locale>>} - An array of Locale objects
 *
 * @example
 *
 * // Usage:
 * import contentfulManagement from 'contentful-management'
 * const environment = await getEnvironment(contentfulManagement, 'access-token', 'space-id', 'environment-id')
 * const locales = await getAllLocales(environment, 2);
 * console.log(locales.items);
 */

export async function getAllLocales(environment, verbosityLevel = 1) {
  if (!(await validateInputs(environment, 'getLocales', verbosityLevel))) {
    return []
  }

  const environmentId = environment?.sys?.id ?? 'unknown'

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Getting all locales for environment '${environmentId}'`
    )

  try {
    const locales = await environment.getLocales()

    if (locales?.items?.length > 0) {
      verbosityLevel > 1 &&
        console.log(
          `%%/DEBUG: '${locales.items.length}' Locales retrieved successfully for environment '${environmentId}'`
        )

      return locales
    }

    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: No locales found for environment '${environmentId}'`
      )
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Retrieving locales for environment '${environmentId}': ${error}`
      )
  }

  return []
}
