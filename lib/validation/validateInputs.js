import { validateString } from './validateString.js'

/**
 * Validate the inputs to a function
 *
 * @param {import("contentful-management/dist/typings/entities/environment").Environment} environment - The Contentful environment object.
 * @param {string} functionName - Name of the function to validate.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 */
export async function validateInputs(
  environment,
  functionName,
  verbosityLevel = 1
) {
  const environmentId = environment?.sys?.id ?? 'unknown'

  if (!(await validateString(functionName, 'functionName'))) {
    return false
  }

  if (
    verbosityLevel !== undefined &&
    (typeof verbosityLevel !== 'number' || isNaN(verbosityLevel))
  ) {
    console.error(
      `@@/ERROR: The verbosityLevel parameter must be a valid number.`
    )
    return false
  }

  if (!environment || typeof environment[functionName] !== 'function') {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: The environment parameter with ID ${environmentId} must be a valid Contentful environment object.`
      )
    return false
  }

  return true
}
