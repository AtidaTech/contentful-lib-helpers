import { validateInputs } from './validation/validateInputs.js'

/**
 * Get all the tags set up for an Environment
 *
 * @param {import("./client/types").HelperEnvironment} environment - The Contentful environment object.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<import("./client/types").HelperCollection<import("./client/types").HelperTag>>}
 */
export async function getAllEntryTags(environment, verbosityLevel = 1) {
  const environmentId = environment?.sys?.id ?? null
  const emptyTags = {
    sys: { type: 'Array' },
    total: 0,
    skip: 0,
    limit: 100,
    items: []
  }

  if (environmentId === null) {
    console.error('@@/ERROR: Invalid environment')
    return emptyTags
  }

  if (!(await validateInputs(environment, 'getTags', verbosityLevel))) {
    return emptyTags
  }

  verbosityLevel > 2 &&
    console.log(`##/INFO: Retrieving all Tags in environment ${environmentId}`)
  try {
    const allTags = await environment.getTags()

    verbosityLevel > 1 &&
      console.log(
        `%%/DEBUG: Found ${allTags?.items?.length} Tags in environment ${environmentId}`
      )

    return allTags
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Error retrieving Tags in environment ${environmentId}: ${error}`
      )
  }

  return emptyTags
}
