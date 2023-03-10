import { getAllLocales } from './getAllLocales'

/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environmentSingleton
 * @param {Number} verbosityLevel
 * @returns {Promise<import("contentful-management/dist/typings/entities/locale").Locale,import("contentful-management/dist/typings/entities/locale").LocaleProps|null>}
 */
export async function getDefaultLocale(
  environmentSingleton,
  verbosityLevel = 1
) {
  verbosityLevel > 2 &&
    console.log('##/INFO: Default Locale is going to be requested')

  try {
    const listOfAllLocale = await getAllLocales(
      environmentSingleton,
      verbosityLevel
    )
    const listLength = listOfAllLocale?.items?.length ?? 0

    for (let i = 0; i < listLength; i++) {
      if (listOfAllLocale.items[i].default) {
        const defaultLocale = listOfAllLocale.items[i]

        verbosityLevel > 1 &&
          console.log(
            "%%/DEBUG: Default Locale '" +
              defaultLocale?.code +
              "' retrieved successfully!"
          )

        return defaultLocale
      }
    }

    verbosityLevel > 0 &&
      console.log('@@/ERROR: Impossible to retrieve Default Locale')
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return null
}
