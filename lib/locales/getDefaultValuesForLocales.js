// Used by contentful-cli-migrations 0.2.0
import { getAllLocalesCode } from './getAllLocalesCode.js'

/**
 * It builds an object with all the locale codes as keys, and the passed default value.
 * This is useful for writing locale-agnostic contentful migrations, where locale is
 * needed for default-values when adding/creating a field. Since the locale mapping is
 * generated dynamically, you could apply the same migration to a space with locales
 * ['en-US', 'it-IT] and another one with ['de-DE', 'de-AT']
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful Environment object
 * @param {any} defaultValue - The value that will be used for the default value object
 * @return {Promise<Object>}
 */
export async function getDefaultValuesForLocales(environment, defaultValue) {
  const localeList = await getAllLocalesCode(environment, 1)

  let resultObject = {}

  for (let i = 0; i < localeList.length; i++) {
    resultObject[localeList[i]] = defaultValue
  }

  return resultObject
}
