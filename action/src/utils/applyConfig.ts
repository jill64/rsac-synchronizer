import { ActionOctokit } from 'octoflare/action'
import { array, isObject, scanner, string } from 'typescanner'
import { updateBranchProtection } from '../updateBranchProtection.js'

export const applyConfig = async ({
  octokit,
  owner,
  repo,
  config
}: {
  octokit: ActionOctokit
  config: unknown
  repo: string
  owner: string
}) => {
  if (!isObject(config)) {
    console.log('No configuration file found')
    return
  }

  const existRepository = scanner({
    repository: isObject
  })

  if (existRepository(config)) {
    await octokit.rest.repos.update({
      owner,
      repo,
      ...config.repository
    })
  }

  const existBranchProtection = scanner({
    'branch-protection': isObject
  })

  if (existBranchProtection(config)) {
    await updateBranchProtection({
      octokit,
      owner,
      repo,
      protections: config['branch-protection']
    })
  }

  const existTopics = scanner({
    topics: array(string)
  })

  if (existTopics(config)) {
    await octokit.rest.repos.replaceAllTopics({
      owner,
      repo,
      names: config.topics
    })
  }

  const existWfPermission = scanner({
    'default-workflow-permissions': isObject
  })

  if (existWfPermission(config)) {
    await octokit.rest.actions.setGithubActionsDefaultWorkflowPermissionsRepository(
      {
        owner,
        repo,
        ...config['default-workflow-permissions']
      }
    )
  }
}
