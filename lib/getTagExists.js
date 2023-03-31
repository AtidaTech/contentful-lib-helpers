import { validateInputs } from './validation/validateInputs'
import { validateString } from './validation/validateString'

/**
 * Check if a tag exists in a Contentful environment.
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful Environment object.
 * @param {string} tagId - The ID of the tag to check.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<boolean>} - A Promise that resolves with `true` if the tag exists, or `false` otherwise.
 *
 * @example
 *
 * Usage:
 * const cmaClass = require('contentful-management')
 * const environment = await getEnvironment(cmaClass, 'access-token', 'space-id', 'environment-id')
 * const tagId = 'exampleTagId'
 * const exists = await getTagExists(environment, tagId, 2)
 * console.log(exists) // true
 */
export async function getTagExists(environment, tagId, verbosityLevel = 1) {
  if (
    !(await validateInputs(environment, 'getTag', verbosityLevel)) ||
    !(await validateString(tagId, 'tagId'))
  ) {
    return false
  }

  const environmentId = environment?.sys?.id ?? 'unknown'

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Checking if tag with ID ${tagId} exists in environment ${environmentId}`
    )

  try {
    const tag = await environment.getTag(tagId)

    if (tag?.sys?.id !== tagId) {
      verbosityLevel > 1 &&
        console.log(
          `%%/DEBUG: Tag with ID ${tagId} found in environment ${environmentId}`
        )
      return true
    }

    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Tag with ID ${tagId} not found in environment ${environmentId}`
      )
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Error checking tag with ID ${tagId} in environment ${environmentId}: ${error}`
      )
  }

  return false
}
