import { validateInputs } from './validation/validateInputs'
import { validateString } from './validation/validateString'

/**
 * Gets a Contentful content-type object by ID.
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful environment object.
 * @param {string} contentTypeId - The ID of the content-type to retrieve.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<import("contentful-management/dist/typings/entities/content-type").ContentType|null>} - A Promise that resolves with the content-type object if it exists, or `null` otherwise.
 *
 * @example
 *
 * Usage:
 * const cmaClass = require('contentful-management')
 * const environment = await getEnvironment(cmaClass, 'access-token', 'space-id', 'environment-id')
 * const contentTypeId = 'exampleContentTypeId'
 * const contentType = await getContentType(environment, contentTypeId, 2)
 * console.log(contentType) // {sys: {...}, ...}
 */
export async function getContentType(
  environment,
  contentTypeId,
  verbosityLevel = 1
) {
  if (
    !(await validateInputs(environment, 'getContentType', verbosityLevel)) ||
    !(await validateString(contentTypeId, 'contentTypeId'))
  ) {
    return null
  }

  const environmentId = environment?.sys?.id ?? 'unknown'

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Retrieving content-type ${contentTypeId} in environment ${environmentId}`
    )

  try {
    const contentType = await environment.getContentType(contentTypeId)

    if (contentType) {
      verbosityLevel > 1 &&
        console.log(
          `%%/DEBUG: Content-type ${contentTypeId} retrieved successfully in environment ${environmentId}`
        )

      return contentType
    }

    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Content-type ${contentTypeId} not found in environment ${environmentId}`
      )
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Error retrieving content-type ${contentTypeId} in environment ${environmentId}: ${error}`
      )
  }

  return null
}
