import { validateString } from '../validation/validateString.js'

/**
 * Sync Scheduled actions between two environments
 *
 * @param {import("contentful-management/dist/typings/entities/space").Space} space - The Contentful Space object
 * @param {string} sourceEnvironmentId - The ID of the source Environment to sync actions from - usually 'master'.
 * @param {string} destinationEnvironmentId - The ID of the destination Environment to sync actions to.
 * @param {number} [verbosityLevel=1] - 0 = NONE, 1 = ERROR, 2 = DEBUG, 3 = INFO
 * @returns {Promise<void>}
 */
export async function syncScheduledActions(
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
    verbosityLevel > 0 &&
      console.error('@@/ERROR: Invalid Source or Destination Environments.')
    return
  }

  let isSourceEnvironmentError = false
  let sourceEnvironment = null
  try {
    sourceEnvironment = await space.getEnvironment(sourceEnvironmentId)
  } catch (e) {
    isSourceEnvironmentError = true
  }

  if (
    sourceEnvironmentId === '' ||
    sourceEnvironment === null ||
    sourceEnvironment.sys?.id !== sourceEnvironmentId ||
    isSourceEnvironmentError
  ) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Source Environment: '${sourceEnvironmentId}' does not exist.`
      )
    return
  }

  let isDestinationEnvironmentError = false
  let destinationEnvironment = null
  try {
    destinationEnvironment = await space.getEnvironment(
      destinationEnvironmentId
    )
  } catch (e) {
    isDestinationEnvironmentError = true
  }

  if (
    destinationEnvironmentId === '' ||
    destinationEnvironment === null ||
    destinationEnvironment.sys?.id !== destinationEnvironmentId ||
    isDestinationEnvironmentError
  ) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Destination Environment: '${sourceEnvironmentId}' does not exist.`
      )
    return
  }

  verbosityLevel > 2 &&
    console.log(
      `##/INFO: Syncing Scheduled actions from environment '${sourceEnvironmentId}' to environment '${destinationEnvironmentId}'`
    )

  const maxElementLimit = 500
  let scheduledActions = null

  await space
    .getScheduledActions({
      'environment.sys.id': sourceEnvironmentId,
      'sys.status': 'scheduled',
      limit: maxElementLimit
    })
    .then(actions => (scheduledActions = actions))
    .catch(e => verbosityLevel > 0 && console.error('@@/ERROR: ' + e))

  // Leaving this for debugging purpose in the CI output
  verbosityLevel > 2 &&
    console.log('##/INFO: Source EnvironmentId: ' + sourceEnvironmentId)
  verbosityLevel > 2 &&
    console.log(
      '##/INFO: Destination EnvironmentId: ' + destinationEnvironmentId
    )
  verbosityLevel > 2 &&
    console.log(
      '##/INFO: Total Scheduled Actions: ' + scheduledActions?.items?.length
    )

  for (let i = 0; i < scheduledActions?.items?.length; i++) {
    let scheduledItem = scheduledActions?.items[i]

    if (scheduledItem !== undefined) {
      await space
        .createScheduledAction({
          entity: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: scheduledItem?.entity?.sys?.id
            }
          },
          environment: {
            sys: {
              type: 'Link',
              linkType: 'Environment',
              id: destinationEnvironmentId
            }
          },
          action: scheduledItem?.action,
          scheduledFor: {
            datetime: scheduledItem?.scheduledFor?.datetime,
            timezone: scheduledItem?.scheduledFor?.timezone
          }
        })
        .then(
          scheduledAction => verbosityLevel > 1 && console.log(scheduledAction)
        )
        .catch(e => verbosityLevel > 0 && console.error('@@/ERROR: ' + e))
    }
  }
}
