import { getTagExists } from './getTagExists'

/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment
 * @param {String} entryId
 * @param {String} tagId
 * @param {Number} verbosityLevel
 * @returns {Promise<Boolean>}
 */
export async function addEntryTag(
  environment,
  entryId,
  tagId,
  verbosityLevel = 1
) {
  const tagExists = await getTagExists(environment, tagId, 0)

  if (!tagExists) {
    verbosityLevel > 0 &&
      console.log("@@/ERROR: Tag: '" + tagId + "' does not exists")
    return false
  }

  try {
    const entry = await environment.getEntry(entryId)
    const tag = {
      sys: {
        type: 'Link',
        linkType: 'Tag',
        id: tagId
      }
    }

    if (entry?.metadata?.tags) {
      entry.metadata.tags.push(tag)
      verbosityLevel > 1 &&
        console.log(
          "%%/DEBUG: New Tag '" + tagId + "' added to Entry: " + entry?.sys?.id
        )

      await entry.update()
      verbosityLevel > 2 &&
        console.log('##/INFO: Entry: ' + entry?.sys?.id + ' updated')

      return true
    }

    verbosityLevel > 0 &&
      console.log(
        "@@/ERROR: Entry: '" + entryId + "' is empty or tags are missing"
      )
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return false
}
