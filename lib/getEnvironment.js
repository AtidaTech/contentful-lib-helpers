import { getSpace } from './getSpace'

/**
 * @param {import("contentful-management/dist/typings/contentful-management")} contentfulManagement
 * @param {String} contentfulToken
 * @param {String} contentfulSpaceId
 * @param {String} contentfulEnvironmentId
 * @param {Number} verbosityLevel
 * @returns {Promise<import("contentful-management/dist/typings/entities/environment").Environment|null>}
 */
export async function getEnvironment(
  contentfulManagement,
  contentfulToken,
  contentfulSpaceId,
  contentfulEnvironmentId,
  verbosityLevel = 1
) {
  try {
    const space = await getSpace(
      contentfulManagement,
      contentfulToken,
      contentfulSpaceId
    )

    if (space) {
      if (contentfulEnvironmentId === '') {
        verbosityLevel > 0 &&
          console.log('@@/ERROR: Environment ID is empty or not valid')
        return null
      }

      verbosityLevel > 2 &&
        console.log(
          "##/INFO: Environment: '" +
            contentfulEnvironmentId +
            "' is going to be requested"
        )

      const environment = await space.getEnvironment(contentfulEnvironmentId)

      if (environment?.sys?.id === contentfulEnvironmentId) {
        verbosityLevel > 1 &&
          console.log(
            "%%/DEBUG: Environment: '" + contentfulEnvironmentId + "' retrieved"
          )

        return environment
      }
    }

    verbosityLevel > 0 &&
      console.error('@@/ERROR: Environment not correctly retrieved')
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return null
}
