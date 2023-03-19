/**
 * Enum to represent possible status values of an entity
 * @readonly
 * @enum {string}
 */
const EntityStatus = {
  archived: 'archived',
  draft: 'draft',
  published: 'published',
  changed: 'changed',
  unknown: 'unknown'
}

/**
 * Extracts the status of a Contentful entity from its sys properties
 * @param {import("contentful-management/dist/typings/common-types").EntityMetaSysProps} entrySys - The sys properties of the entity
 * @returns {Promise<String>} - The status of the entity
 *
 * @example
 *
 * Usage:
 * const environment = await contentful.getEnvironment(environmentId)
 * const entry = await getEntry(environment, entryId)
 * const status = await extractStatusFromSys(entry.sys) // 'changed'
 */
export async function extractStatusFromSys(entrySys) {
  /**
   * If the sys properties are undefined or empty, return unknown
   */
  if (!entrySys || Object.keys(entrySys).length === 0) {
    return EntityStatus.unknown
  }

  /**
   * If the entity is archived, return archived
   */
  if (entrySys?.archivedAt !== undefined) {
    return EntityStatus.archived
  }

  /**
   * If the entity is a draft, return draft
   */
  if (entrySys?.publishedCounter === 0 || entrySys?.publishedAt === undefined) {
    return EntityStatus.draft
  }

  /**
   * If the entity is published, return published
   */
  if (entrySys?.publishedAt === entrySys?.updatedAt) {
    return EntityStatus.published
  }

  /**
   * If the entity is changed, return changed
   */
  return EntityStatus.changed
}
