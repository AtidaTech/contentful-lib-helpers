import { getAllLocales } from './getAllLocales.js'
import { validateInputs } from '../validation/validateInputs.js'

/**
 * Returns the default Locale object
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful Environment object
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<import("contentful-management/dist/typings/entities/locale").Locale,import("contentful-management/dist/typings/entities/locale").LocaleProps|null>} locale - The default Locale object
 *
 * @example
 *
 * // Usage
 * import contentfulManagement from 'contentful-management'
 * const environment = await getEnvironment(contentfulManagement, 'access-token', 'space-id', 'environment-id')
 * const defaultLocale = await getDefaultLocale(environment, 2);
 * console.log(defaultLocale.code) // Outputs the default Locale object.
 */
export async function getDefaultLocale(environment, verbosityLevel = 1) {
  if (!(await validateInputs(environment, 'getLocales', verbosityLevel))) {
    return false
  }

  const environmentId = environment?.sys?.id ?? 'unknown'

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Getting default locale for environment: ${environmentId}`
    )

  try {
    const locales = await getAllLocales(environment, verbosityLevel)

    if (locales?.items?.length === 0) {
      console.error(
        `@@/ERROR: No locales found for environment ${environmentId}`
      )
      return null
    }

    const defaultLocale = locales.items.find(locale => locale.default)

    if (defaultLocale) {
      verbosityLevel > 1 &&
        console.log(
          `%%/DEBUG: Default locale for environment ${environmentId}: ${defaultLocale?.code}`
        )
      return defaultLocale
    }

    console.error(
      `@@/ERROR: Unable to find default locale for environment ${environmentId}`
    )
  } catch (error) {
    console.error(
      `@@/ERROR: Error retrieving locales for environment ${environmentId}: ${error}`
    )
  }

  return null
}
