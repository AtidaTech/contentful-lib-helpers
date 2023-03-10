/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment
 * @param {String} contentTypeId
 * @param {Number} limit
 * @param {Number} verbosityLevel
 * @returns {Promise<import("contentful-management/dist/typings/entities/entry").Entry[]|[]>}
 */
export async function getAllEntriesByContentType(
  environment,
  contentTypeId,
  limit = 1000,
  verbosityLevel = 1
) {
  const environmentId = environment?.sys?.id ?? null

  if (environmentId === null) {
    return []
  }

  verbosityLevel > 2 &&
    console.log(
      '##/INFO: Getting all Entries by Content-type: ' +
        contentTypeId +
        ' on Environment: ' +
        environmentId
    )

  // Initialize pagination values
  let entriesArray = [],
    shouldLoop = true,
    skip = 0

  do {
    const contentTypesArray = await environment
      ?.getEntries({
        content_type: contentTypeId,
        skip,
        limit
      })
      .catch(error => console.error('@@ERROR: ' + error))

    if (contentTypesArray?.items && contentTypesArray?.items?.length > 0) {
      entriesArray = entriesArray.concat(contentTypesArray?.items)
      skip += limit
    } else {
      shouldLoop = false
    }
  } while (shouldLoop)

  verbosityLevel > 1 &&
    console.log(
      '%%/DEBUG: Retrieved ' +
        entriesArray.length +
        ' Entries' +
        (verbosityLevel === 2
          ? ' of Content-type: ' +
            contentTypeId +
            ' on environment: ' +
            environmentId
          : '')
    )

  return entriesArray
}
