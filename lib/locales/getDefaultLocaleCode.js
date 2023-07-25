// Used by contentful-cli-migrations 0.2.0
import { getDefaultLocale } from './getDefaultLocale.js'

/**
 * Returns the default Locale identified (ie: 'en-US')
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful Environment object
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<string|null>} localeCode - The default Locale Code (ie: 'en-US') or null if not found.
 *
 * @example
 *
 * // Usage
 * import contentfulManagement from 'contentful-management'
 * const environment = await getEnvironment(contentfulManagement, 'access-token', 'space-id', 'environment-id')
 * const defaultLocaleCode = await getDefaultLocaleCode(environment, 2);
 * console.log(defaultLocaleCode) // Outputs the code of the default Locale. ie: 'en-US'
 */
export async function getDefaultLocaleCode(environment, verbosityLevel = 1) {
  const environmentId = environment?.sys?.id ?? 'unknown'

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Getting default locale code for environment: ${environmentId}`
    )

  try {
    const defaultLocale = await getDefaultLocale(environment, verbosityLevel)

    if (defaultLocale !== null && defaultLocale?.code !== undefined) {
      return defaultLocale.code
    }
  } catch (error) {
    console.error(
      `@@/ERROR: Error retrieving default locale code for environment ${environmentId}: ${error}`
    )
  }

  return null
}
