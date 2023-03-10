import { getDefaultLocale } from './getDefaultLocale'

/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment
 * @param {String} contentTypeId
 * @param {String} fieldId
 * @param {String} fieldValue
 * @param {String|null} fieldLocale
 * @param {Number} verbosityLevel
 * @returns {Promise<string | null>}
 */
export async function getEntryIdByUniqueField(
  environment,
  contentTypeId,
  fieldId,
  fieldValue,
  fieldLocale,
  verbosityLevel = 1
) {
  if (!fieldLocale) {
    fieldLocale = (await getDefaultLocale())?.code ?? 'en-US'
  }

  verbosityLevel > 1 &&
    console.log(
      '%%/DEBUG: Request Entry with the following options: \n' +
        '- Content-type: ' +
        contentTypeId +
        '\n' +
        '- Locale: ' +
        fieldLocale +
        '\n' +
        '- Field: ' +
        fieldId +
        ' with value: ' +
        fieldValue
    )

  const options = {
    content_type: contentTypeId,
    ['fields.' + fieldId]: fieldValue,
    locale: fieldLocale,
    limit: 1
  }

  try {
    const entries = await environment.getEntries(options)

    if (entries?.items?.[0]) {
      verbosityLevel > 2 &&
        console.log(
          "##/INFO: Entry: '" +
            entries?.items?.[0]?.sys?.id +
            "' retrieved successfully!"
        )

      return entries?.items?.[0]?.sys?.id ?? null
    }

    verbosityLevel > 0 &&
      console.log('@@/ERROR: Impossible to retrieve an Entry that matches')
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return null
}
