// Used by contentful-cli-migrations 0.2.0
import { getAllLocales } from './getAllLocales.js'

/**
 * Returns an array with all Locale codes (ie: ['en-US', 'it-IT', 'de-DE'])
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful Environment object
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<Array<String>|[]>} arrayOfCodes - The array of Locale Codes (ie: ['en-US', 'it-IT', 'de-DE']) or empty array if not found.
 *
 * @example
 *
 * // Usage
 * import contentfulManagement from 'contentful-management'
 * const environment = await getEnvironment(contentfulManagement, 'access-token', 'space-id', 'environment-id')
 * const allCodes = await getAllLocaleCodes(environment, 2);
 * console.log(defaultLocaleCode) // Outputs the array of locale codes. ie: ['en-US', 'it-IT', 'de-DE']
 */
export async function getAllLocalesCode(environment, verbosityLevel = 1) {
  const environmentId = environment?.sys?.id ?? 'unknown'

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Getting all locale codes for environment: ${environmentId}`
    )

  try {
    const allLocales = await getAllLocales(environment, verbosityLevel)
    const allLocalesLength = allLocales?.items?.length ?? 0

    if (allLocales !== []) {
      let allLocalesCodes = []
      for (let i = 0; i < allLocalesLength; i++) {
        if (allLocales.items[i]?.code !== undefined) {
          allLocalesCodes.push(allLocales.items[i].code)
        }
      }
      return allLocalesCodes
    }
  } catch (error) {
    console.error(
      `@@/ERROR: Error retrieving all locale codes for environment ${environmentId}: ${error}`
    )
  }

  return []
}
