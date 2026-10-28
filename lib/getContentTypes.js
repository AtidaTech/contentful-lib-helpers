import { validateInputs } from './validation/validateInputs.js'

/**
 * Get all Content-types in a Contentful environment.
 *
 * @param {import("./client/types").HelperEnvironment} environment - The Contentful Environment object.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<import("./client/types").HelperCollection<import("./client/types").HelperContentType>>}
 *
 * @example
 *
 * Usage:
 * import contentfulManagement from 'contentful-management'
 * const environment = await getEnvironment(contentfulManagement, 'access-token', 'space-id', 'environment-id')
 * const contentTypes = await getContentTypes(environment, 2)
 * console.log(contentTypes) // ContentTypeCollection { sys: { type: 'Array' }, total: 3, skip: 0, limit: 100, items: [ {...}, {...}, {...} ] }
 */
export async function getContentTypes(environment, verbosityLevel = 1) {
  const emptyCollection = {
    sys: { type: 'Array' },
    total: 0,
    skip: 0,
    limit: 0,
    items: []
  }

  if (!(await validateInputs(environment, 'getContentTypes', verbosityLevel))) {
    return emptyCollection
  }

  const environmentId = environment?.sys?.id ?? 'unknown'

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Retrieving all Content-types in environment ${environmentId}`
    )

  try {
    const contentTypes = await environment.getContentTypes()

    verbosityLevel > 1 &&
      console.log(
        `%%/DEBUG: Found ${contentTypes?.items?.length} Content-types in environment ${environmentId}`
      )

    return contentTypes
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Error retrieving Content-types in environment ${environmentId}: ${error}`
      )
  }

  return emptyCollection
}
