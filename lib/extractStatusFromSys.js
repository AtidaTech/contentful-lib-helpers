const EntityStatus = {
  archived: 'archived',
  draft: 'draft',
  published: 'published',
  changed: 'changed',
  unknown: 'unknown'
}

/**
 * @param {import("contentful-management/dist/typings/common-types").EntityMetaSysProps} entrySys
 * @returns {Promise<String>}
 */
export async function extractStatusFromSys(entrySys) {
  if (!entrySys || Object.keys(entrySys).length === 0) {
    return EntityStatus.unknown
  }

  if (entrySys?.archivedAt !== undefined) {
    return EntityStatus.archived
  }

  if (entrySys?.publishedCounter === 0 || entrySys?.publishedAt === undefined) {
    return EntityStatus.draft
  }

  if (entrySys?.publishedAt === entrySys?.updatedAt) {
    return EntityStatus.published
  } else {
    return EntityStatus.changed
  }
}
