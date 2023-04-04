import { getTagExists } from './getTagExists.js'
import { getEntry } from './getEntry.js'
import { validateInputs } from './validation/validateInputs.js'
import { validateString } from './validation/validateString.js'

/**
 * Add a tag to a Contentful entry.
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful environment object.
 * @param {string} entryId - The ID of the entry to add the tag to.
 * @param {string} tagId - The ID of the tag to add.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<boolean>} - A Promise that resolves with `true` if the tag was added successfully, or `false` otherwise.
 *
 * @example
 *
 * Usage:
 * import contentfulManagement from 'contentful-management'
 * const environment = await getEnvironment(contentfulManagement, 'access-token', 'space-id', 'environment-id')
 * const entryId = 'exampleEntryId'
 * const tagId = 'exampleTagId'
 * const added = await addEntryTag(environment, entryId, tagId, 2)
 * console.log(added) // true
 */
export async function addEntryTag(
  environment,
  entryId,
  tagId,
  verbosityLevel = 1
) {
  const environmentId = environment?.sys?.id ?? 'unknown'

  if (
    !(await validateInputs(environment, 'getEntry', verbosityLevel)) ||
    !(await validateString(entryId, 'entryId')) ||
    !(await validateString(tagId, 'tagId'))
  ) {
    return false
  }

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Adding tag with ID '${tagId}' to entry '${entryId}' in environment '${environmentId}'`
    )

  const tagExists = await getTagExists(environment, tagId, verbosityLevel)

  if (!tagExists) {
    console.error(
      `@@/ERROR: Tag with ID '${tagId}' does not exist in environment '${environmentId}'.`
    )
    return false
  }

  try {
    const entry = await getEntry(environment, entryId, verbosityLevel)

    if (!entry || typeof entry.update !== 'function') {
      console.error(
        `The entry parameter with ID '${entryId}' must be a valid Contentful entry object.`
      )
      return false
    }

    const tags = entry.metadata?.tags ?? []
    const existingTagIds = tags.map(tag => tag.sys.id)

    if (existingTagIds.includes(tagId)) {
      verbosityLevel > 1 &&
        console.log(
          `%%/DEBUG: Tag with ID '${tagId}' already exists on entry '${entryId}' in environment '${environmentId}'`
        )
      return true
    }

    const newTag = {
      sys: {
        type: 'Link',
        linkType: 'Tag',
        id: tagId
      }
    }

    entry.metadata.tags = [...tags, newTag]
    await entry.update()

    verbosityLevel > 1 &&
      console.log(
        `%%/DEBUG: Tag with ID '${tagId}' added to entry '${entryId}' in environment '${environmentId}'`
      )

    return true
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Error adding tag with ID '${tagId}' to entry '${entryId}' in environment '${environmentId}': ${error}`
      )
  }

  return false
}
