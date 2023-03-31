import { getDefaultLocale } from './getDefaultLocale'
import { validateInputs } from './validation/validateInputs'
import { validateString } from './validation/validateString'
import { validateNumber } from './validation/validateNumber'

/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful environment object.
 * @param {string} contentTypeId - The ID of the content type to retrieve.
 * @param {string} fieldId - The ID of the unique field to search for.
 * @param {string} fieldValue - The value to search for in the unique field.
 * @param {string} [fieldLocale] - The locale to search in for the unique field. If not provided, the default locale will be used.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<string|null>}
 *

 * @example
 * // Find an Entry in a specific Content Type and locale by its unique identifier field
 * const cmaClass = require('contentful-management')
 * const environment = await getEnvironment(cmaClass, 'access-token', 'space-id', 'environment-id')
 * const contentTypeId = 'myContentType';
 * const fieldId = 'myUniqueIdentifierField';
 * const fieldValue = 'myUniqueIdentifierValue';
 * const fieldLocale = 'en-US';
 * const entryId = await getEntryIdByUniqueField(environment, contentTypeId, fieldId, fieldValue, fieldLocale);
 * console.log(entryId); // 'abc123'
 */
export async function getEntryIdByUniqueField(
  environment,
  contentTypeId,
  fieldId,
  fieldValue,
  fieldLocale,
  verbosityLevel = 1
) {
  const environmentId = environment?.sys?.id ?? null

  if (environmentId === null) {
    console.error('@@/ERROR: Invalid environment')
    return null
  }

  const validInputs =
    (await validateString(contentTypeId, 'contentTypeId')) &&
    (await validateString(fieldId, 'fieldId')) &&
    (await validateString(fieldValue, 'fieldValue')) &&
    (await validateInputs(environment, 'getEntries', verbosityLevel)) &&
    (await validateNumber(verbosityLevel, 'verbosityLevel', verbosityLevel))

  if (!validInputs) {
    console.error(
      `@@/ERROR: Validation error when retrieving entry ID for Content Type '${contentTypeId}' in Environment '${environmentId}'`
    )
    return null
  }

  if (!fieldLocale) {
    fieldLocale = (await getDefaultLocale())?.code ?? 'en-US'
  }

  verbosityLevel > 1 &&
    console.log(
      `%%/DEBUG: Request Entry with the following options: \n` +
        `- Content-type: ${contentTypeId}\n` +
        `- Locale: ${fieldLocale}\n` +
        `- Field: ${fieldId} with value: ${fieldValue}`
    )

  const options = {
    content_type: contentTypeId,
    [`fields.${fieldId}`]: fieldValue,
    locale: fieldLocale,
    limit: 1
  }

  try {
    const entries = await environment.getEntries(options)

    if (entries?.items?.[0]) {
      verbosityLevel > 2 &&
        console.log(
          `##/INFO: Entry '${entries.items[0]?.sys?.id}' retrieved successfully!`
        )

      return entries.items[0]?.sys?.id ?? null
    }

    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: No matching entry found for Content Type '${contentTypeId}' in Environment '${environmentId}'`
      )
  } catch (error) {
    verbosityLevel > 0 && console.error(`@@/ERROR: ${error}`)
  }

  return null
}
