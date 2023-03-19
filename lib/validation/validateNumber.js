/**
 * Validates that a given input is a positive integer.
 * @param value - The input to validate.
 * @param {string} parameterName - The name of the input parameter (for error messages).
 * @returns {Promise<boolean>} - Returns true if the input is a positive integer, false otherwise.
 */
export async function validateNumber(value, parameterName) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    console.error(`@@/ERROR: ${parameterName} must be a positive integer.`)
    return false
  }
  return true
}
