/**
 * @param {import("contentful-management/dist/typings/contentful-management")} contentfulManagement
 * @param {String} contentfulToken
 * @param {String} contentfulSpaceId
 * @param {Number} verbosityLevel
 * @returns {Promise<import("contentful-management/dist/typings/entities/space").Space|null>}
 */
export async function getSpace(
  contentfulManagement,
  contentfulToken,
  contentfulSpaceId,
  verbosityLevel = 1
) {
  if (contentfulSpaceId === '') {
    verbosityLevel > 0 &&
      console.log('@@/ERROR: Space ID is empty or not valid')
    return null
  }

  try {
    const cmaClient = await contentfulManagement.createClient({
      accessToken: contentfulToken
    })

    verbosityLevel > 2 &&
      console.log(
        "##/INFO: Space: '" + contentfulSpaceId + "' is going to be requested"
      )

    const space = await cmaClient.getSpace(contentfulSpaceId)

    if (space?.sys?.id === contentfulSpaceId) {
      verbosityLevel > 1 &&
        console.log("%%/DEBUG: Space: '" + contentfulSpaceId + "' retrieved")

      return space
    }

    verbosityLevel > 0 &&
      console.error('@@/ERROR: Space not correctly retrieved')
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return null
}
