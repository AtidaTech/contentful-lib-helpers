/**
 * Enum to represent possible status values of an Entry
 * @readonly
 * @enum {string}
 */
const EntryStatus = {
  archived: 'archived',
  draft: 'draft',
  published: 'published',
  changed: 'changed',
  unknown: 'unknown'
}

/**
 * Extracts the status of a Contentful entry from its sys properties
 * @param {import("contentful-management/dist/typings/common-types").EntityMetaSysProps} entrySys - The sys properties of the entry
 * @returns {Promise<String>} - The status of the entry
 *
 * @example
 *
 * Usage:
 * import contentfulManagement from 'contentful-management'
 * const environment = await getEnvironment(contentfulManagement, 'access-token', 'space-id', 'environment-id')
 * const entry = await getEntry(environment, entryId)
 * const status = await extractStatusFromSys(entry.sys) // 'changed'
 */
export async function extractStatusFromSys(entrySys) {
  /**
   * If the sys properties are undefined or empty, return unknown
   */
  if (!entrySys || Object.keys(entrySys).length === 0) {
    return EntryStatus.unknown
  }

  /**
   * If the entity is archived, return archived
   */
  if (entrySys?.archivedAt !== undefined) {
    return EntryStatus.archived
  }

  /**
   * If the entity is a draft, return draft
   */
  if (entrySys?.publishedCounter === 0 || entrySys?.publishedAt === undefined) {
    return EntryStatus.draft
  }

  /**
   * If the entity is published, return published
   */
  if (entrySys?.publishedAt === entrySys?.updatedAt) {
    return EntryStatus.published
  }

  /**
   * If the entity is changed, return changed
   */
  return EntryStatus.changed
}
