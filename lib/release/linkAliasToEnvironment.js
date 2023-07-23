import { validateString } from '../validation/validateString.js'
import { deleteEnvironment } from '../deleteEnvironment.js'
import { getEnvironment } from '../getEnvironment.js'
import { orderBy } from 'natural-orderby'

export async function linkAliasToEnvironment(
  space,
  sourceEnvironmentId = 'environment',
  destinationAliasId = 'master',
  releaseRegEx = 'release-[0-9]+[\\.]*[0-9]*[\\.]*[0-9]*',
  deleteOldReleases = false,
  verbosityLevel = 1
) {
  if (
    !(await validateString(sourceEnvironmentId, 'sourceEnvironmentId')) ||
    !(await validateString(destinationAliasId, 'destinationAliasId'))
  ) {
    verbosityLevel > 0 &&
      console.error(
        '@@/ERROR: Invalid Source Environment or Destination Alias.'
      )
    return
  }

  const sourceEnvironment = await space.getEnvironment(sourceEnvironmentId)
  if (
    sourceEnvironmentId === '' ||
    sourceEnvironment === null ||
    sourceEnvironment.sys?.id !== sourceEnvironmentId
  ) {
    verbosityLevel > 0 &&
      console.error(
        `@@/ERROR: Source Environment: '${sourceEnvironmentId}' does not exist.`
      )
    return
  }

  // Add Check destination environment alias exists
  if (!(await space.getEnvironment(destinationAliasId))) {
    console.error(
      `@@ERROR: Destination Environment alias '${destinationAliasId}' already exists!`
    )
    return
  }

  await space
    .getEnvironmentAlias(destinationAliasId)
    .then(alias => {
      alias.environment.sys.id = sourceEnvironmentId
      return alias.update()
    })
    .then(
      alias =>
        verbosityLevel > 2 &&
        console.log(
          '##/INFO: Alias ' +
            destinationAliasId +
            ' update to ' +
            sourceEnvironmentId +
            ' Environment.'
        )
    )
    .catch(e => verbosityLevel > 0 && console.error('@@/ERROR: ' + e))

  if (deleteOldReleases) {
    await pruneOldReleases(
      space,
      sourceEnvironmentId,
      releaseRegEx,
      verbosityLevel
    )
  }
}

async function pruneOldReleases(
  space,
  newReleaseEnvironment = null,
  releaseRegEx = 'release-[0-9]+[\\.]*[0-9]*[\\.]*[0-9]*',
  verbosityLevel = 1
) {
  verbosityLevel > 2 && console.log('##INFO: Deleting old Release Environments')

  let excludedEnvironments = ['dev', 'staging', 'uat', 'master']
  let regex = new RegExp(releaseRegEx, 'g')
  let environmentList
  let releaseList = []

  // // Get list of all environments
  await space
    .getEnvironments()
    .then(response => (environmentList = response.items))
    .catch(e => console.error('@@/ERROR: ' + e))

  verbosityLevel > 2 &&
    console.log('##/INFO: Processing the list of all environments')

  for (let i = 0; i < environmentList.length; i++) {
    if (
      environmentList[i].name.match(regex) &&
      environmentList[i].sys.aliasedEnvironment === undefined &&
      !excludedEnvironments.includes(environmentList[i].name)
    ) {
      releaseList.push(environmentList[i].name)
    } else {
      let isAliased = ''
      if (environmentList[i].sys.aliasedEnvironment) {
        isAliased = ' aliased by ' + environmentList[i].sys.id
      }
      verbosityLevel > 2 &&
        console.log(
          '##/INFO: This environment will NOT be deleted: ' +
            environmentList[i].name +
            isAliased
        )
    }
  }

  const sortedReleases = orderBy(releaseList, [], ['desc'])

  // Exclude the latest release
  let latestRelease = sortedReleases.shift()
  // That also has to match the parameter we just passed
  if (latestRelease === newReleaseEnvironment) {
    // If so, we exclude the previous release for rollback
    let beforeLastEnvironment = sortedReleases.shift()

    verbosityLevel > 2 &&
      console.log('##/INFO: List of Release environments that will be kept:')
    verbosityLevel > 2 && console.log(latestRelease)
    verbosityLevel > 2 && console.log(beforeLastEnvironment)
    verbosityLevel > 2 &&
      console.log('##/INFO: List of Release environments that will be deleted:')

    let environmentsToBeDeleted = []
    // And then we can remove all the older releases (if any)
    for (let j = 0; j < sortedReleases.length; j++) {
      environmentsToBeDeleted.push(sortedReleases[j])
    }

    if (environmentsToBeDeleted.length > 0) {
      for (let z = 0; z < environmentsToBeDeleted.length; z++) {
        // Actual deletion of the environment
        verbosityLevel > 1 &&
          console.log(
            '%%/DEBUG: Environment ' +
              environmentsToBeDeleted[z] +
              ' is going to be deleted!'
          )
        await deleteEnvironment(
          await getEnvironment(environmentsToBeDeleted[z]),
          verbosityLevel
        )
      }
    } else {
      verbosityLevel > 2 && console.log('##/INFO: Nothing to delete')
    }
  } else {
    verbosityLevel > 2 &&
      console.log(
        '##/INFO: The created Release environment is not the latest Release'
      )
    verbosityLevel > 2 &&
      console.log('##/INFO: We are not gonna delete any environment!')
  }
}
