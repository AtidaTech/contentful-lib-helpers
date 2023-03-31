import { getTagExists } from './getTagExists'
import { validateInputs } from './validation/validateInputs'
import { validateString } from './validation/validateString'

/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful Environment object
 * @param {string} entryId - The ID of the entry to remove the tag from.
 * @param {string} tagId - The ID of the tag to remove.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<boolean>} - A Promise that resolves with `true` if the tag was removed successfully, or `false` otherwise.
 *
 * @example
 *
 * Usage:
 * const cmaClass = require('contentful-management')
 * const environment = await getEnvironment(cmaClass, 'access-token', 'space-id', 'environment-id')
 * const entryId = 'exampleEntryId'
 * const tagId = 'exampleTagId'
 * const removed = await removeEntryTag(environment, entryId, tagId, 2)
 * console.log(removed) // true
 */
export async function removeEntryTag(
  environment,
  entryId,
  tagId,
  verbosityLevel = 1
) {
  if (
    !(await validateInputs(environment, 'getEntry', verbosityLevel)) ||
    !(await validateString(entryId, 'entryId')) ||
    !(await validateString(tagId, 'tagId'))
  ) {
    return false
  }

  const environmentId = environment?.sys?.id ?? 'unknown'

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Removing tag with ID ${tagId} from entry ${entryId} in environment ${environmentId}`
    )

  const tagExists = await getTagExists(environment, tagId, verbosityLevel)

  if (!tagExists) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Tag with ID ${tagId} does not exist in environment ${environmentId}.`
      )
    return false
  }

  try {
    const entry = await environment.getEntry(entryId)

    if (!entry || !entry.sys || !entry.sys.id) {
      verbosityLevel > 0 &&
        console.error(
          `@@/ERROR: The entry parameter with ID ${entryId} must be a valid Contentful entry object.`
        )
      return false
    }

    const tagsExisting = entry?.metadata?.tags ?? []
    const existingTagIds = tagsExisting.map(tag => tag?.sys?.id)

    if (!existingTagIds.includes(tagId)) {
      verbosityLevel > 1 &&
        console.log(
          `%%/DEBUG: Tag with ID ${tagId} does not exist on entry ${entryId} in environment ${environmentId}`
        )
      return true
    }

    if (entry?.metadata?.tags) {
      entry.metadata.tags = tagsExisting.filter(tag => tag.sys.id !== tagId)
      await entry.update()

      verbosityLevel > 1 &&
        console.log(
          `%%/DEBUG: Tag with ID ${tagId} removed from entry ${entryId} in environment ${environmentId}`
        )

      return true
    }

    verbosityLevel > 0 &&
      console.log(
        `@@/ERROR: Entry ${entryId} in ${environmentId} is empty or tags are missing`
      )
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Error removing tag with ID ${tagId} from entry ${entryId} in environment ${environmentId}: ${error}`
      )
  }

  return false
}
