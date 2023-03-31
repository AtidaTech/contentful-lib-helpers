import { getSpace } from './getSpace'
import { validateString } from './validation/validateString'

/**
 * Get a Contentful environment object by ID.
 *
 * @param {import("contentful-management/dist/typings/contentful-management")} contentfulManagement - The Contentful Management API object.
 * @param {String} contentfulToken - The Contentful Management API token.
 * @param {String} contentfulSpaceId - The Contentful Space ID.
 * @param {String} [contentfulEnvironmentId='master'] - The Contentful Environment ID.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<import("contentful-management/dist/typings/entities/environment").Environment|null>} - A Promise that resolves with the environment object, or `null` if not found.
 *
 * @example
 *
 * Usage:
 * const contentfulManagement = getContentfulManagement()
 * const contentfulToken = 'myContentfulToken'
 * const contentfulSpaceId = 'myContentfulSpaceId'
 * const contentfulEnvironmentId = 'myContentfulEnvironmentId'
 *
 * const environment = await getEnvironment(contentfulManagement, contentfulToken, contentfulSpaceId, contentfulEnvironmentId, 2)
 * console.log(environment) // { sys: { id: 'myContentfulEnvironmentId', ... }, ... }
 */
export async function getEnvironment(
  contentfulManagement,
  contentfulToken,
  contentfulSpaceId,
  contentfulEnvironmentId = 'master',
  verbosityLevel = 1
) {
  if (
    !(await validateString(contentfulToken, 'contentfulToken')) ||
    !(await validateString(contentfulSpaceId, 'contentfulSpaceId')) ||
    !(await validateString(contentfulEnvironmentId, 'contentfulEnvironmentId'))
  ) {
    return null
  }

  if (verbosityLevel !== undefined && isNaN(verbosityLevel)) {
    console.error(`The verbosityLevel parameter must be a valid number.`)
    return null
  }

  try {
    const space = await getSpace(
      contentfulManagement,
      contentfulToken,
      contentfulSpaceId
    )

    if (space) {
      const environment = await space.getEnvironment(contentfulEnvironmentId)

      if (environment?.sys?.id === contentfulEnvironmentId) {
        verbosityLevel > 1 &&
          console.log(
            `%%/DEBUG: Environment ${contentfulEnvironmentId} retrieved successfully`
          )

        return environment
      }
    }

    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Unable to retrieve environment ${contentfulEnvironmentId}`
      )
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(`@@/ERROR: Error retrieving environment: ${error}`)
  }

  return null
}
