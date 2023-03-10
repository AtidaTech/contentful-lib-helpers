/**
 * @param {import("contentful-management/dist/typings/entities/environment").Environment?} environment
 * @param {String[]} forbiddenEnvironments
 * @param {Number} verbosityLevel
 * @returns {Promise<boolean>}
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
        "@@/ERROR: Environment: '" + environmentId + "' is protected"
      )
    verbosityLevel > 0 && console.error('@@/ERROR: It will NOT be deleted!')
    return false
  }

  try {
    if (environment === null) {
      verbosityLevel > 0 &&
        console.error(
          "@@/ERROR: Cannot perform 'delete' on an invalid Environment"
        )
      return false
    }

    verbosityLevel > 2 &&
      console.log(
        "##/INFO: Environment '" + environmentId + "' is going to be deleted"
      )

    await environment?.delete()

    verbosityLevel > 1 &&
      console.log("%%/DEBUG: Environment: '" + environmentId + "' deleted!")

    return true
  } catch (error) {
    verbosityLevel > 0 && console.error('@@/ERROR: ' + error)
  }

  return false
}
