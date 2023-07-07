import { validateString } from '../validation/validateString.js'

/**
 * Get all locales for a given environment
 *
 * @param {import("contentful-management/dist/typings/entities/space").Space} space - The Contentful Space object
 * @param {string} sourceEnvironmentId - The ID of the source Environment to create the new environment from - usually 'master'.
 * @param {string} destinationEnvironmentId - The ID of the destination Environment that needs to be created.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<import("contentful-management/dist/typings/entities/environment").Environment|null>} - A Promise that resolves with the duplicated environment object, or `null` if not found.
 *
 * @example
 *
 * // Usage:
 * import contentfulManagement from 'contentful-management'
 * const space = await getSpace(contentfulManagement, 'access-token', 'space-id')
 * const duplicatedEnv = await duplicateEnvironment(space, 'master', 'release-x.y.z', 2);
 * console.log(duplicatedEnv?.sys?.id); // release-x.y.z
 */
export async function duplicateEnvironment(
  space,
  sourceEnvironmentId = 'master',
  destinationEnvironmentId = 'master-backup',
  verbosityLevel = 1
) {
  if (
    !(await validateString(sourceEnvironmentId, 'sourceEnvironmentId')) ||
    !(await validateString(
      destinationEnvironmentId,
      'destinationEnvironmentId'
    ))
  ) {
    return null
  }

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Duplicate environment '${sourceEnvironmentId} for space '${space?.sys?.id}'`
    )

  try {
    const existingEnvironments = (await space.getEnvironments())?.items ?? []

    if (!existingEnvironments.empty()) {
      let duplicatedEnvironment
      // If the destination environment already exists,
      // we go to next step to check it's available
      if (
        typeof existingEnvironments.find(
          environment => environment.name === destinationEnvironmentId
        ) !== 'undefined'
      ) {
        verbosityLevel > 2 &&
          console.log(
            '##/INFO: An environment with this name already exists: ' +
              destinationEnvironmentId +
              '. Skipping creation'
          )
        duplicatedEnvironment = await space.getEnvironment(
          destinationEnvironmentId
        )
      } else {
        // Otherwise we create that new release environment
        verbosityLevel > 1 &&
          console.log(
            '%%/DEBUG: Creating new environment ' + destinationEnvironmentId
          )

        await space
          .createEnvironmentWithId(
            destinationEnvironmentId,
            { name: destinationEnvironmentId },
            sourceEnvironmentId
          )
          .then(environment => (duplicatedEnvironment = environment))
          .catch(error => {
            verbosityLevel > 0 &&
              console.error(
                '@@/ERROR: There was a problem creating the environment ' +
                  destinationEnvironmentId
              )
            verbosityLevel > 0 &&
              console.error(
                "@@/ERROR: It might be that you don't have any free environment slots to create a new one!"
              )
            process.exit(1)
          })
        verbosityLevel > 2 &&
          console.log(
            '##/INFO: Environment ' +
              destinationEnvironmentId +
              ' successfully created'
          )
      }

      return duplicatedEnvironment
    }

    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: There are no Environments in Space '${space?.sys?.id}'`
      )
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(`@@/ERROR: Error duplicating Environment: ${error}`)
  }

  return null
}
