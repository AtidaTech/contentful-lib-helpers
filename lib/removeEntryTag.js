/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment
 * @param {String} entryId
 * @param {String} tagId
 * @param {Number} verbosityLevel
 * @returns {Promise<Boolean>}
 */
export async function removeEntryTag(
  environment,
  entryId,
  tagId,
  verbosityLevel = 1
) {
  try {
    const entry = await environment.getEntry(entryId)
    const tagsExisting = entry?.metadata?.tags || []
    const tagsToKeep = tagsExisting.filter(tag => tag?.sys?.id !== tagId)

    if (entry?.metadata?.tags) {
      entry.metadata.tags = tagsToKeep
      verbosityLevel > 1 &&
        console.log(
          "%%/DEBUG: Tag '" + tagId + "' removed from Entry: " + entry?.sys?.id
        )

      await entry.update()
      verbosityLevel > 2 &&
        console.log('##/INFO: Entry: ' + entry?.sys?.id + ' updated')

      return true
    }

    verbosityLevel > 0 &&
      console.log(
        '@@/ERROR: Entry: ' + entryId + ' is empty or tags are missing'
      )
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return false
}
