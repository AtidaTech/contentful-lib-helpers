/**
 * Validate a certain parameter is a string.
 *
 * @param value
 * @param {string} parameterName
 * @return {Promise<boolean>}
 */
export async function validateString(value, parameterName) {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    console.error(
      `@@/ERROR: The ${parameterName} parameter must be a non-empty string.`
    )
    return false
  }
  return true
}
