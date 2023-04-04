import { validateString } from './validation/validateString.js'

/**
 * Get a Contentful space by ID.
 *
 * @param {import("contentful-management/dist/typings/contentful-management").ContentfulManagement} contentfulManagement - The Contentful Management client.
 * @param {string} contentfulToken - The Contentful access token.
 * @param {string} contentfulSpaceId - The ID of the space to retrieve.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<import("contentful-management/dist/typings/entities/space").Space>} - A Promise that resolves with the Space object, or `null` if not found.
 *
 * @example
 *
 * Usage:
 * import contentfulManagement from 'contentful-management'
 * const contentfulToken = 'your-access-token'
 * const contentfulSpaceId = 'your-space-id'
 *
 * const space = await getSpace(contentfulManagement, contentfulToken, contentfulSpaceId, 2)
 * console.log(space) // { sys: { id: 'your-space-id', ... }, ... }
 */
export async function getSpace(
  contentfulManagement,
  contentfulToken,
  contentfulSpaceId,
  verbosityLevel = 1
) {
  if (
    !(await validateString(contentfulToken, 'contentfulToken')) ||
    !(await validateString(contentfulSpaceId, 'contentfulSpaceId'))
  ) {
    return null
  }

  if (verbosityLevel !== undefined && isNaN(verbosityLevel)) {
    console.error(`The verbosityLevel parameter must be a valid number.`)
    return null
  }

  verbosityLevel > 2 &&
    console.log(`##/INFO: Getting space '${contentfulSpaceId}' from Contentful`)

  try {
    const client = contentfulManagement.createClient({
      accessToken: contentfulToken
    })

    const space = await client.getSpace(contentfulSpaceId)

    if (space) {
      verbosityLevel > 1 &&
        console.log(
          `%%/DEBUG: Space '${contentfulSpaceId}' retrieved successfully`
        )

      return space
    }

    verbosityLevel > 0 &&
      console.error(`@@/ERROR: Space not found with ID '${contentfulSpaceId}'`)
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Error retrieving space '${contentfulSpaceId}': ${error}`
      )
  }

  return null
}
