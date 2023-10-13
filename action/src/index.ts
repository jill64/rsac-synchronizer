import { attempt } from '@jill64/attempt'
import { readFile } from 'fs/promises'
import mergeWith from 'lodash/mergeWith.js'
import { action } from 'octoflare/action'
import { array, isObject, scanner, string } from 'typescanner'
import yaml from 'yaml'
import { updateBranchProtection } from './updateBranchProtection.js'

action(async ({ octokit, core, github, owner, repo }) => {
  const token = core.getInput('token')
  const rootYml = core.getInput('root-config')

  const rootConfig = attempt(() => yaml.parse(rootYml) as unknown, null)

  const repoConfig = await attempt(async () => {
    const buff = await readFile('rsac.yml')
    const str = buff.toString()
    return yaml.parse(str) as unknown
  }, null)

  const config =
    rootConfig || repoConfig
      ? mergeWith({}, rootConfig, repoConfig, (a: unknown, b: unknown) => {
          if (Array.isArray(a) && Array.isArray(b)) {
            return [...new Set([...a, ...b])]
          }
        })
      : null

  if (!isObject(config)) {
    console.log('No configuration file found')
    return
  }

  const rsac_token = core.getInput('rsac_token')

  if (repo === '.github' && rsac_token) {
    const { data: repository } = await octokit.rest.repos.get({
      owner,
      repo
    })

    const { data: allRepo } =
      repository.owner.type !== 'Organization'
        ? await octokit.rest.repos.listForUser({
            username: owner
          })
        : await octokit.rest.repos.listForOrg({
            org: owner
          })

    const rsac_kit = github.getOctokit(rsac_token)

    const result = allRepo.map((repo) =>
      rsac_kit.rest.actions.createWorkflowDispatch({
        owner: 'jill64',
        repo: 'rsac-synchronizer',
        workflow_id: 'synchronize.yml',
        ref: 'main',
        inputs: {
          token,
          owner: repo.owner.login,
          repo: repo.name,
          ref: repo.default_branch
        }
      })
    )

    await Promise.all(result)


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
})
