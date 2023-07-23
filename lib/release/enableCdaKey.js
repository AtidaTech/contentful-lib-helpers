import { validateString } from '../validation/validateString.js'

/**
 * cdaKeyName and environment with the same name should exist
 *
 * @param {import("contentful-management/dist/typings/entities/space").Space} space - The Contentful Space object
 * @param {String} cdaKeyName
 * @param {String} targetEnvironmentId
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<Boolean>}
 */
export async function enableCdaKey(
  space,
  cdaKeyName,
  targetEnvironmentId,
  verbosityLevel = 1
) {
  if (
    !(await validateString(cdaKeyName, 'cdaKeyName')) ||
    !(await validateString(targetEnvironmentId, 'targetEnvironmentId'))
  ) {
    return false
  }

  let apiKeyArray, singleApiKey
  try {
    apiKeyArray = await space.getApiKeys()
  } catch (exception) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + exception)
    return false
  }

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Enabling CDA Key '${cdaKeyName} for Environment '${targetEnvironmentId}'`
    )

  // The name of the API Key has to match the environment-id
  // Example 'master' environment has 'Master' API Key
  const masterApiKey = apiKeyArray.items.find(
    item => item.name.toLowerCase() === cdaKeyName.toLowerCase()
  )?.sys?.id

  if (masterApiKey) {
    try {
      singleApiKey = await space.getApiKey(masterApiKey)
    } catch (exception) {
      verbosityLevel > 0 && console.error('@@/ERROR: ' + exception)
      return false
    }

    const newEnvironment = {
      sys: {
        type: 'Link',
        linkType: 'Environment',
        id: targetEnvironmentId
      }
    }

    singleApiKey.environments.push(newEnvironment)
    try {
      const updatedKey = await singleApiKey.update()
      return updatedKey?.name.toLowerCase() === cdaKeyName.toLowerCase()
    } catch (exception) {
      verbosityLevel > 0 && console.error('@@/ERROR: ' + exception)
      return false
    }
  } else {
    return false
  }
}
