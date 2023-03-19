/**
 * Deletes the given Contentful environment, unless it is protected.
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The environment to delete.
 * @param {string[]} forbiddenEnvironments - An array of environment IDs that are protected and cannot be deleted.
 * @param {number} [verbosityLevel=1] - The level of verbosity of the console logs. A higher number means more logs.
 * @returns {Promise<boolean>} - True if the environment was successfully deleted, false otherwise.
 *
 * @example
 *
 * Usage:
 * // Deleting an environment with the default configuration
 * const environment = await contentful.getEnvironment(environmentId)
 * const result = await deleteEnvironment(environment)
 * // Deleting an environment with custom configuration
 * const environment = await contentful.getEnvironment(environmentId)
 * const result = await deleteEnvironment(environment, ['test', 'prod'], 2)
 */
export async function deleteEnvironment(
  environment,
  forbiddenEnvironments = ['dev', 'uat', 'staging', 'master'],
  verbosityLevel = 1
) {
  const environmentId = environment?.sys?.id ?? null

  if (forbiddenEnvironments.includes(environmentId)) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Environment '${environmentId}' is protected and cannot be deleted.`
      )
    return false
  }

  try {
    if (environment === null) {
      verbosityLevel > 0 &&
        console.error(
          `@@/ERROR: Cannot perform 'delete' on an invalid Environment '${environmentId}'.`
        )
      return false
    }

    verbosityLevel > 2 &&
      console.log(`##/INFO: Deleting environment '${environmentId}'.`)

    await environment?.delete()

    verbosityLevel > 1 &&
      console.log(`%%/DEBUG: Environment '${environmentId}' was deleted.`)

    return true
  } catch (error) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Error deleting environment '${environmentId}': ${error}`
      )
  }

  return false
}
